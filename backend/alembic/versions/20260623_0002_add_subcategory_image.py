"""add subcategory image

Revision ID: 20260623_0002
Revises: 20260615_0001_initial
Create Date: 2026-06-23 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260623_0002'
down_revision = '20260615_0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('subcategories', sa.Column('image', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('subcategories', 'image')
