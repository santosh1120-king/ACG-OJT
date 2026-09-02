from fastapi import APIRouter, HTTPException, status, Depends
from models.user import TokenResponse, UserResponse
from services.google import verify_google_token
from services.jwt import create_access_token, get_current_user
from database import get_supabase
from datetime import datetime, timezone

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=TokenResponse)
async def google_login(token: str):
    try:
        google_user = await verify_google_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    supabase = get_supabase()

    existing = supabase.table("users").select("*").eq("google_id", google_user["google_id"]).execute()

    if existing.data:
        user_data = existing.data[0]
    else:
        new_user = {
            "email": google_user["email"],
            "name": google_user["name"],
            "avatar": google_user["avatar"],
            "google_id": google_user["google_id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        result = supabase.table("users").insert(new_user).execute()
        user_data = result.data[0]

    access_token = create_access_token({"user_id": user_data["id"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            name=user_data["name"],
            avatar=user_data.get("avatar"),
            created_at=user_data["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        avatar=current_user.get("avatar"),
        created_at=current_user["created_at"],
    )
