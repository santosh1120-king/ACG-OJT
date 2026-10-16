import asyncio
import time
from config import settings
from models.agent import CommandResult
from agent.executor.command_policy import CommandPolicy


class DockerExecutor:
    """Run approved commands in a limited Docker container instead of on the API computer."""
    async def run(self, command: str, repository_path: str, input_text: str | None = None) -> CommandResult:
        # Check basic safety before starting Docker.
        violation = CommandPolicy.validate(command)
        if violation:
            return CommandResult(command=command, stderr=violation, exit_code=126)

        # Disable network access and limit resources while mounting only the chosen repository.
        docker_command = [
            "docker", "run", "--rm", "--network", "none", "--memory", "1g",
            "--cpus", "1", "-v", f"{repository_path}:/workspace", "-w", "/workspace",
            settings.docker_image, "sh", "-lc", command,
        ]
        started = time.monotonic()
        try:
            process = await asyncio.create_subprocess_exec(
                *docker_command,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(
                process.communicate(input_text.encode() if input_text else None), timeout=settings.agent_command_timeout_seconds
            )
            return CommandResult(command=command, stdout=stdout.decode(), stderr=stderr.decode(),
                                 exit_code=process.returncode, duration_ms=int((time.monotonic() - started) * 1000))
        except asyncio.TimeoutError:
            process.kill()
            await process.wait()
            return CommandResult(command=command, stderr="Docker command timed out.", exit_code=124,
                                 timed_out=True, duration_ms=int((time.monotonic() - started) * 1000))
        except FileNotFoundError:
            return CommandResult(command=command, stderr="Docker is not installed or unavailable.", exit_code=127,
                                 duration_ms=int((time.monotonic() - started) * 1000))
