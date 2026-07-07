from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class EmployeeCreate(BaseModel):
    full_name: str
    email: str
    position: str
    department: str
    manager_id: Optional[str] = None
    start_date: Optional[date] = None
    salary: Optional[float] = None


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None
    status: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    position: str
    department: str
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    status: str
    start_date: Optional[date] = None
    created_at: Optional[datetime] = None
