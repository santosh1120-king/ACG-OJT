from models.agent import TaskPlanItem


class ReviewerAgent:
    """Write the final high-level result after every planned task has finished."""
    async def review(self, tasks: list[TaskPlanItem]) -> str:
        failed = [task.title for task in tasks if task.status.value != "passed"]
        if failed:
            return f"Review blocked: incomplete tasks: {', '.join(failed)}."
        return "All planned tasks passed sandbox validation. Human approval remains required before release."
