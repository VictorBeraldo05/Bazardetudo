from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import db_session
from app.models.notification import ProductArrivalAlert
from app.schemas.alerts import ProductArrivalAlertCreate, ProductArrivalAlertCreateResponse
from app.services.product_alerts import (
    attach_customer_to_alert,
    find_existing_matching_product,
    normalize_alert_text,
)


router = APIRouter()


@router.post("/product-arrival", response_model=ProductArrivalAlertCreateResponse)
def create_product_arrival_alert(
    payload: ProductArrivalAlertCreate, db: Session = Depends(db_session)
) -> ProductArrivalAlertCreateResponse:
    existing_product = find_existing_matching_product(db, payload.desired_product, payload.category_name)
    customer = attach_customer_to_alert(db, payload.customer_email)

    alert = ProductArrivalAlert(
        customer_id=customer.id if customer else None,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        desired_product=payload.desired_product,
        normalized_query=normalize_alert_text(payload.desired_product),
        category_name=payload.category_name,
        notes=payload.notes,
        status="active",
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    if existing_product:
        return ProductArrivalAlertCreateResponse(
            id=alert.id,
            status=alert.status,
            message="Seu alerta foi salvo, mas esse produto ja possui uma correspondencia no catalogo atual.",
            already_available=True,
            matched_product_id=existing_product.id,
        )

    return ProductArrivalAlertCreateResponse(
        id=alert.id,
        status=alert.status,
        message="Aviso configurado com sucesso. Vamos notificar por e-mail quando esse produto entrar no sistema.",
        already_available=False,
    )
