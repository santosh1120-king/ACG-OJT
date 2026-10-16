from models.agent import TaskPlanItem, ValidationResult
from agent.executor.executor import DockerExecutor


class ValidatorAgent:
    """Run the task's checks and summarize whether the generated work passed."""
    def __init__(self, executor: DockerExecutor):
        self.executor = executor

    async def validate(self, task: TaskPlanItem, repository_path: str) -> ValidationResult:
        # Use task-specific checks when present, otherwise compile Python files as a basic check.
        commands = task.validation_commands or ["python -m compileall ."]
        results = [await self.executor.run(command, repository_path) for command in commands]
        passed = all(result.exit_code == 0 for result in results)
        return ValidationResult(passed=passed, results=results,
                                summary="Validation passed." if passed else "Validation failed; debug review required.")
