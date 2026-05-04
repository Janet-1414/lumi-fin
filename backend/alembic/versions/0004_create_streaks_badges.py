"""create streaks and badges tables

Revision ID: 0004
Revises: 0003
Create Date: 2025-01-01 00:03:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'streaks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('current_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('longest_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_activity_date', sa.Date(), nullable=True),
        sa.Column('total_days_active', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_streaks_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_streaks'),
        sa.UniqueConstraint('user_id', name='uq_streaks_user_id'),
    )

    op.create_table(
        'badges',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Enum(
            'first_save','week_streak','month_streak','goal_crusher',
            'budget_master','community_star','investment_ready',
            'money_mentor','savings_champion','discipline_king', name='badgename'
        ), nullable=False),
        sa.Column('badge_type', sa.Enum('bronze','silver','gold','diamond', name='badgetype'), nullable=False),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('unlocked_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_badges_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_badges'),
    )
    op.create_index('ix_badges_user_id', 'badges', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_badges_user_id', table_name='badges')
    op.drop_table('badges')
    op.drop_table('streaks')
    op.execute("DROP TYPE IF EXISTS badgename")
    op.execute("DROP TYPE IF EXISTS badgetype")
