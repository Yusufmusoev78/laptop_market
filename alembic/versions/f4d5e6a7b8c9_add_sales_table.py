"""add sales table

Revision ID: f4d5e6a7b8c9
Revises: e3c4d5f6a7b8
Create Date: 2026-06-28 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4d5e6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'e3c4d5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'sales',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('laptop_id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('brand_id', sa.Integer(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price_tjs', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('total_tjs', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('sold_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['laptop_id'], ['laptops.id']),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_sales_laptop_id'), 'sales', ['laptop_id'], unique=False)
    op.create_index(op.f('ix_sales_owner_id'), 'sales', ['owner_id'], unique=False)
    op.create_index(op.f('ix_sales_brand_id'), 'sales', ['brand_id'], unique=False)
    op.create_index(op.f('ix_sales_sold_at'), 'sales', ['sold_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_sales_sold_at'), table_name='sales')
    op.drop_index(op.f('ix_sales_brand_id'), table_name='sales')
    op.drop_index(op.f('ix_sales_owner_id'), table_name='sales')
    op.drop_index(op.f('ix_sales_laptop_id'), table_name='sales')
    op.drop_table('sales')
