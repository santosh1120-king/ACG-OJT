from models.agent import AgentRunResponse


class RunStore:
    """Temporarily hold active runs in server memory for quick API lookups."""
    def __init__(self):
        self.runs: dict[str, AgentRunResponse] = {}

    def get(self, run_id: str) -> AgentRunResponse | None:
        return self.runs.get(run_id)

    def put(self, run: AgentRunResponse):
        self.runs[run.id] = run


run_store = RunStore()
