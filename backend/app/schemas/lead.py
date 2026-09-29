from pydantic import BaseModel
from app.schemas.analysis import LeadAnalysis


class LeadCreate(BaseModel):
    name: str
    location: str
    propertyRequirement: str
    budget: str
    buyingTimeline: str
    customerMessage: str
    buyerId: str | None = None


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


class BuyerLeadItem(BaseModel):
    id: str
    name: str
    location: str
    propertyRequirement: str
    budget: str
    buyingTimeline: str
    status: str = "SUBMITTED"
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
    status: str = "SUBMITTED"
    buyerId: str | None = None
    createdAt: str

