from datetime import datetime

from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: str
    category: str
    title: str
    detail: str
    link: str
    is_read: bool
    created_at: datetime
