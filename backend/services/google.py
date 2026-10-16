import requests as req_lib
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from config import settings
import urllib3

# This local-development workaround suppresses warnings caused by disabled SSL verification.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class InsecureRequest(google_requests.Request):
    """Custom Request that disables SSL verification to fix Windows SSL issues."""

    def __init__(self):
        session = req_lib.Session()
        session.verify = False
        super().__init__(session=session)


async def verify_google_token(token: str) -> dict:
    """Ask Google to verify a login token and return the profile fields the app needs."""
    try:
        idinfo = id_token.verify_oauth2_token(
            token, InsecureRequest(), settings.google_client_id
        )
        return {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo["name"],
            "avatar": idinfo.get("picture", ""),
        }
    except Exception as e:
        raise ValueError(f"Invalid Google token: {str(e)}")
