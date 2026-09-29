from pydantic import BaseModel
from app.schemas.analysis import LeadAnalysis


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
    createdAt: str


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
    createdAt: str
