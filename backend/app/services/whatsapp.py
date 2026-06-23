from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import settings


logger = logging.getLogger("app.whatsapp")


@dataclass
class WhatsAppMessage:
    phone: str
    text: str
    image_url: str | None = None


@dataclass
class WhatsAppSendResult:
    provider: str
    status: str
    target: str
    provider_message_id: str | None = None
    payload: dict | None = None


class WhatsAppNotificationService:
    def send_product_broadcast(self, message: WhatsAppMessage) -> dict[str, str]:
        result = self.send_message(message)
        return {
            "provider": result.provider,
            "status": result.status,
            "target": result.target,
        }

    def send_message(self, message: WhatsAppMessage) -> WhatsAppSendResult:
        provider = settings.whatsapp_provider.lower().strip()
        if provider == "mock":
            logger.info("[whatsapp] mock send -> %s", message.phone)
            return WhatsAppSendResult(provider="mock", status="queued", target=message.phone, payload={"mock": True})
        if provider == "green-api":
            return self._send_via_green_api(message)
        if provider == "waha":
            return self._send_via_waha(message)
        if provider == "evolution":
            return self._send_via_evolution(message)
        if provider == "http":
            return self._send_via_generic_http(message)
        raise RuntimeError(f"WHATSAPP_PROVIDER '{settings.whatsapp_provider}' nao suportado")

    def send_product_to_group(self, group_id: str, product: dict[str, str]) -> WhatsAppSendResult:
        message = WhatsAppMessage(
            phone=group_id,
            text=self.build_auto_product_message(product["name"], product["price"], product["product_url"]),
            image_url=product.get("image_url"),
        )
        return self.send_message(message)

    def build_auto_product_message(self, product_name: str, price: str, product_url: str) -> str:
        return (
            "🔥 Produto novo na loja!\n\n"
            f"{product_name}\n"
            f"💰 {price}\n\n"
            "🛒 Comprar agora:\n"
            f"{product_url}"
        )

    def build_product_message(
        self,
        product_name: str,
        price: str,
        summary: str,
        damage_notes: str,
        product_url: str,
        catalog_url: str,
    ) -> str:
        return (
            f"{product_name}\n"
            f"Preco: {price}\n"
            f"{summary}\n"
            f"Comprar: {product_url}\n"
            f"Catalogo: {catalog_url}"
        )

    def format_price(self, value: Decimal | float | int | str) -> str:
        amount = Decimal(str(value)).quantize(Decimal("0.01"))
        whole, decimal = f"{amount:.2f}".split(".")
        whole_with_sep = f"{int(whole):,}".replace(",", ".")
        return f"R$ {whole_with_sep},{decimal}"

    def build_storefront_product_url(self, slug: str) -> str:
        base = settings.storefront_public_url or settings.app_public_url
        if not base:
            return f"/produto/{slug}"
        return f"{base}/produto/{slug}"

    def _send_via_generic_http(self, message: WhatsAppMessage) -> WhatsAppSendResult:
        if not settings.whatsapp_base_url:
            raise RuntimeError("WHATSAPP_BASE_URL nao configurado")

        payload = {
            "group_id": message.phone,
            "text": message.text,
            "image_url": message.image_url,
        }
        body = json.dumps(payload).encode("utf-8")
        request = Request(
            f"{settings.whatsapp_base_url.rstrip('/')}/messages/product-broadcast",
            data=body,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.whatsapp_api_token}",
            },
            method="POST",
        )
        return self._perform_request(request, message.phone, "http")

    def _send_via_waha(self, message: WhatsAppMessage) -> WhatsAppSendResult:
        if not settings.whatsapp_base_url:
            raise RuntimeError("WHATSAPP_BASE_URL nao configurado")
        if not settings.whatsapp_api_token:
            raise RuntimeError("WHATSAPP_API_TOKEN nao configurado")

        if message.image_url:
            endpoint = f"{settings.whatsapp_base_url.rstrip('/')}/api/sendImage"
            payload = {
                "session": settings.whatsapp_session_name or settings.whatsapp_instance_name or "default",
                "chatId": message.phone,
                "file": {
                    "url": message.image_url
                },
                "caption": message.text
            }
        else:
            endpoint = f"{settings.whatsapp_base_url.rstrip('/')}/api/sendText"
            payload = {
                "session": settings.whatsapp_session_name or settings.whatsapp_instance_name or "default",
                "chatId": message.phone,
                "text": message.text
            }

        request = Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "X-Api-Key": settings.whatsapp_api_token,
                "Accept": "application/json",
            },
            method="POST",
        )
        return self._perform_request(request, message.phone, "waha")

    def _send_via_green_api(self, message: WhatsAppMessage) -> WhatsAppSendResult:
        if not settings.whatsapp_base_url:
            raise RuntimeError("WHATSAPP_BASE_URL nao configurado")
        if not settings.whatsapp_instance_id:
            raise RuntimeError("WHATSAPP_INSTANCE_ID nao configurado")
        if not settings.whatsapp_api_token:
            raise RuntimeError("WHATSAPP_API_TOKEN nao configurado")

        base_url = settings.whatsapp_base_url.rstrip("/")
        if message.image_url:
            endpoint = f"{base_url}/waInstance{settings.whatsapp_instance_id}/sendFileByUrl/{settings.whatsapp_api_token}"
            payload = {
                "chatId": message.phone,
                "urlFile": message.image_url,
                "fileName": "produto.jpg",
                "caption": message.text,
            }
        else:
            endpoint = f"{base_url}/waInstance{settings.whatsapp_instance_id}/sendMessage/{settings.whatsapp_api_token}"
            payload = {
                "chatId": message.phone,
                "message": message.text,
            }

        request = Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )
        return self._perform_request(request, message.phone, "green-api")

    def _send_via_evolution(self, message: WhatsAppMessage) -> WhatsAppSendResult:
        if not settings.whatsapp_base_url:
            raise RuntimeError("WHATSAPP_BASE_URL nao configurado")
        if not settings.whatsapp_instance_name:
            raise RuntimeError("WHATSAPP_INSTANCE_NAME nao configurado")

        payload = {
            "number": message.phone,
            "mediatype": "image",
            "mimetype": "image/jpeg",
            "caption": message.text,
            "media": message.image_url,
            "fileName": "produto.jpg",
        }

        if not message.image_url:
            payload = {
                "number": message.phone,
                "text": message.text,
            }
            endpoint = f"{settings.whatsapp_base_url.rstrip('/')}/message/sendText/{settings.whatsapp_instance_name}"
        else:
            endpoint = f"{settings.whatsapp_base_url.rstrip('/')}/message/sendMedia/{settings.whatsapp_instance_name}"

        request = Request(
            endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "apikey": settings.whatsapp_api_token,
            },
            method="POST",
        )
        return self._perform_request(request, message.phone, "evolution")

    def _perform_request(self, request: Request, target: str, provider: str) -> WhatsAppSendResult:
        try:
            with urlopen(request, timeout=settings.whatsapp_request_timeout_seconds) as response:
                raw = response.read().decode("utf-8") if response.length != 0 else ""
                try:
                    payload = json.loads(raw) if raw else {}
                except json.JSONDecodeError:
                    payload = {"raw": raw}
                provider_message_id = (
                    payload.get("key", {}).get("id")
                    if isinstance(payload, dict)
                    else None
                )
                if isinstance(payload, dict) and not provider_message_id:
                    provider_message_id = (
                        payload.get("id")
                        or payload.get("idMessage")
                        or payload.get("messageId")
                        or payload.get("message", {}).get("id")
                    )
                return WhatsAppSendResult(
                    provider=provider,
                    status="sent",
                    target=target,
                    provider_message_id=provider_message_id,
                    payload=payload if isinstance(payload, dict) else {"raw": raw},
                )
        except HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"HTTP {exc.code}: {detail or exc.reason}") from exc
        except URLError as exc:
            raise RuntimeError(str(exc.reason)) from exc
