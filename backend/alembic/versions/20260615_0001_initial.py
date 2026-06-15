"""initial"""

from alembic import op
import sqlalchemy as sa


revision = "20260615_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.UUID(), primary_key=True),
        sa.Column("category_id", sa.UUID(), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("damage_notes", sa.Text(), nullable=False),
        sa.Column("condition", sa.String(length=40), nullable=False, server_default="good"),
        sa.Column("status", sa.String(length=40), nullable=False, server_default="available"),
        sa.Column("sku", sa.String(length=40), nullable=False),
        sa.Column("cost_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("sale_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("compare_at_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("tags", sa.String(length=255), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_offer", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("quantity >= 0", name="ck_products_quantity_positive"),
        sa.UniqueConstraint("slug"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index("idx_products_status", "products", ["status"])
    op.create_index("idx_products_category", "products", ["category_id"])


def downgrade() -> None:
    op.drop_index("idx_products_category", table_name="products")
    op.drop_index("idx_products_status", table_name="products")
    op.drop_table("products")
    op.drop_table("categories")
