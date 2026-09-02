from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    google_client_id: str = ""
    jwt_secret_key: str = "your-secret-key-change-this"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30


settings = Settings()
