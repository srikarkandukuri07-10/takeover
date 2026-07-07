from fastapi import APIRouter, HTTPException
from app.db.database import get_supabase
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, UserProfile
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register")
async def register(user: UserCreate):
    supabase = get_supabase()
    try:
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password,
        })

        profile_id = str(uuid.uuid4())
        profile_data = {
            "id": profile_id,
            "user_id": auth_response.user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "created_at": datetime.utcnow().isoformat()
        }
        supabase.table("profiles").insert(profile_data).execute()

        return {
            "message": "User registered successfully",
            "user_id": auth_response.user.id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(credentials: UserLogin):
    supabase = get_supabase()
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password,
        })

        profile_result = supabase.table("profiles").select("*").eq("user_id", auth_response.user.id).execute()
        profile = profile_result.data[0] if profile_result.data else {}

        return TokenResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            user=UserProfile(
                id=auth_response.user.id,
                email=auth_response.user.email,
                full_name=profile.get("full_name", ""),
                role=profile.get("role", "employee"),
            )
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/me")
async def get_current_user():
    return {"message": "User profile endpoint"}
