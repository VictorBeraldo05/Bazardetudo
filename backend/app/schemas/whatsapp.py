from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


class WhatsAppGroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    whatsapp_group_id: str = Field(min_length=3, max_length=120)
    active: bool = True


class WhatsAppGroupUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    whatsapp_group_id: str = Field(min_length=3, max_length=120)
    active: bool = True


class WhatsAppGroupRead(TimestampSchema):
    name: str
    whatsapp_group_id: str
    active: bool


class WhatsAppProductSendLogRead(TimestampSchema):
    product_id: str
    whatsapp_group_id: str
    status: str
    error_message: str | None = None
    provider: str | None = None
    provider_message_id: str | None = None
    sent_at: datetime | None = None


class WhatsAppDispatchJobRead(TimestampSchema):
    product_id: str
    job_type: str
    status: str
    attempts: int
    max_attempts: int
    last_error: str | None = None
    scheduled_for: datetime | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None


class WhatsAppQueueProductRequest(BaseModel):
    product_id: str
