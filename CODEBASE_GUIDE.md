# ACG OJT Codebase Guide

This guide explains the project in plain language. Read it before opening the code: it tells you where each feature lives and what each file is responsible for.

## What this application does

This is a web application for running AI-assisted coding tasks. A user signs in with Google, creates a project, describes a software change, reviews the AI-created plan, and then allows the system to run the work in an isolated Docker container.

The project has three main parts:

1. `frontend/` is what the user sees and clicks in a browser.
2. `backend/` is the API server. It receives requests, checks who the user is, and controls the AI workflow.
3. `database/` contains the SQL instructions used to create the database tables in Supabase.

## Root folder

- `Dockerfile.agent-sandbox` creates the restricted Docker environment used to run generated commands safely.
- `.gitignore` lists files that Git should not save, such as secrets and generated files.
- `CODEBASE_GUIDE.md` is this beginner-friendly map of the project.

## Backend folder

The backend is a Python FastAPI server. FastAPI turns Python functions into web addresses (API endpoints) that the frontend can call.

- `main.py` starts the API application, permits the local frontend to call it, and connects each group of API endpoints.
- `config.py` reads settings such as database keys, Google credentials, Docker settings, and OpenAI settings from environment variables.
- `database.py` is a small helper that sends read, create, and update requests to Supabase.
- `requirements.txt` lists Python packages that must be installed before the backend can run.
- `supabase_setup.sql` is an older/minimal database setup script. The complete table design is in `database/schema.sql`.
- `AGENT_SETUP.md` explains the environment variables and Docker image needed for the autonomous-agent feature.

### `backend/routes/`

Routes are the web addresses that the frontend calls.

- `auth.py` handles Google sign-in and the `get my profile` request.
- `agent_runs.py` starts an AI run, returns its latest status, records an approval decision, and streams live run updates.
- `dashboard.py` supplies projects, active runs, approvals, activity, errors, and dashboard WebSocket heartbeats.
- `__init__.py` marks this folder as a Python package. It contains no application logic.

### `backend/services/`

Services contain reusable helpers used by more than one route.

- `jwt.py` creates and checks login tokens. A token is a small signed string that proves a user has already signed in.
- `google.py` asks Google to confirm that a login token is genuine, then extracts the user's Google ID, email, name, and avatar.
- `__init__.py` is an empty package marker.

### `backend/models/`

Models describe the shape of data accepted or returned by the API. They use Pydantic, which checks that data has the expected fields and types.

- `user.py` describes a user and the login response.
- `agent.py` describes an AI run, its tasks, command results, approvals, and status values such as `planning` or `completed`.
- `__init__.py` is an empty package marker.

### `backend/agent/`

This folder is the AI-workflow engine. The orchestrator coordinates the smaller agents below.

- `orchestrator/orchestrator.py` is the main conductor. It creates a run, asks for a plan, waits for a human approval, prepares a patch, runs validation, and records the final result.
- `orchestrator/state.py` temporarily keeps active runs in the server's memory so routes can quickly find them.
- `planner/planner.py` turns the user's request into small ordered tasks. If no OpenAI key exists, it creates one basic fallback task.
- `coder/coder.py` asks OpenAI to prepare a Git patch for one task. It only prepares the patch; it does not directly edit the user's project.
- `executor/executor.py` runs approved commands inside Docker, with no network access and CPU/memory limits.
- `executor/command_policy.py` rejects clearly unsafe commands before Docker starts.
- `validator/validator.py` runs each task's validation commands and reports whether they passed.
- `debugger/debugger.py` collects failed command output so a reviewer can understand what went wrong.
- `reviewer/reviewer.py` creates the final simple review summary after tasks finish.
- `memory/context_manager.py` saves runs, tasks, actions, and approvals to Supabase so the history survives a server restart.
- `common/events.py` passes live progress events from the workflow to connected browser windows.
- Each nested `__init__.py` is an empty package marker, not executable feature code.

## Frontend folder

The frontend is a React application built with Vite. React builds the visible screen from small reusable components.

- `package.json` names the frontend dependencies and available commands.
- `vite.config.js` configures the Vite development tool.
- `tailwind.config.js` configures Tailwind CSS utility classes used in the page markup.
- `index.html` provides the single HTML element where React places the application.
- `src/main.jsx` is the browser entry point: it mounts React into the HTML page.
- `src/App.jsx` defines every browser URL and decides which pages require a signed-in user.
- `src/index.css` holds global page styles.

### `frontend/src/context/`

- `AuthContext.jsx` stores the currently signed-in user for the whole frontend. It restores a saved login, provides `login` and `logout` actions, and checks whether a saved token is still valid.

### `frontend/src/services/`

Services keep network calls out of visual components.

- `api.js` creates the shared HTTP client, automatically attaches the login token to requests, redirects to login after an expired session, and exposes authentication and agent-run calls.
- `dashboardService.js` fetches dashboard data and opens the dashboard live-update connection.

### `frontend/src/pages/`

Pages are the main screens selected by URLs.

- `Login.jsx` displays the Google sign-in button and takes a successful user to the dashboard.
- `Dashboard.jsx` loads the dashboard data, keeps it refreshed through a WebSocket connection, and combines the dashboard components into one screen.
- `ProjectsPage.jsx` lists projects and contains the form for creating one.
- `AgentRunsPage.jsx` starts an AI run, displays its live messages, and lets a human approve or reject the generated plan.
- `SectionPage.jsx` is a reusable placeholder screen for sections that do not yet have their own full page.

### `frontend/src/components/dashboard/`

These are smaller visual pieces assembled by `Dashboard.jsx`.

- `Sidebar.jsx` is the left navigation menu.
- `DashboardHeader.jsx` shows the top bar and connection indicator.
- `KPIGrid.jsx` displays the high-level number cards.
- `ActiveRuns.jsx` displays currently running AI jobs.
- `ProjectGrid.jsx` displays project cards.
- `ApprovalQueue.jsx` displays work waiting for human review.
- `ActivityTimeline.jsx` displays recent recorded actions.
- `ErrorPanel.jsx` displays failed runs or other errors.
- `QuickActions.jsx` displays shortcut buttons.
- `AgentWorkflow.jsx` displays the workflow stages visually.

## Database folder

- `schema.sql` creates all Supabase tables used by the application: users, projects, agent runs, tasks, agent actions, and approvals. It also adds relationships and access rules between those tables.
- `README.md` gives database setup notes.

## Typical request flow

1. The browser starts at `frontend/src/main.jsx` and loads `App.jsx`.
2. A user signs in on `Login.jsx`; the request goes through `services/api.js` to `backend/routes/auth.py`.
3. The backend verifies the Google token, saves or finds the user in Supabase, and returns a login token.
4. On the dashboard, frontend services call backend dashboard routes for data.
5. When a user starts an agent run, `agent_runs.py` calls the orchestrator.
6. The orchestrator uses the planner, waits for human approval, then uses the coder, executor, validator, debugger, and reviewer in order.
7. The frontend receives live events through a WebSocket and updates the run screen.

## Files intentionally not annotated

`package-lock.json`, `server.log`, `server-error.log`, and Vite timestamp/cache files are generated by tools. They are not source code and should not be manually commented or reviewed line by line.
