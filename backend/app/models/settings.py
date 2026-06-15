from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Setting(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

