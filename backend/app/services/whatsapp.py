from dataclasses import dataclass

from app.core.config import settings


@dataclass
class WhatsAppMessage:
    phone: str
    text: str
    image_url: str | None = None


class WhatsAppNotificationService:
    def send_product_broadcast(self, message: WhatsAppMessage) -> dict[str, str]:
        return {
            "provider": settings.whatsapp_provider,
            "status": "queued",
            "target": message.phone,
        }

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
            f"Avaria: {damage_notes}\n"
            f"Comprar: {product_url}\n"
            f"Catalogo: {catalog_url}"
        )

