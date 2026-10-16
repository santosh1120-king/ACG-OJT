# Autonomous Coding Agent setup

Set these backend environment variables before starting the API:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=
SUPABASE_KEY=
AGENT_WORKSPACE=/absolute/path/to/target/repository
DOCKER_IMAGE=acg-agent-sandbox:latest
AGENT_MAX_RETRIES=2
AGENT_COMMAND_TIMEOUT_SECONDS=120
```

Build the isolated execution image from the repository root:

```sh
docker build -f Dockerfile.agent-sandbox -t acg-agent-sandbox:latest .
```

Apply `database/schema.sql` in Supabase. The API keeps a short-lived in-memory copy of active runs for WebSocket delivery; Supabase stores the durable run, plan, action, and approval records.

The executor invokes Docker with no network, CPU and memory limits, and a bind mount only for `AGENT_WORKSPACE`. Generated commands are never run directly on the API host.
