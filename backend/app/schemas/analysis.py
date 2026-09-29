from pydantic import BaseModel, Field


class ScoreSignal(BaseModel):
    score: int = Field(ge=0, le=100)
    reason: str


class LeadAnalysis(BaseModel):
    summary: str
    intent: str
    requirements: list[str]
    objections: list[str]
    nextAction: str
    suggestedResponse: str
    intentStrength: ScoreSignal
    timelineUrgency: ScoreSignal
    budgetFit: ScoreSignal
    requirementClarity: ScoreSignal
    engagementSignal: ScoreSignal
