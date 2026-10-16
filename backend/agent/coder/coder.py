# Import Python's JSON tool so text returned by OpenAI can become Python data.
import json
# Import Path, a safer and clearer way to work with folders and files.
from pathlib import Path
# Import application settings, including the OpenAI key and selected model name.
from config import settings
# Import the data shape that describes one planned coding task.
from models.agent import TaskPlanItem


# Define the part of the system responsible for asking OpenAI to write a code patch.
class CoderAgent:
    # Explain the job of this class in one short sentence for other developers.
    """Ask the model to prepare a reviewable Git patch for one task."""

    # Collect a small sample of project files that helps the model understand the existing code.
    def _context(self, repository_path: str) -> str:
        # Convert the text folder location into a Path object with useful file-search methods.
        root = Path(repository_path)
        # Search every item below the project folder, keep normal files, ignore Git's internal files,
        # ignore files larger than 50,000 bytes, and keep only the first 20 safe files.
        files = [
            path
            for path in root.rglob("*")
            if path.is_file() and ".git" not in path.parts and path.stat().st_size < 50000
        ][:20]
        # Read each chosen file and join them into one labelled text block for the OpenAI request.
        # `errors='ignore'` prevents an unusual file encoding from stopping the whole agent run.
        return "\n\n".join(
            f"--- {path.relative_to(root)} ---\n{path.read_text(errors='ignore')}"
            for path in files
        )

    # Prepare a proposed code change for one task without directly changing the user's files.
    async def prepare(self, task: TaskPlanItem, repository_path: str) -> dict:
        # Stop safely when no OpenAI key has been configured for this backend.
        if not settings.openai_api_key:
            # Return the same data shape as a normal result, but with an empty patch.
            return {
                "task_id": task.task_id,
                "summary": "OpenAI is not configured; no implementation patch was generated.",
                "modified_files": [],
                "patch": "",
            }

        # Import the asynchronous OpenAI client only when the application is configured to use it.
        from openai import AsyncOpenAI

        # Create a client that authenticates requests using the configured secret key.
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        # Ask the selected model to return a structured JSON response instead of normal chat text.
        response = await client.chat.completions.create(
            # Use the model name selected in the application's settings.
            model=settings.openai_model,
            # Require valid JSON so the program can read the result predictably.
            response_format={"type": "json_object"},
            # Give the model both operating rules and the specific task/project context.
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a surgical coding agent. Return JSON with summary, modified_files "
                        "and patch. patch must be a unified git diff only; modify only files "
                        "needed for the task."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Task: {task.model_dump_json()}\nRepository context:\n"
                        f"{self._context(repository_path)}"
                    ),
                },
            ],
        )
        # Read the model's text; use an empty JSON object if the response unexpectedly has no content.
        result = json.loads(response.choices[0].message.content or "{}")
        # Return only the fields the orchestrator needs to display and apply the proposed patch.
        return {
            "task_id": task.task_id,
            "summary": result.get("summary", "Patch prepared."),
            "modified_files": result.get("modified_files", []),
            "patch": result.get("patch", ""),
        }
