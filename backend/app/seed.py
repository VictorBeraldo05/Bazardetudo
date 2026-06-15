from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
import app.models  # noqa: F401
from app.models.catalog import Category, Product
from app.models.customer import Admin, Customer


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not db.query(Category).first():
        decor = Category(name="Decoracao", slug="decoracao", description="Itens para casa e ambientacao")
        electro = Category(name="Eletrodomesticos", slug="eletrodomesticos", description="Eletros revisados")
        db.add_all([decor, electro])
        db.flush()
        db.add_all(
            [
                Product(
                    name="Buffet Aparador Oslo",
                    slug="buffet-aparador-oslo",
                    description="Buffet moderno em MDF com acabamento fosco.",
                    damage_notes="Pequeno risco lateral quase imperceptivel.",
                    condition="excellent",
                    status="available",
                    category_id=decor.id,
                    sku="BDT-1001",
                    cost_price=890.00,
                    sale_price=1290.00,
                    compare_at_price=1790.00,
                    quantity=1,
                    tags="novo lote,ultima unidade",
                    featured=True,
                    is_offer=True,
                ),
                Product(
                    name="Air Fryer Glass Pro 5L",
                    slug="air-fryer-glass-pro-5l",
                    description="Fritadeira eletrica com cuba de vidro e painel touch.",
                    damage_notes="Caixa avariada e discreta marca no puxador.",
                    condition="very_good",
                    status="available",
                    category_id=electro.id,
                    sku="BDT-1002",
                    cost_price=210.00,
                    sale_price=349.00,
                    compare_at_price=499.00,
                    quantity=2,
                    tags="oferta,promocao",
                    featured=True,
                    is_offer=True,
                ),
            ]
        )

    if not db.query(Admin).first():
        db.add(Admin(full_name="Admin BDT", email="admin@bazardetudo.com", password_hash=get_password_hash("admin123")))

    if not db.query(Customer).first():
        db.add(
            Customer(
                full_name="Cliente Demo",
                email="cliente@bazardetudo.com",
                phone="5519999999999",
                password_hash=get_password_hash("cliente123"),
            )
        )

    db.commit()
    db.close()


if __name__ == "__main__":
    run_seed()
