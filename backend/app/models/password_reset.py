from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class PasswordResetRequestBase(SQLModel):
    email: str

class PasswordResetRequest(PasswordResetRequestBase, table=True):
    __tablename__ = "password_reset_requests"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_resolved: bool = Field(default=False)
    resolved_by_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    resolved_at: Optional[datetime] = None

class PasswordResetRequestCreate(PasswordResetRequestBase):
    pass

class PasswordResetRequestRead(PasswordResetRequestBase):
    id: int
    created_at: datetime
    is_resolved: bool
    resolved_at: Optional[datetime]
