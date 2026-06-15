from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ORMBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(ORMBaseSchema):
    id: str
    created_at: datetime
    updated_at: datetime


Money = Decimal

