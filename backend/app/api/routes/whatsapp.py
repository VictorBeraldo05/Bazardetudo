from fastapi import APIRouter, Depends

from app.api.deps import admin_guard
from app.core.config import settings
from app.services.whatsapp import WhatsAppMessage, WhatsAppNotificationService


router = APIRouter(dependencies=[Depends(admin_guard)])
service = WhatsAppNotificationService()


@router.post("/broadcast-product")
def broadcast_product(payload: dict[str, str]) -> dict[str, str]:
    text = service.build_product_message(
        product_name=payload["product_name"],
        price=payload["price"],
        summary=payload["summary"],
        damage_notes=payload["damage_notes"],
        product_url=payload["product_url"],
        catalog_url=payload["catalog_url"],
    )
    return service.send_product_broadcast(
        WhatsAppMessage(phone=payload.get("phone", settings.store_whatsapp), text=text, image_url=payload.get("image_url"))
    )

