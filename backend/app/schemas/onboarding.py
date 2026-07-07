from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OnboardingTask(BaseModel):
    id: str
    task_name: str
    assigned_to: Optional[str] = None
    status: str = "pending"
    completed_at: Optional[datetime] = None


class OnboardingResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: Optional[str] = None
    status: str
    company_email: Optional[str] = None
    employee_id_number: Optional[str] = None
    laptop_allocated: bool = False
    orientation_scheduled: bool = False
    training_assigned: bool = False
    tasks: List[OnboardingTask] = []
    created_at: Optional[datetime] = None
