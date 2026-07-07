from fastapi import APIRouter, HTTPException
from app.db.database import get_supabase

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("")
async def get_jobs():
    supabase = get_supabase()
    result = supabase.table("jobs").select("*").order("created_at", desc=True).execute()
    return {"jobs": result.data}


@router.get("/{job_id}")
async def get_job(job_id: str):
    supabase = get_supabase()
    result = supabase.table("jobs").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job": result.data[0]}
