import shlex


class CommandPolicy:
    """Reject command text that is empty, malformed, or clearly unsafe for this workflow."""
    blocked_tokens = {"rm -rf", "sudo", "--privileged", "docker", "curl", "wget", "nc ", "ssh "}

    @classmethod
    def validate(cls, command: str) -> str | None:
        # Return a human-readable reason when a command should not run.
        normalized = command.lower().strip()
        if not normalized:
            return "Command cannot be empty."
        if any(token in normalized for token in cls.blocked_tokens):
            return "Command violates sandbox policy."
        try:
            shlex.split(command)
        except ValueError:
            return "Command has invalid shell syntax."
        return None
