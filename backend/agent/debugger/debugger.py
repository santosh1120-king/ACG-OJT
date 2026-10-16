from models.agent import ValidationResult


class DebuggerAgent:
    """Collect failed command output for the next human or automated review."""
    async def diagnose(self, validation: ValidationResult) -> dict:
        failures = [result for result in validation.results if result.exit_code != 0]
        return {"summary": "Review the failed sandbox command output and apply a minimal corrective patch.",
                "failures": [{"command": item.command, "stderr": item.stderr, "stdout": item.stdout} for item in failures]}
