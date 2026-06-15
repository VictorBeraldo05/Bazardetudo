from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Category(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (CheckConstraint("quantity >= 0", name="ck_products_quantity_positive"),)

    name: Mapped[str] = mapped_column(String(160), index=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    damage_notes: Mapped[str] = mapped_column(Text)
    condition: Mapped[str] = mapped_column(String(40), default="good")
    status: Mapped[str] = mapped_column(String(40), default="available", index=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"))
    sku: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    cost_price: Mapped[float] = mapped_column(Numeric(10, 2))
    sale_price: Mapped[float] = mapped_column(Numeric(10, 2))
    compare_at_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    tags: Mapped[str | None] = mapped_column(String(255), nullable=True)
    featured: Mapped[bool] = mapped_column(default=False)
    is_offer: Mapped[bool] = mapped_column(default=False)

    category: Mapped["Category"] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class ProductImage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "product_images"

    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    image_url: Mapped[str] = mapped_column(String(255))
    alt_text: Mapped[str | None] = mapped_column(String(180), nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="images")

