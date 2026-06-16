import logging
import smtplib
import ssl
import unicodedata
from datetime import datetime, timezone
from email.message import EmailMessage

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.catalog import Category, Product
from app.models.customer import Customer
from app.models.notification import Notification, ProductArrivalAlert


logger = logging.getLogger(__name__)


def normalize_alert_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    normalized = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    collapsed = " ".join(normalized.lower().strip().split())
    return collapsed


def _text_tokens(value: str) -> list[str]:
    return [token for token in normalize_alert_text(value).replace("-", " ").split(" ") if len(token) >= 3]


def product_matches_alert(product: Product, category_name: str | None, alert_query: str) -> bool:
    product_text = normalize_alert_text(f"{product.name} {product.slug}")
    query_text = normalize_alert_text(alert_query)
    if not product_text or not query_text:
        return False

    if category_name:
        product_category = normalize_alert_text(product.category.name if product.category else "")
        requested_category = normalize_alert_text(category_name)
        if requested_category and product_category != requested_category:
            return False

    if query_text in product_text:
        return True

    query_tokens = _text_tokens(query_text)
    if not query_tokens:
        return False

    return all(token in product_text for token in query_tokens)


def find_existing_matching_product(db: Session, desired_product: str, category_name: str | None) -> Product | None:
    products = list(db.scalars(select(Product).where(Product.status == "available")).unique().all())
    for product in products:
        if not product.category:
            product.category = db.get(Category, product.category_id)
        if product_matches_alert(product, category_name, desired_product):
            return product
    return None


def smtp_ready() -> bool:
    return bool(settings.smtp_host and settings.smtp_from_email)


def send_arrival_email(alert: ProductArrivalAlert, product: Product) -> bool:
    if not smtp_ready():
        return False

    message = EmailMessage()
    sender_name = settings.smtp_from_name or "Bazar de Tudo"
    message["Subject"] = f"{product.name} acabou de entrar no Bazar de Tudo"
    message["From"] = f"{sender_name} <{settings.smtp_from_email}>"
    message["To"] = alert.customer_email
    message.set_content(
        "\n".join(
            [
                f"Ola{f' {alert.customer_name}' if alert.customer_name else ''},",
                "",
                f"O produto '{product.name}' acabou de entrar no sistema da Bazar de Tudo.",
                f"Preco atual: R$ {float(product.sale_price):.2f}".replace(".", ","),
                "",
                f"Slug do produto: {product.slug}",
                "Acesse a loja para verificar disponibilidade e finalizar a compra.",
            ]
        )
    )

    try:
        if settings.smtp_use_tls:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as server:
                server.starttls(context=ssl.create_default_context())
                if settings.smtp_username:
                    server.login(settings.smtp_username, settings.smtp_password or "")
                server.send_message(message)
        else:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20, context=ssl.create_default_context()) as server:
                if settings.smtp_username:
                    server.login(settings.smtp_username, settings.smtp_password or "")
                server.send_message(message)
        return True
    except Exception:  # pragma: no cover
        logger.exception("Falha ao enviar e-mail de chegada para %s", alert.customer_email)
        return False


def notify_matching_alerts(db: Session, product: Product) -> int:
    alerts = list(db.scalars(select(ProductArrivalAlert).where(ProductArrivalAlert.status == "active")).all())
    notified_count = 0

    if not product.category:
        product.category = db.get(Category, product.category_id)

    for alert in alerts:
        if not product_matches_alert(product, alert.category_name, alert.desired_product):
            continue

        sent = send_arrival_email(alert, product)
        alert.status = "notified" if sent else "pending_email"
        alert.matched_product_id = product.id
        alert.notified_at = datetime.now(timezone.utc)

        if alert.customer_id:
            db.add(
                Notification(
                    customer_id=alert.customer_id,
                    title="Produto chegou ao catalogo",
                    body=f"{product.name} acabou de entrar no sistema para o alerta '{alert.desired_product}'.",
                    channel="email" if sent else "system",
                    status="unread",
                )
            )

        notified_count += 1

    return notified_count


def attach_customer_to_alert(db: Session, email: str) -> Customer | None:
    return db.scalar(select(Customer).where(Customer.email == email))
