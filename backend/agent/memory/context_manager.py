from datetime import datetime, timezone
from database import get_supabase


class RunRepository:
    """Save workflow history to Supabase so it remains available after a restart."""
    def __init__(self):
        self.supabase = get_supabase()

    def create_run(self, run: dict):
        self.supabase.table("agent_runs").insert(run).execute()

    def update_run(self, run_id: str, changes: dict):
        # Add the time of the update before saving the changed fields.
        changes["updated_at"] = datetime.now(timezone.utc).isoformat()
        self.supabase.table("agent_runs").update(changes).eq("id", run_id).execute()

    def save_tasks(self, run_id: str, tasks: list[dict]):
        for task in tasks:
            self.supabase.table("tasks").insert({**task, "agent_run_id": run_id}).execute()

    def save_action(self, run_id: str, agent: str, action_type: str, result: dict):
        self.supabase.table("agent_actions").insert({
            "agent_run_id": run_id, "agent": agent, "action_type": action_type, "result": result,
        }).execute()

    def save_approval(self, run_id: str, approved: bool, notes: str | None):
        self.supabase.table("approvals").insert({
            "agent_run_id": run_id, "approved": approved, "notes": notes,
        }).execute()
