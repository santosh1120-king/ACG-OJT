# Import Pydantic's base class for validated API data structures.
from pydantic import BaseModel
# Import Optional because an avatar image may be missing.
from typing import Optional


class UserResponse(BaseModel):
    """The safe user details sent back to the frontend."""
    # The unique database ID for this user.
    id: str
    # The user's email address from Google.
    email: str
    # The display name shown in the application.
    name: str
    # The optional web address of the user's Google profile image.
    avatar: Optional[str] = None
    # The time when this user account was first created.
    created_at: str


class TokenResponse(BaseModel):
    """The response returned immediately after a successful login."""
    # The signed token the browser includes with later protected requests.
    access_token: str
    # The standard token type expected in the Authorization header.
    token_type: str = "bearer"
    # The safe profile information displayed by the frontend.
    user: UserResponse
