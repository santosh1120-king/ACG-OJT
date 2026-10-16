import json
from models.agent import TaskPlanItem
from config import settings


class PlannerAgent:
    """Turn a broad user request into small, ordered coding tasks."""
    async def plan(self, requirement: str) -> list[TaskPlanItem]:
        # Use OpenAI when configured; otherwise keep the workflow usable with one fallback task.
        if settings.openai_api_key:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.openai_api_key)
            response = await client.chat.completions.create(
                model=settings.openai_model,
                response_format={"type": "json_object"},
                messages=[{"role": "system", "content": "Return JSON with a tasks array. Every task needs task_id, title, description, dependencies, priority, acceptance_criteria, estimated_complexity, validation_commands. Produce small ordered coding tasks."}, {"role": "user", "content": requirement}],
            )
            data = json.loads(response.choices[0].message.content or "{}")
            return [TaskPlanItem(**task) for task in data.get("tasks", [])]
        return [TaskPlanItem(task_id="task-1", title="Implement requested change", description=requirement,
                             acceptance_criteria=["Implementation satisfies the provided requirement"],
                             validation_commands=["python -m compileall ."])]
