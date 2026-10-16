import asyncio
from collections import defaultdict
from models.agent import AgentEvent


class EventBroker:
    """Keep a list of browser listeners for each run and deliver live updates to them."""
    def __init__(self):
        self._subscribers: dict[str, set[asyncio.Queue]] = defaultdict(set)

    async def publish(self, event: AgentEvent):
        # Put the same event into every queue listening to this run.
        for queue in list(self._subscribers[event.run_id]):
            await queue.put(event)

    def subscribe(self, run_id: str) -> asyncio.Queue:
        # Create a private waiting line for one browser connection.
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[run_id].add(queue)
        return queue

    def unsubscribe(self, run_id: str, queue: asyncio.Queue):
        self._subscribers[run_id].discard(queue)


event_broker = EventBroker()
