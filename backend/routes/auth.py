import httpx
from fastapi import APIRouter, HTTPException, status, Depends
from models.user import TokenResponse, UserResponse
from services.google import verify_google_token
from services.jwt import create_access_token, get_current_user
from database import get_supabase
from datetime import datetime, timezone

# Every endpoint in this file begins with `/auth`.
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=TokenResponse)
async def google_login(token: str):
    """Sign in with Google, creating a database user the first time they visit."""
    try:
        google_user = await verify_google_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    # Use the shared database connection to look up or create the user.
    supabase = get_supabase()

    try:
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
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="User database is unavailable. Check SUPABASE_URL and SUPABASE_KEY.",
        ) from error

    # Give the browser a short-lived token it can use for later protected requests.
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
    """Return the profile of the user whose token FastAPI has already checked."""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        avatar=current_user.get("avatar"),
        created_at=current_user["created_at"],
    )
