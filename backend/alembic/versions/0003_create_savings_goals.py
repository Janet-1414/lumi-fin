"""create savings goals table

Revision ID: 0003
Revises: 0002
Create Date: 2025-01-01 00:02:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'savings_goals',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('target_amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('current_amount', sa.Numeric(15, 2), nullable=False, server_default='0'),
        sa.Column('deadline', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('active','completed','paused','cancelled', name='goalstatus'), nullable=False, server_default='active'),
        sa.Column('emoji', sa.String(10), nullable=True),
        sa.Column('ai_coached', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('weekly_target', sa.Numeric(15, 2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_savings_goals_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_savings_goals'),
    )
    op.create_index('ix_savings_goals_user_id', 'savings_goals', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_savings_goals_user_id', table_name='savings_goals')
    op.drop_table('savings_goals')
    op.execute("DROP TYPE IF EXISTS goalstatus")
