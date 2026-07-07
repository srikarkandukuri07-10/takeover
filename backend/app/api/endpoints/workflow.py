from fastapi import APIRouter, HTTPException, Request
from app.schemas.workflow import WorkflowRequest, WorkflowResponse
from app.db.database import get_supabase
from typing import Optional

router = APIRouter(prefix="/api/workflow", tags=["workflow"])


@router.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(workflow_request: WorkflowRequest, request: Request):
    try:
        ai_service = request.app.state.ai_service
        result = await ai_service.process_event(workflow_request.event)

        return WorkflowResponse(
            id=result["workflow_id"],
            event=result["event"],
            workflow_type=result.get("workflow_type"),
            status=result["status"],
            steps=result.get("steps", []),
            summary=result.get("summary"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_workflow_history(limit: int = 10):
    supabase = get_supabase()
    result = supabase.table("workflow_logs") \
        .select("*") \
        .order("created_at", desc=True) \
        .limit(limit) \
        .execute()
    return {"workflows": result.data}


@router.get("/{workflow_id}")
async def get_workflow_status(workflow_id: str):
    supabase = get_supabase()
    workflow = supabase.table("workflow_logs").select("*").eq("id", workflow_id).execute()
    if not workflow.data:
        raise HTTPException(status_code=404, detail="Workflow not found")

    steps = supabase.table("workflow_steps").select("*").eq("workflow_id", workflow_id).order("created_at").execute()

    return {
        "workflow": workflow.data[0],
        "steps": steps.data
    }


@router.get("/status/latest")
async def get_latest_workflow_status():
    supabase = get_supabase()
    result = supabase.table("workflow_logs") \
        .select("*") \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if not result.data:
        return {"workflow": None, "steps": []}

    workflow = result.data[0]
    steps = supabase.table("workflow_steps").select("*").eq("workflow_id", workflow["id"]).order("created_at").execute()

    return {
        "workflow": workflow,
        "steps": steps.data
    }
