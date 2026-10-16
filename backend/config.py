# Import the settings base class; it can read values from environment variables.
from pydantic_settings import BaseSettings
# Import the helper that reads a local `.env` file during development.
from dotenv import load_dotenv

# Load local secret/configuration values before the Settings class is created.
load_dotenv()


# Group every configurable backend value in one place.
class Settings(BaseSettings):
    # The web address of this project's Supabase database.
    supabase_url: str = ""
    # The secret Supabase key used to authenticate database requests.
    supabase_key: str = ""
    # The Google application ID used to verify Google sign-ins.
    google_client_id: str = ""
    # The secret used to sign this application's login tokens.
    jwt_secret_key: str = "your-secret-key-change-this"
    # The signing method used for those login tokens.
    jwt_algorithm: str = "HS256"
    # How many minutes a user stays signed in before needing a new token.
    access_token_expire_minutes: int = 30
    # The OpenAI key used by the planning and coding agents.
    openai_api_key: str = ""
    # The OpenAI model name used by those agents.
    openai_model: str = "gpt-4o-mini"
    # The folder made available to the isolated coding container.
    agent_workspace: str = "/workspace"
    # The Docker image used to run generated commands safely.
    docker_image: str = "acg-agent-sandbox:latest"
    # The maximum number of validation retries allowed for one run.
    agent_max_retries: int = 2
    # The longest a Docker command may run before it is stopped.
    agent_command_timeout_seconds: int = 120


# Create one shared settings object for the rest of the backend to import.
settings = Settings()
