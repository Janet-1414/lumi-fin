"""create community tables

Revision ID: 0005
Revises: 0004
Create Date: 2025-01-01 00:04:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'challenges',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('target_amount', sa.Numeric(15, 2), nullable=True),
        sa.Column('current_amount', sa.Numeric(15, 2), nullable=False, server_default='0'),
        sa.Column('duration_days', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('status', sa.Enum('active','completed','failed','skipped', name='challengestatus'), nullable=False, server_default='active'),
        sa.Column('is_community', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('ai_generated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('participants_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completion_percentage', sa.Numeric(5, 2), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_challenges_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_challenges'),
    )

    op.create_table(
        'community_posts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('post_type', sa.Enum('win','tip','question', name='posttype'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_anonymous', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('savings_percentage', sa.Numeric(5, 2), nullable=True),
        sa.Column('goal_completion_percentage', sa.Numeric(5, 2), nullable=True),
        sa.Column('likes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_moderated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_community_posts_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_community_posts'),
    )
    op.create_index('ix_community_posts_user_id', 'community_posts', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_community_posts_user_id', table_name='community_posts')
    op.drop_table('community_posts')
    op.drop_table('challenges')
    op.execute("DROP TYPE IF EXISTS challengestatus")
    op.execute("DROP TYPE IF EXISTS posttype")
