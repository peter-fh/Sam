import asyncio
from asyncio.events import AbstractEventLoop
import threading
from collections.abc import Coroutine
from typing import Any


# Avoiding asyncio.run for each async call avoids the overhead of creating a new event loop per call
class AsyncRunner:
    def __init__(self) -> None:
        self._loop: AbstractEventLoop = asyncio.new_event_loop()
        self._thread: threading.Thread = threading.Thread(
            target=self._run_loop, name="async-runner", daemon=True
        )
        self._thread.start()

    def _run_loop(self) -> None:
        asyncio.set_event_loop(self._loop)
        self._loop.run_forever()

    def fire_and_forget(
        self,
        coro: Coroutine[Any, Any, Any],
    ) -> None:
        _ = asyncio.run_coroutine_threadsafe(coro, self._loop)

    def run(
        self,
        coro: Coroutine[Any, Any, Any],
        timeout: float | None = None,
    ) -> Any:
        fut = asyncio.run_coroutine_threadsafe(coro, self._loop)
        return fut.result(timeout=timeout)
