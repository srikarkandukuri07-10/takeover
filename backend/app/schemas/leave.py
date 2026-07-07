from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum


class LeaveType(str, Enum):
    ANNUAL = "annual"
    SICK = "sick"
    PERSONAL = "personal"
    MATERNITY = "maternity"
    PATERNITY = "paternity"
    OTHER = "other"


class LeaveStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class LeaveRequest(BaseModel):
    employee_id: str
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: Optional[str] = None


class LeaveResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    status: str
    reason: Optional[str] = None
    ai_recommendation: Optional[str] = None
    created_at: Optional[datetime] = None


class LeaveBalance(BaseModel):
    employee_id: str
    annual_remaining: int = 20
    sick_remaining: int = 10
    personal_remaining: int = 5
