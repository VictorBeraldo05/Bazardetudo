from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.catalog import Category, Product, Subcategory
from app.models.inventory import InventoryMovement
from app.services.heartbeat import start_heartbeat, stop_heartbeat
from app.services.whatsapp_dispatch import start_whatsapp_dispatch_worker, stop_whatsapp_dispatch_worker
import app.models  # noqa: F401


SUBCATEGORY_DEFAULTS = {
    "decoracao": [
        ("Espelhos", "espelhos"),
        ("Tapetes", "tapetes"),
        ("Iluminacao", "iluminacao"),
        ("Quadros", "quadros"),
        ("Organizacao", "organizacao"),
        ("Sala", "sala"),
    ],
    "eletrodomesticos": [
        ("Geladeiras", "geladeiras"),
        ("Lavadoras", "lavadoras"),
        ("Fornos e Micro-ondas", "fornos-microondas"),
        ("Air Fryer", "air-fryer"),
        ("Fogoes e Cooktops", "fogoes-cooktops"),
        ("Pequenos Eletros", "pequenos-eletros"),
    ],
    "moveis": [
        ("Sofas", "sofas"),
        ("Camas", "camas"),
        ("Mesas", "mesas"),
        ("Poltronas", "poltronas"),
        ("Armarios", "armarios"),
        ("Aparadores e Racks", "aparadores-racks"),
    ],
    "material-escolar": [
        ("Canetas", "canetas"),
        ("Cadernos e Planners", "cadernos-planners"),
        ("Mochilas e Estojos", "mochilas-estojos"),
        ("Desenho e Pintura", "desenho-pintura"),
        ("Escritorio", "escritorio"),
    ],
    "suplementos": [
        ("Creatina", "creatina"),
        ("Whey Protein", "whey-protein"),
        ("Pre-treino", "pre-treino"),
        ("Hipercaloricos", "hipercaloricos"),
        ("Vitaminas", "vitaminas"),
    ],
}

SUBCATEGORY_MATCHERS = {
    "espelhos": ["espelho"],
    "tapetes": ["tapete", "passadeira"],
    "iluminacao": ["luminaria", "lustre", "abajur", "led"],
    "quadros": ["quadro", "painel decorativo"],
    "organizacao": ["organizador", "nicho", "prateleira", "cesto"],
    "sala": ["sala", "centro", "lateral", "decorativo"],
    "geladeiras": ["geladeira", "refrigerador", "frigobar", "freezer"],
    "lavadoras": ["lavadora", "lava", "roupas", "tanquinho", "secadora"],
    "fornos-microondas": ["forno", "micro", "micro-ondas", "microondas"],
    "air-fryer": ["air fryer", "fritadeira"],
    "fogoes-cooktops": ["fogao", "fogão", "cooktop"],
    "pequenos-eletros": ["liquidificador", "cafeteira", "batedeira", "sanduicheira"],
    "sofas": ["sofa", "sofá", "chaise", "retratil"],
    "camas": ["cama", "colchao", "colchão", "box", "cabec"],
    "mesas": ["mesa", "jantar", "escritorio", "escritório"],
    "poltronas": ["poltrona", "cadeira", "puff"],
    "armarios": ["armario", "armário", "guarda", "roupeiro", "closet"],
    "aparadores-racks": ["aparador", "buffet", "rack", "painel"],
    "canetas": ["caneta", "marker", "marca texto"],
    "cadernos-planners": ["caderno", "agenda", "planner"],
    "mochilas-estojos": ["mochila", "estojo", "lancheira"],
    "desenho-pintura": ["lapis", "lápis", "giz", "pintura"],
    "escritorio": ["grampeador", "papel", "bloco", "cola"],
    "creatina": ["creatina"],
    "whey-protein": ["whey", "protein"],
    "pre-treino": ["pre treino", "pré treino"],
    "hipercaloricos": ["hipercalorico", "hipercalórico", "mass"],
    "vitaminas": ["vitamina", "multivitaminico"],
}


app = FastAPI(
    title=settings.project_name,
    version="0.1.0",
    openapi_url=f"{settings.api_v1_str}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_backward_compatible_columns()
    ensure_default_subcategories()
    backfill_product_subcategories()
    backfill_inventory_entries()
    start_heartbeat()
    start_whatsapp_dispatch_worker()


@app.on_event("shutdown")
def on_shutdown() -> None:
    stop_heartbeat()
    stop_whatsapp_dispatch_worker()


def ensure_backward_compatible_columns() -> None:
    inspector = inspect(engine)
    with engine.begin() as connection:
        if inspector.has_table("customers"):
            existing_columns = {column["name"] for column in inspector.get_columns("customers")}
            if "is_admin" not in existing_columns:
                connection.execute(text("ALTER TABLE customers ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE"))

        if inspector.has_table("product_images") and engine.dialect.name == "postgresql":
            connection.execute(text("ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT"))

        if inspector.has_table("products"):
            existing_columns = {column["name"] for column in inspector.get_columns("products")}
            if "subcategory_id" not in existing_columns:
                connection.execute(text("ALTER TABLE products ADD COLUMN subcategory_id UUID NULL"))
                if engine.dialect.name == "postgresql":
                    connection.execute(
                        text("ALTER TABLE products ADD CONSTRAINT fk_products_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)")
                    )
                    connection.execute(text("CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id)"))

        if inspector.has_table("subcategories"):
            existing_columns = {column["name"] for column in inspector.get_columns("subcategories")}
            if "image" not in existing_columns:
                connection.execute(text("ALTER TABLE subcategories ADD COLUMN image TEXT NULL"))

        if inspector.has_table("categories"):
            existing_columns = {column["name"] for column in inspector.get_columns("categories")}
            if "image" not in existing_columns:
                connection.execute(text("ALTER TABLE categories ADD COLUMN image TEXT NULL"))


def ensure_default_subcategories() -> None:
    db: Session = SessionLocal()
    try:
        categories = list(db.scalars(select(Category)).all())
        if not categories:
            return

        existing_by_slug = {sub.slug for sub in db.scalars(select(Subcategory)).all()}
        created = False
        for category in categories:
            defaults = SUBCATEGORY_DEFAULTS.get(category.slug, [])
            for sub_name, sub_slug in defaults:
                if sub_slug in existing_by_slug:
                    continue
                db.add(
                    Subcategory(
                        category_id=category.id,
                        name=sub_name,
                        slug=sub_slug,
                        description=f"Subcategoria de {category.name}",
                    )
                )
                existing_by_slug.add(sub_slug)
                created = True

        if created:
            db.commit()
    finally:
        db.close()


def backfill_product_subcategories() -> None:
    db: Session = SessionLocal()
    try:
        products = list(db.scalars(select(Product)).all())
        if not products:
            return

        subcategories = list(db.scalars(select(Subcategory)).all())
        if not subcategories:
            return

        sub_by_category: dict[str, list[Subcategory]] = {}
        for subcategory in subcategories:
            sub_by_category.setdefault(subcategory.category_id, []).append(subcategory)

        updated = 0
        for product in products:
            if product.subcategory_id:
                continue

            available = sub_by_category.get(product.category_id, [])
            if not available:
                continue

            haystack = f"{product.name} {product.description} {product.tags or ''}".lower()
            matched = next(
                (
                    subcategory
                    for subcategory in available
                    if any(keyword in haystack for keyword in SUBCATEGORY_MATCHERS.get(subcategory.slug, []))
                ),
                None,
            )
            if not matched:
                matched = available[0]

            product.subcategory_id = matched.id
            updated += 1

        if updated:
            db.commit()
    finally:
        db.close()


def backfill_inventory_entries() -> None:
    db: Session = SessionLocal()
    try:
        products = list(db.scalars(select(Product)).all())
        if not products:
            return

        movement_product_ids = set(
            db.scalars(
                select(InventoryMovement.product_id).where(InventoryMovement.movement_type == "entry")
            ).all()
        )

        created = 0
        for product in products:
            if product.id in movement_product_ids:
                continue
            if product.quantity <= 0:
                continue

            db.add(
                InventoryMovement(
                    product_id=product.id,
                    movement_type="entry",
                    quantity=product.quantity,
                    reason="Backfill automatico para produtos cadastrados antes do modulo de estoque",
                    reference_id=product.id,
                )
            )
            created += 1

        if created > 0:
            db.commit()
    finally:
        db.close()


app.include_router(api_router, prefix=settings.api_v1_str)
