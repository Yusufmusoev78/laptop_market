"""initial schema

Revision ID: bd7b278f1f53
Revises:
Create Date: 2026-06-25 19:23:18.481064

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bd7b278f1f53'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'laptops',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('brand', sa.String(length=100), nullable=False),
        sa.Column('model_name', sa.String(length=255), nullable=False),
        sa.Column('cpu', sa.String(length=100), nullable=False),
        sa.Column('ram_gb', sa.Integer(), nullable=False),
        sa.Column('storage_gb', sa.Integer(), nullable=False),
        sa.Column('gpu', sa.String(length=100), nullable=True),
        sa.Column('price_tjs', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('stock_quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('keyboard_layout', sa.String(length=50), nullable=False, server_default='English/Cyrillic'),
        sa.Column('warranty_months', sa.Integer(), nullable=False, server_default='12'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_laptops_brand'), 'laptops', ['brand'], unique=False)
    op.create_index(op.f('ix_laptops_model_name'), 'laptops', ['model_name'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_laptops_model_name'), table_name='laptops')
    op.drop_index(op.f('ix_laptops_brand'), table_name='laptops')
    op.drop_table('laptops')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
