"""add user profile fields (username, phone, address)

Revision ID: d2b3c4e5f6a7
Revises: c1a2b3d4e5f6
Create Date: 2026-06-28 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2b3c4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'c1a2b3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('username', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(length=30), nullable=True))
    op.add_column('users', sa.Column('address', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'address')
    op.drop_column('users', 'phone')
    op.drop_column('users', 'username')
