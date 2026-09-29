from typing import Literal
from pydantic import BaseModel
from app.schemas.analysis import LeadAnalysis


class FollowUpItem(BaseModel):
    action: str
    dueAt: str
    reason: str
    status: str = "PENDING"


class LeadStatusUpdate(BaseModel):
    status: Literal["CONTACTED"]


class LeadCreate(BaseModel):
    name: str
    location: str
    propertyRequirement: str
    budget: str
    buyingTimeline: str
    customerMessage: str


class LeadListItem(BaseModel):
    id: str
    name: str
    location: str
    propertyRequirement: str
    budget: str
    buyingTimeline: str
    priorityScore: int
    priorityLabel: str
    status: str = "SUBMITTED"
    createdAt: str
    updatedAt: str | None = None
    followUpPlan: list[FollowUpItem] = []


class LeadResponse(BaseModel):
    id: str
    name: str
    location: str
    propertyRequirement: str
    budget: str
    buyingTimeline: str
    customerMessage: str
    analysis: LeadAnalysis
    priorityScore: int
    priorityLabel: str
    status: str = "SUBMITTED"
    createdAt: str
    updatedAt: str | None = None
    followUpPlan: list[FollowUpItem] = []

