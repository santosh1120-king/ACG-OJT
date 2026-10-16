# Code Commenting Inventory

This inventory was created before further source edits, as requested. Status is based on the repository contents on 2026-10-16.

## Exclusion rules

The root `.gitignore` hides `backend/venv/`, `frontend/node_modules/`, build output, local environment files, Python cache files, IDE files, and operating-system files. The repository also contains `backend/.venv313/`, which is not ignored but is a copied Python virtual environment. It is third-party dependency code, not application code, and is excluded from editing.

| File/group | Format | Purpose | Safe to comment | Status | Reason |
| --- | --- | --- | --- | --- | --- |
| `backend/.env`, `frontend/.env` | Environment settings | Local secrets/configuration | No | Excluded | Must not change values or expose secrets. |
| `backend/venv/`, `backend/.venv313/`, `frontend/node_modules/` | Third-party dependencies | Installed packages | No | Excluded | Generated/vendor code, not authored project code. |
| `**/__pycache__/`, `*.pyc` | Python bytecode | Runtime cache | No | Excluded | Generated binary files. |
| `frontend/dist/` | Built frontend | Production build output | No | Excluded | Generated from `frontend/src/`. |
| `frontend/vite.config.js.timestamp-*.mjs` | Vite cache | Temporary Vite configuration output | No | Excluded | Generated cache files. |
| `*.log` | Logs | Previous server output | No | Excluded | Generated runtime records. |
| `frontend/package-lock.json` | Lockfile | Exact dependency versions | No | Excluded | JSON has no comments and should not be changed. |

## Project files

| File | Format | Purpose | Safe to comment | Status |
| --- | --- | --- | --- | --- |
| `.gitignore` | Git config | Excludes generated/local files from Git | No | Excluded |
| `.kilo/.gitignore` | Git config | Tool-specific ignore rules | No | Excluded |
| `Dockerfile.agent-sandbox` | Dockerfile | Builds the isolated command container | Yes | In progress |
| `CODEBASE_GUIDE.md` | Markdown | Existing high-level project guide | Yes | Completed |
| `CODE_COMMENTING_INVENTORY.md` | Markdown | This file inventory | Yes | Completed |
| `backend/AGENT_SETUP.md` | Markdown | Setup instructions for agent workflow | Yes | Pending |
| `backend/config.py` | Python | Reads backend configuration values | Yes | In progress |
| `backend/database.py` | Python | Supabase HTTP data-access helper | Yes | Pending |
| `backend/main.py` | Python | FastAPI application entry point | Yes | In progress |
| `backend/requirements.txt` | Text | Python dependency list | No | Excluded |
| `backend/supabase_setup.sql` | SQL | User database setup script | Yes | Pending |
| `backend/routes/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/routes/auth.py` | Python | Google login and current-user endpoints | Yes | In progress |
| `backend/routes/agent_runs.py` | Python | Agent workflow endpoints and event stream | Yes | In progress |
| `backend/routes/dashboard.py` | Python | Dashboard data endpoints | Yes | In progress |
| `backend/services/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/services/google.py` | Python | Google credential verification | Yes | In progress |
| `backend/services/jwt.py` | Python | Login-token creation and verification | Yes | In progress |
| `backend/models/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/models/user.py` | Python | User/login response data models | Yes | In progress |
| `backend/models/agent.py` | Python | Agent workflow data models | Yes | Pending |
| `backend/agent/common/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/common/events.py` | Python | Live workflow event delivery | Yes | In progress |
| `backend/agent/coder/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/coder/coder.py` | Python | OpenAI patch preparation | Yes | Completed |
| `backend/agent/debugger/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/debugger/debugger.py` | Python | Failed-validation summary | Yes | In progress |
| `backend/agent/executor/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/executor/command_policy.py` | Python | Unsafe-command checks | Yes | In progress |
| `backend/agent/executor/executor.py` | Python | Sandboxed Docker command runner | Yes | In progress |
| `backend/agent/memory/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/memory/context_manager.py` | Python | Workflow persistence helper | Yes | In progress |
| `backend/agent/orchestrator/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/orchestrator/orchestrator.py` | Python | Coordinates the complete workflow | Yes | In progress |
| `backend/agent/orchestrator/state.py` | Python | In-memory active-run storage | Yes | In progress |
| `backend/agent/planner/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/planner/planner.py` | Python | Creates implementation task plans | Yes | In progress |
| `backend/agent/reviewer/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/reviewer/reviewer.py` | Python | Final task-review summary | Yes | In progress |
| `backend/agent/validator/__init__.py` | Python | Package marker | Yes | Completed (empty) |
| `backend/agent/validator/validator.py` | Python | Runs task validation commands | Yes | In progress |
| `database/README.md` | Markdown | Database setup notes | Yes | Pending |
| `database/schema.sql` | SQL | Complete Supabase schema | Yes | Pending |
| `frontend/.env.example` | Environment template | Documents required frontend setting | No | Excluded |
| `frontend/index.html` | HTML | HTML page that hosts React | Yes | In progress |
| `frontend/package.json` | JSON | Frontend package scripts/dependencies | No | Excluded |
| `frontend/tailwind.config.js` | JavaScript | Tailwind file-scan configuration | Yes | In progress |
| `frontend/vite.config.js` | JavaScript | Vite development-server configuration | Yes | In progress |
| `frontend/src/main.jsx` | JSX | Browser entry point | Yes | In progress |
| `frontend/src/App.jsx` | JSX | Routes and authentication guards | Yes | In progress |
| `frontend/src/index.css` | CSS | Shared global styles | Yes | In progress |
| `frontend/src/context/AuthContext.jsx` | JSX | Shared login state | Yes | In progress |
| `frontend/src/services/api.js` | JavaScript | Shared HTTP and WebSocket API client | Yes | In progress |
| `frontend/src/services/dashboardService.js` | JavaScript | Dashboard network requests | Yes | In progress |
| `frontend/src/pages/Login.jsx` | JSX | Google sign-in screen | Yes | In progress |
| `frontend/src/pages/Dashboard.jsx` | JSX | Dashboard screen and live refresh | Yes | In progress |
| `frontend/src/pages/ProjectsPage.jsx` | JSX | Project list and creation screen | Yes | In progress |
| `frontend/src/pages/AgentRunsPage.jsx` | JSX | Start/approve/monitor agent runs | Yes | In progress |
| `frontend/src/pages/SectionPage.jsx` | JSX | Reusable placeholder page | Yes | In progress |
| `frontend/src/components/dashboard/Sidebar.jsx` | JSX | Left navigation | Yes | In progress |
| `frontend/src/components/dashboard/DashboardHeader.jsx` | JSX | Header and user status | Yes | In progress |
| `frontend/src/components/dashboard/KPIGrid.jsx` | JSX | Summary statistic cards | Yes | In progress |
| `frontend/src/components/dashboard/ActiveRuns.jsx` | JSX | Active workflow cards | Yes | In progress |
| `frontend/src/components/dashboard/ProjectGrid.jsx` | JSX | Project-card grid | Yes | In progress |
| `frontend/src/components/dashboard/ApprovalQueue.jsx` | JSX | Pending human approvals | Yes | In progress |
| `frontend/src/components/dashboard/ActivityTimeline.jsx` | JSX | Recent activity timeline | Yes | In progress |
| `frontend/src/components/dashboard/ErrorPanel.jsx` | JSX | Error cards | Yes | In progress |
| `frontend/src/components/dashboard/QuickActions.jsx` | JSX | Navigation shortcuts | Yes | In progress |
| `frontend/src/components/dashboard/AgentWorkflow.jsx` | JSX | Visual workflow progress stages | Yes | In progress |
