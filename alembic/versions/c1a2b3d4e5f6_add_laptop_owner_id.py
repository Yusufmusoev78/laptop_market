"""add laptop owner_id

Revision ID: c1a2b3d4e5f6
Revises: bd7b278f1f53
Create Date: 2026-06-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1a2b3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'bd7b278f1f53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('laptops', sa.Column('owner_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_laptops_owner_id'), 'laptops', ['owner_id'], unique=False)
    op.create_foreign_key(
        'fk_laptops_owner_id_users', 'laptops', 'users', ['owner_id'], ['id']
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_laptops_owner_id_users', 'laptops', type_='foreignkey')
    op.drop_index(op.f('ix_laptops_owner_id'), table_name='laptops')
    op.drop_column('laptops', 'owner_id')
