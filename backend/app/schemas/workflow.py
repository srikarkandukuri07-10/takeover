from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class WorkflowType(str, Enum):
    RECRUITMENT = "recruitment"
    ONBOARDING = "onboarding"
    LEAVE = "leave"
    TRAINING = "training"
    PERFORMANCE = "performance"
    PROMOTION = "promotion"
    PAYROLL = "payroll"
    EXIT = "exit"


class WorkflowStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class WorkflowStep(BaseModel):
    id: str
    workflow_id: str
    module: str
    action: str
    status: str
    details: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WorkflowRequest(BaseModel):
    event: str


class WorkflowResponse(BaseModel):
    id: str
    event: str
    workflow_type: Optional[str] = None
    status: WorkflowStatus
    steps: List[WorkflowStep] = []
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WorkflowStatusUpdate(BaseModel):
    workflow_id: str
    status: str
    step: Optional[WorkflowStep] = None
