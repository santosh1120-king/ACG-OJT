import asyncio
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from models.agent import AgentRunResponse, ApprovalRequest, StartRunRequest
from services.jwt import get_current_user, decode_token
from agent.common.events import event_broker
from agent.orchestrator.orchestrator import orchestrator
from agent.orchestrator.state import run_store
from config import settings

# Every agent-run endpoint starts with `/agent-runs`.
router = APIRouter(prefix="/agent-runs", tags=["agent-runs"])


@router.post("", response_model=AgentRunResponse, status_code=201)
async def start_agent_run(request: StartRunRequest, current_user: dict = Depends(get_current_user)):
    """Create a new AI workflow from the user's written requirement."""
    return await orchestrator.start(request)


@router.get("/{run_id}", response_model=AgentRunResponse)
async def get_agent_run(run_id: str, current_user: dict = Depends(get_current_user)):
    run = run_store.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return run


@router.post("/{run_id}/approval", response_model=AgentRunResponse)
async def approve_agent_run(run_id: str, approval: ApprovalRequest, current_user: dict = Depends(get_current_user)):
    """Record a human decision, then continue or stop an awaiting run."""
    run = await orchestrator.approve(run_id, approval, settings.agent_workspace)
    if not run:
        raise HTTPException(status_code=409, detail="Run is not awaiting approval")
    return run


@router.websocket("/{run_id}/events")
async def agent_run_events(websocket: WebSocket, run_id: str):
    """Stream live workflow events to one authenticated browser tab."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return
    try:
        decode_token(token)
    except HTTPException:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    queue = event_broker.subscribe(run_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event.model_dump(mode="json"))
    except WebSocketDisconnect:
        pass
    finally:
        event_broker.unsubscribe(run_id, queue)

