from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException
from app.database.mongodb import db
from app.schemas.lead import LeadCreate, LeadListItem, LeadResponse
from app.services.ai import analyze_lead
from app.services.scoring import calculate_priority

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("", response_model=LeadResponse)
def create_lead(payload: LeadCreate):
    lead_id = str(uuid.uuid4())
    lead_data = payload.model_dump()

    # AI analysis and scoring run before persistence to prevent partial lead records.
    analysis = analyze_lead(lead_data)
    score, label = calculate_priority(analysis)

    lead_doc = {
        "id": lead_id,
        **lead_data,
        "analysis": analysis.model_dump(),
        "priorityScore": score,
        "priorityLabel": label,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    db["leads"].insert_one(lead_doc)
    lead_doc.pop("_id", None)
    return lead_doc


@router.get("", response_model=list[LeadListItem])
def list_leads():
    cursor = db["leads"].find(
        {},
        {"_id": 0, "customerMessage": 0, "analysis": 0}
    ).sort("priorityScore", -1)
    return list(cursor)


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(lead_id: str):
    lead = db["leads"].find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.post("/{lead_id}/analyze", response_model=LeadResponse)
def reanalyze_lead(lead_id: str):
    lead = db["leads"].find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    analysis = analyze_lead(lead)
    score, label = calculate_priority(analysis)

    db["leads"].update_one(
        {"id": lead_id},
        {
            "$set": {
                "analysis": analysis.model_dump(),
                "priorityScore": score,
                "priorityLabel": label,
            }
        },
    )

    lead["analysis"] = analysis.model_dump()
    lead["priorityScore"] = score
    lead["priorityLabel"] = label
    return lead
