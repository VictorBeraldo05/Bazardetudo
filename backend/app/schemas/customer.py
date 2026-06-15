from pydantic import EmailStr
from pydantic import BaseModel, Field

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


class CustomerRegister(BaseModel):
    full_name: str = Field(min_length=3)
    email: EmailStr
    phone: str = Field(min_length=8)
    document: str = Field(min_length=11, max_length=14)
    password: str = Field(min_length=6)
