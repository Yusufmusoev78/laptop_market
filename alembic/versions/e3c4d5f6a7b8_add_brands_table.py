"""add brands table and laptop brand_id

Revision ID: e3c4d5f6a7b8
Revises: d2b3c4e5f6a7
Create Date: 2026-06-28 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3c4d5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'd2b3c4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'brands',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('contact_phone', sa.String(length=30), nullable=False),
        sa.Column('support_email', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_brands_owner_id'), 'brands', ['owner_id'], unique=False)
    op.create_index(op.f('ix_brands_name'), 'brands', ['name'], unique=False)

    op.add_column('laptops', sa.Column('brand_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_laptops_brand_id'), 'laptops', ['brand_id'], unique=False)
    op.create_foreign_key(
        'fk_laptops_brand_id_brands', 'laptops', 'brands', ['brand_id'], ['id']
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_laptops_brand_id_brands', 'laptops', type_='foreignkey')
    op.drop_index(op.f('ix_laptops_brand_id'), table_name='laptops')
    op.drop_column('laptops', 'brand_id')

    op.drop_index(op.f('ix_brands_name'), table_name='brands')
    op.drop_index(op.f('ix_brands_owner_id'), table_name='brands')
    op.drop_table('brands')
