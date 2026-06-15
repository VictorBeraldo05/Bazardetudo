from pydantic import EmailStr
from pydantic import BaseModel

from app.schemas.common import TimestampSchema


class CustomerRead(TimestampSchema):
    full_name: str
    email: EmailStr
    phone: str | None = None
    document: str | None = None
    is_active: bool
    is_admin: bool


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    document: str | None = None
    password: str | None = None
