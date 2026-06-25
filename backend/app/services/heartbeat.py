from __future__ import annotations

import logging
import threading
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

from app.core.config import settings


logger = logging.getLogger("app.heartbeat")

_heartbeat_thread: threading.Thread | None = None
_stop_event = threading.Event()


def _resolve_health_url() -> str | None:
    if not settings.app_public_url:
        return None

    normalized = settings.app_public_url.strip()
    parsed = urlparse(normalized)

    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        if normalized.startswith("//"):
            normalized = f"https:{normalized}"
        else:
            normalized = f"https://{normalized.lstrip('/')}"

    return f"{normalized.rstrip('/')}/health"


def _ping_healthcheck(health_url: str) -> None:
    request = Request(
        health_url,
        headers={
            "User-Agent": "bazar-de-tudo-heartbeat/1.0",
            "Accept": "application/json",
        },
        method="GET",
    )

    try:
        with urlopen(request, timeout=30) as response:
            logger.info("[heartbeat] ping success -> %s (%s)", health_url, response.status)
    except URLError as exc:
        logger.warning("[heartbeat] ping failed -> %s (%s)", health_url, exc)
    except Exception as exc:  # noqa: BLE001
        logger.exception("[heartbeat] ping error -> %s (%s)", health_url, exc)


def _heartbeat_loop() -> None:
    health_url = _resolve_health_url()
    if not health_url:
        logger.info("[heartbeat] skipped: APP_PUBLIC_URL not configured")
        return

    interval_seconds = settings.heartbeat_interval_minutes * 60
    logger.info("[heartbeat] started -> %s (every %s minutes)", health_url, settings.heartbeat_interval_minutes)

    while not _stop_event.is_set():
        _ping_healthcheck(health_url)
        if _stop_event.wait(interval_seconds):
            break

    logger.info("[heartbeat] stopped")


def start_heartbeat() -> None:
    global _heartbeat_thread

    if not settings.heartbeat_enabled:
        logger.info("[heartbeat] disabled by configuration")
        return

    if _heartbeat_thread and _heartbeat_thread.is_alive():
        logger.info("[heartbeat] already running")
        return

    _stop_event.clear()
    _heartbeat_thread = threading.Thread(target=_heartbeat_loop, name="heartbeat-thread", daemon=True)
    _heartbeat_thread.start()


def stop_heartbeat() -> None:
    _stop_event.set()
    if _heartbeat_thread and _heartbeat_thread.is_alive():
        _heartbeat_thread.join(timeout=5)
