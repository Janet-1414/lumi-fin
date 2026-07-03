from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from app.models.notification import Notification, NotificationType
from app.models.user import User
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
import uuid

MAX_NOTIFICATIONS = 50


def get_mail_config() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self,
        user: User,
        notification_type: NotificationType,
        title: str,
        message: str,
        send_email: bool = False,
    ) -> Notification:
        notification = Notification(
            user_id=user.id,
            type=notification_type,
            title=title,
            message=message,
        )
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)

        # Auto-prune — keep only the 50 most recent notifications
        await self._prune_old_notifications(user)

        if send_email and user.email_notifications:
            await self._send_email(user, title, message)
            notification.email_sent = True
            await self.db.commit()

        return notification

    async def _prune_old_notifications(self, user: User) -> None:
        """Delete oldest notifications beyond MAX_NOTIFICATIONS per user."""
        # Get count
        count_result = await self.db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user.id
            )
        )
        count = count_result.scalar() or 0

        if count > MAX_NOTIFICATIONS:
            # Find the IDs of the oldest notifications to delete
            oldest = await self.db.execute(
                select(Notification.id)
                .where(Notification.user_id == user.id)
                .order_by(Notification.created_at.asc())
                .limit(count - MAX_NOTIFICATIONS)
            )
            ids_to_delete = [row[0] for row in oldest.all()]
            if ids_to_delete:
                await self.db.execute(
                    delete(Notification).where(
                        Notification.id.in_(ids_to_delete)
                    )
                )
                await self.db.commit()

    async def get_notifications(self, user: User, unread_only: bool = False) -> list[Notification]:
        conditions = [Notification.user_id == user.id]
        if unread_only:
            conditions.append(Notification.is_read == False)

        from sqlalchemy import and_
        result = await self.db.execute(
            select(Notification)
            .where(and_(*conditions))
            .order_by(Notification.created_at.desc())
            .limit(MAX_NOTIFICATIONS)
        )
        return list(result.scalars().all())

    async def mark_read(self, user: User, notification_id: uuid.UUID) -> None:
        result = await self.db.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.user_id == user.id,
            )
        )
        notification = result.scalar_one_or_none()
        if notification:
            notification.is_read = True
            await self.db.commit()

    async def mark_all_read(self, user: User) -> None:
        result = await self.db.execute(
            select(Notification).where(
                Notification.user_id == user.id,
                Notification.is_read == False,
            )
        )
        notifications = result.scalars().all()
        for n in notifications:
            n.is_read = True
        await self.db.commit()

    async def _send_email(self, user: User, subject: str, body: str) -> None:
        try:
            conf = get_mail_config()
            fm = FastMail(conf)
            message = MessageSchema(
                subject=f"Lumi — {subject}",
                recipients=[user.email],
                body=f"Hi {user.first_name},\n\n{body}\n\nKeep illuminating your financial future!\nThe Lumi Team",
                subtype=MessageType.plain,
            )
            await fm.send_message(message)
        except Exception:
            pass