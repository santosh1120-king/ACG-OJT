from google.oauth2 import id_token
from google.auth.transport import requests
from config import settings


async def verify_google_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), settings.google_client_id
        )
        return {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo["name"],
            "avatar": idinfo.get("picture", ""),
        }
    except Exception as e:
        raise ValueError(f"Invalid Google token: {str(e)}")
