"""create transactions table

Revision ID: 0002
Revises: 0001
Create Date: 2025-01-01 00:01:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('type', sa.Enum('income', 'expense', name='transactiontype'), nullable=False),
        sa.Column('category', sa.Enum(
            'food','transport','entertainment','utilities','health',
            'education','shopping','savings','salary','freelance',
            'mobile_money','rent','other', name='transactioncategory'
        ), nullable=False),
        sa.Column('description', sa.String(500), nullable=False),
        sa.Column('merchant', sa.String(255), nullable=True),
        sa.Column('ai_scanned', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('ai_categorized', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('receipt_url', sa.String(1000), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('transaction_date', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE', name='fk_transactions_user_id_users'),
        sa.PrimaryKeyConstraint('id', name='pk_transactions'),
    )
    op.create_index('ix_transactions_user_id', 'transactions', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_transactions_user_id', table_name='transactions')
    op.drop_table('transactions')
    op.execute("DROP TYPE IF EXISTS transactiontype")
    op.execute("DROP TYPE IF EXISTS transactioncategory")
