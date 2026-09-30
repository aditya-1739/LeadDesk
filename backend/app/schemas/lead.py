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
    phone: str | None = None
    email: str | None = None


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
    phone: str | None = None
    email: str | None = None


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
    phone: str | None = None
    email: str | None = None


class ContactDraftRequest(BaseModel):
    method: Literal["phone", "email", "whatsapp", "instagram"]


class ContactDraftResponse(BaseModel):
    method: str
    subject: str | None = None
    body: str | None = None
    message: str | None = None
    script: str | None = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class LeadChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class LeadChatResponse(BaseModel):
    reply: str

