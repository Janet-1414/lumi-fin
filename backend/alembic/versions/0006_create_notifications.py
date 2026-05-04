"""create notifications and money personality tables

Revision ID: 0006
Revises: 0005
Create Date: 2025-01-01 00:05:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0006'
down_revision = '0005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.Enum(
            'spending_alert','savings_milestone','streak_reminder','goal_achieved',
            'weekly_report','community_pulse','investment_hint','literacy_lesson','challenge_update',
            name='notificationtype'
        ), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('email_sent', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_notifications_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_notifications'),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])

    op.create_table(
        'money_personality_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('personality_type', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('strengths', sa.Text(), nullable=False),
        sa.Column('weaknesses', sa.Text(), nullable=False),
        sa.Column('advice', sa.Text(), nullable=False),
        sa.Column('quiz_responses', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_money_personality_profiles_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_money_personality_profiles'),
        sa.UniqueConstraint('user_id', name='uq_money_personality_profiles_user_id'),
    )


def downgrade() -> None:
    op.drop_table('money_personality_profiles')
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_table('notifications')
    op.execute("DROP TYPE IF EXISTS notificationtype")
