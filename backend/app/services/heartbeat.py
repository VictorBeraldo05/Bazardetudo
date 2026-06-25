from __future__ import annotations

import logging
import threading
from datetime import UTC, datetime
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
    tick_at = datetime.now(UTC).isoformat()
    print(f"[heartbeat] tick -> {tick_at}", flush=True)
    logger.info("[heartbeat] tick -> %s", tick_at)
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
            print(f"[heartbeat] ping success -> {health_url} ({response.status}) at {tick_at}", flush=True)
            logger.info("[heartbeat] ping success -> %s (%s) at %s", health_url, response.status, tick_at)
    except URLError as exc:
        print(f"[heartbeat] ping failed -> {health_url} ({exc}) at {tick_at}", flush=True)
        logger.warning("[heartbeat] ping failed -> %s (%s) at %s", health_url, exc, tick_at)
    except Exception as exc:  # noqa: BLE001
        print(f"[heartbeat] ping error -> {health_url} ({exc}) at {tick_at}", flush=True)
        logger.exception("[heartbeat] ping error -> %s (%s) at %s", health_url, exc, tick_at)


def _heartbeat_loop() -> None:
    health_url = _resolve_health_url()
    if not health_url:
        print("[heartbeat] skipped: APP_PUBLIC_URL not configured", flush=True)
        logger.info("[heartbeat] skipped: APP_PUBLIC_URL not configured")
        return

    interval_seconds = settings.heartbeat_interval_minutes * 60
    print(
        f"[heartbeat] started -> {health_url} (every {settings.heartbeat_interval_minutes} minutes, interval={interval_seconds}s)",
        flush=True,
    )
    logger.info(
        "[heartbeat] started -> %s (every %s minutes, interval=%ss)",
        health_url,
        settings.heartbeat_interval_minutes,
        interval_seconds,
    )

    while not _stop_event.is_set():
        _ping_healthcheck(health_url)
        if _stop_event.wait(interval_seconds):
            break

    print("[heartbeat] stopped", flush=True)
    logger.info("[heartbeat] stopped")


def start_heartbeat() -> None:
    global _heartbeat_thread

    if not settings.heartbeat_enabled:
        print("[heartbeat] disabled by configuration", flush=True)
        logger.info("[heartbeat] disabled by configuration")
        return

    print(
        f"[heartbeat] configuration -> enabled={settings.heartbeat_enabled}, interval_minutes={settings.heartbeat_interval_minutes}, app_public_url={settings.app_public_url}",
        flush=True,
    )
    logger.info(
        "[heartbeat] configuration -> enabled=%s, interval_minutes=%s, app_public_url=%s",
        settings.heartbeat_enabled,
        settings.heartbeat_interval_minutes,
        settings.app_public_url,
    )

    if _heartbeat_thread and _heartbeat_thread.is_alive():
        print("[heartbeat] already running", flush=True)
        logger.info("[heartbeat] already running")
        return

    _stop_event.clear()
    _heartbeat_thread = threading.Thread(target=_heartbeat_loop, name="heartbeat-thread", daemon=True)
    _heartbeat_thread.start()


def stop_heartbeat() -> None:
    _stop_event.set()
    if _heartbeat_thread and _heartbeat_thread.is_alive():
        _heartbeat_thread.join(timeout=5)
