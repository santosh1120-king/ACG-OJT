import asyncio
import logging
from uuid import uuid4
from models.agent import AgentEvent, AgentRunResponse, ApprovalRequest, RunStatus, StartRunRequest, TaskStatus
from agent.common.events import event_broker
from agent.coder.coder import CoderAgent
from agent.debugger.debugger import DebuggerAgent
from agent.executor.executor import DockerExecutor
from agent.memory.context_manager import RunRepository
from agent.planner.planner import PlannerAgent
from agent.reviewer.reviewer import ReviewerAgent
from agent.validator.validator import ValidatorAgent
from agent.orchestrator.state import run_store
from config import settings

logger = logging.getLogger(__name__)


class Orchestrator:
    """Coordinate planning, approval, code preparation, validation, and final review."""
    def __init__(self):
        self.planner = PlannerAgent()
        self.coder = CoderAgent()
        self.executor = DockerExecutor()
        self.validator = ValidatorAgent(self.executor)
        self.debugger = DebuggerAgent()
        self.reviewer = ReviewerAgent()
        self.repository = RunRepository()

    async def _emit(self, run: AgentRunResponse, agent: str, message: str, **payload):
        # Update the run, notify connected browsers, and try to save an audit record.
        run.current_agent = agent
        event = AgentEvent(run_id=run.id, event_type="agent_transition", agent=agent, message=message, payload=payload)
        logger.info("run=%s agent=%s %s", run.id, agent, message)
        await event_broker.publish(event)
        try:
            self.repository.update_run(run.id, {"status": run.status.value, "current_agent": agent,
                                                "current_task_id": run.current_task_id, "retry_count": run.retry_count,
                                                "approval_state": run.approval_state})
            self.repository.save_action(run.id, agent, "transition", event.model_dump(mode="json"))
        except Exception:
            logger.exception("Could not persist agent event for run %s", run.id)

    async def start(self, request: StartRunRequest) -> AgentRunResponse:
        # Return quickly to the browser while the slower planning work runs in the background.
        run = AgentRunResponse(id=str(uuid4()), status=RunStatus.PLANNING, current_agent="planner")
        run_store.put(run)
        try:
            self.repository.create_run({"id": run.id, "project_id": request.project_id, "requirement": request.requirement,
                                        "status": run.status.value, "current_agent": run.current_agent, "approval_state": "pending"})
        except Exception:
            logger.exception("Could not persist run %s", run.id)
        asyncio.create_task(self._plan(run, request))
        return run

    async def _plan(self, run: AgentRunResponse, request: StartRunRequest):
        # Generate tasks, store them, then pause until a human approves or rejects them.
        await self._emit(run, "planner", "Planning implementation tasks.")
        try:
            run.tasks = await self.planner.plan(request.requirement)
            run.status = RunStatus.AWAITING_APPROVAL
            try:
                self.repository.save_tasks(run.id, [task.model_dump(mode="json") for task in run.tasks])
            except Exception:
                logger.exception("Could not persist tasks for run %s", run.id)
            await self._emit(run, "orchestrator", "Task plan is ready for human approval.", tasks=[task.model_dump(mode="json") for task in run.tasks])
        except Exception as error:
            run.status = RunStatus.FAILED
            await self._emit(run, "orchestrator", "Planning failed.", error=str(error))

    async def approve(self, run_id: str, approval: ApprovalRequest, repository_path: str) -> AgentRunResponse | None:
        # A rejected plan stops here; an approved plan continues in a background task.
        run = run_store.get(run_id)
        if not run or run.status != RunStatus.AWAITING_APPROVAL:
            return None
        run.approval_state = "approved" if approval.approved else "rejected"
        try:
            self.repository.save_approval(run_id, approval.approved, approval.notes)
        except Exception:
            logger.exception("Could not persist approval for run %s", run_id)
        if not approval.approved:
            run.status = RunStatus.STOPPED
            await self._emit(run, "orchestrator", "Run stopped by human reviewer.")
            return run
        run.status = RunStatus.RUNNING
        asyncio.create_task(self._execute(run, repository_path))
        return run

    async def _execute(self, run: AgentRunResponse, repository_path: str):
        # Process tasks one at a time so each patch can be validated before the next task starts.
        for task in run.tasks:
            run.current_task_id = task.task_id
            task.status = TaskStatus.RUNNING
            await self._emit(run, "coder", f"Preparing task: {task.title}", task_id=task.task_id)
            code_result = await self.coder.prepare(task, repository_path)
            patch = code_result.pop("patch", "")
            await self._emit(run, "coder", code_result["summary"], result=code_result)
            if patch:
                applied = await self.executor.run("git apply --whitespace=fix -", repository_path, patch)
                await self._emit(run, "executor", "Applied generated patch inside Docker.", execution=applied.model_dump())
                if applied.exit_code != 0:
                    run.status = RunStatus.FAILED
                    await self._emit(run, "orchestrator", "Generated patch could not be applied safely.")
                    return
            else:
                await self._emit(run, "executor", "No generated patch to apply; validation will run in Docker.")
            validation = await self.validator.validate(task, repository_path)
            await self._emit(run, "validator", validation.summary, validation=validation.model_dump())
            if not validation.passed:
                while run.retry_count < settings.agent_max_retries and not validation.passed:
                    run.retry_count += 1
                    diagnosis = await self.debugger.diagnose(validation)
                    await self._emit(run, "debugger", "Validation failed; corrective patch requires human review.", diagnosis=diagnosis)
                    validation = await self.validator.validate(task, repository_path)
                if not validation.passed:
                    task.status = TaskStatus.FAILED
                    run.status = RunStatus.FAILED
                    await self._emit(run, "orchestrator", "Retry limit reached; run stopped safely.")
                    return
            task.status = TaskStatus.PASSED
        run.current_task_id = None
        await self._emit(run, "reviewer", "Reviewing completed implementation.")
        run.review_summary = await self.reviewer.review(run.tasks)
        run.status = RunStatus.COMPLETED
        await self._emit(run, "orchestrator", "Run completed; final release still requires human approval.", review_summary=run.review_summary)


orchestrator = Orchestrator()
