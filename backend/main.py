# Import the library that creates this Python web API.
from fastapi import FastAPI
# Import the browser-security middleware needed by a separate frontend server.
from fastapi.middleware.cors import CORSMiddleware
# Import the login-related URLs and rename the router to make its purpose clear here.
from routes.auth import router as auth_router
# Import the URLs used to start and monitor agent runs.
from routes.agent_runs import router as agent_runs_router
# Import the URLs that supply data for the dashboard.
from routes.dashboard import router as dashboard_router
# Import Python's built-in logging tool for server messages.
import logging

# Create the single FastAPI application that Uvicorn starts.
app = FastAPI(title="ACG OJT API")

# Allow the local React development servers to call this API from a browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach the login URLs, such as `/auth/google`, to the main application.
app.include_router(auth_router)
# Attach the agent-run URLs, such as `/agent-runs`, to the main application.
app.include_router(agent_runs_router)
# Attach the dashboard URLs, such as `/api/projects`, to the main application.
app.include_router(dashboard_router)

# Configure the standard format used for backend log messages.
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


# A simple health-check URL for confirming that the API is running.
@app.get("/")
# This function runs when someone opens the root API URL.
async def root():
    # Return JSON that confirms the server is available.
    return {"message": "ACG OJT API is running"}
