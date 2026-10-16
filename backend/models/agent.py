from datetime import datetime
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class RunStatus(str, Enum):
    """The possible overall stages of an AI workflow."""
    PLANNING = "planning"
    AWAITING_APPROVAL = "awaiting_approval"
    RUNNING = "running"
    FAILED = "failed"
    COMPLETED = "completed"
    STOPPED = "stopped"


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"


class TaskPlanItem(BaseModel):
    """One small piece of work proposed by the planning agent."""
    task_id: str
    title: str
    description: str
    dependencies: list[str] = Field(default_factory=list)
    priority: int = Field(default=1, ge=1, le=5)
    acceptance_criteria: list[str] = Field(default_factory=list)
    estimated_complexity: str = "medium"
    validation_commands: list[str] = Field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING


class StartRunRequest(BaseModel):
    """The information the frontend supplies to start an AI workflow."""
    project_id: str | None = None
    requirement: str = Field(min_length=10, max_length=20000)
    repository_path: str = "/workspace"


class ApprovalRequest(BaseModel):
    approved: bool
    notes: str | None = None


class CommandResult(BaseModel):
    command: str
    stdout: str = ""
    stderr: str = ""
    exit_code: int | None = None
    duration_ms: int = 0
    timed_out: bool = False


class ValidationResult(BaseModel):
    passed: bool
    results: list[CommandResult] = Field(default_factory=list)
    summary: str


class AgentEvent(BaseModel):
    run_id: str
    event_type: str
    agent: str
    message: str
    payload: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentRunResponse(BaseModel):
    """The current state of an AI workflow, returned to the frontend."""
    id: str
    status: RunStatus
    current_agent: str
    current_task_id: str | None = None
    retry_count: int = 0
    approval_state: str = "pending"
    tasks: list[TaskPlanItem] = Field(default_factory=list)
    review_summary: str | None = None
