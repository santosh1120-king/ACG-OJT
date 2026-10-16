# Import FastAPI tools for protected endpoints and clear error responses.
from fastapi import Depends, HTTPException, status
# Import the expected Bearer-token format from FastAPI.
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# Import JWT encoding, decoding, and its invalid-token error type.
from jose import JWTError, jwt
# Import the secret, algorithm, and token-lifetime settings.
from config import settings
# Import the database helper used to load the signed-in user's details.
from database import get_supabase

# Tell FastAPI that protected endpoints expect a Bearer token in the request headers.
security = HTTPBearer()


def create_access_token(data: dict) -> str:
    """Create a signed, time-limited login token from user information."""
    # Copy the caller's data so the original dictionary is not changed.
    to_encode = data.copy()
    # Import time helpers only when this function needs them.
    from datetime import datetime, timedelta
    # Calculate exactly when this login token should expire.
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    # Add the standard expiration field required by JWT.
    to_encode.update({"exp": expire})
    # Sign the data so anyone changing it later will be detected.
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """Confirm a token is genuine and return the information stored inside it."""
    try:
        # Check the signature and expiration using the same configured algorithm.
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        # Give the valid token information back to the protected endpoint.
        return payload
    except JWTError:
        # Reject malformed, changed, or expired tokens with an HTTP 401 response.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Find the signed-in user before allowing access to a protected endpoint."""
    # Decode the Bearer token that FastAPI read from the incoming request.
    payload = decode_token(credentials.credentials)
    # Read the user ID placed into the token during login.
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Get the shared database client.
    supabase = get_supabase()
    # Find the database user that matches the ID in the signed token.
    result = supabase.table("users").select("*").eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Return the first matching user because IDs are unique.
    return result.data[0]
