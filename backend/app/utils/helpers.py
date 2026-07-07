import uuid
from app.db.database import get_supabase

async def get_employee_uuid(name_or_id: str) -> str:
    if not name_or_id:
        return None
        
    # Check if already a valid UUID
    try:
        uuid.UUID(name_or_id)
        return name_or_id
    except ValueError:
        pass
        
    supabase = get_supabase()
    
    # 1. Query by employee_id code (e.g. EMP202607ADE6)
    try:
        res = supabase.table("employees").select("id").eq("employee_id", name_or_id).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception:
        pass
        
    # 2. Query by email
    try:
        res = supabase.table("employees").select("id").eq("email", name_or_id).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception:
        pass

    # 3. Query by exact full_name
    try:
        res = supabase.table("employees").select("id").eq("full_name", name_or_id).execute()
        if res.data:
            return res.data[0]["id"]
    except Exception:
        pass
        
    # 4. Query by partial name
    try:
        res = supabase.table("employees").select("id").ilike("full_name", f"%{name_or_id}%").execute()
        if res.data:
            return res.data[0]["id"]
    except Exception:
        pass
        
    return None
