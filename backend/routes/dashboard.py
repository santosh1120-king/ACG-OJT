import asyncio
import logging
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from services.jwt import get_current_user, decode_token
from agent.orchestrator.state import run_store
from database import get_supabase
from models.agent import RunStatus

logger = logging.getLogger(__name__)

# Dashboard endpoints share the `/api` prefix.
router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/projects")
async def get_projects(current_user: dict = Depends(get_current_user)):
    """Return saved projects, or an empty list when the database is unavailable."""
    try:
        supabase = get_supabase()
        response = supabase.table("projects").select("*").execute()
        return response.data or []
    except Exception as e:
        logger.warning(f"Failed to fetch projects from Supabase: {e}")
        return []


@router.post("/projects")
async def create_project(payload: dict, current_user: dict = Depends(get_current_user)):
    """Create a project using values sent from the browser."""
    try:
        supabase = get_supabase()
        new_project = {
            "name": payload.get("name", "New Project"),
            "repository_path": payload.get("repository_path", "/workspace"),
            "owner_id": current_user.get("sub") or current_user.get("id")
        }
        res = supabase.table("projects").insert(new_project).execute()
        return res.data[0] if res.data else new_project
    except Exception as e:
        logger.warning(f"Failed to create project in Supabase: {e}")
        return {"id": "proj-1", "name": payload.get("name", "New Project"), "repository_path": "/workspace"}


@router.get("/runs/active")
async def get_active_runs(current_user: dict = Depends(get_current_user)):
    """Convert active in-memory agent runs into JSON the dashboard can display."""
    active = []
    for run in run_store.runs.values():
        if run.status in [RunStatus.PLANNING, RunStatus.RUNNING, RunStatus.AWAITING_APPROVAL]:
            active.append({
                "id": run.id,
                "status": run.status.value,
                "current_agent": run.current_agent,
                "current_task_id": run.current_task_id,
                "retry_count": run.retry_count,
                "approval_state": run.approval_state,
                "tasks": [t.model_dump(mode="json") for t in run.tasks]
            })
    return active


@router.get("/approvals/pending")
async def get_pending_approvals(current_user: dict = Depends(get_current_user)):
    pending = []
    for run in run_store.runs.values():
        if run.status == RunStatus.AWAITING_APPROVAL:
            pending.append({
                "id": run.id,
                "status": run.status.value,
                "current_agent": run.current_agent,
                "tasks": [t.model_dump(mode="json") for t in run.tasks]
            })
    return pending


@router.get("/activity/recent")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        res = supabase.table("agent_actions").select("*").order("created_at", desc=True).limit(20).execute()
        return res.data or []
    except Exception as e:
        logger.warning(f"Failed to fetch activity: {e}")
        return []


@router.get("/errors/recent")
async def get_recent_errors(current_user: dict = Depends(get_current_user)):
    errors = []
    for run in run_store.runs.values():
        if run.status == RunStatus.FAILED:
            errors.append({
                "id": run.id,
                "status": run.status.value,
                "current_agent": run.current_agent,
                "message": f"Run {run.id} failed during {run.current_agent} execution."
            })
    return errors


@router.websocket("/ws/dashboard/events")
async def dashboard_websocket(websocket: WebSocket):
    """Keep a browser connection alive so the dashboard can detect the backend."""
    token = websocket.query_params.get("token")
    if token:
        try:
            decode_token(token)
        except Exception:
            pass
    await websocket.accept()
    try:
        while True:
            await asyncio.sleep(5)
            await websocket.send_json({"type": "ping", "message": "dashboard heart-beat"})
    except WebSocketDisconnect:
        pass
