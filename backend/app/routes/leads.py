from datetime import datetime, timezone
import uuid
from fastapi import APIRouter, HTTPException
from app.database.mongodb import db
from app.schemas.lead import (
    LeadCreate,
    LeadListItem,
    LeadResponse,
    LeadStatusUpdate,
    FollowUpItem,
)
from app.services.ai import analyze_lead, generate_follow_up
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
        "status": "SUBMITTED",
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


@router.delete("/{lead_id}")
def delete_lead(lead_id: str):
    res = db["leads"].delete_one({"id": lead_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "ok", "message": "Lead deleted successfully"}



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


@router.patch("/{lead_id}/status", response_model=LeadResponse)
def update_lead_status(lead_id: str, payload: LeadStatusUpdate):
    lead = db["leads"].find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    now = datetime.now(timezone.utc).isoformat()
    db["leads"].update_one(
        {"id": lead_id},
        {"$set": {"status": payload.status, "updatedAt": now}},
    )

    lead["status"] = payload.status
    lead["updatedAt"] = now
    return lead


@router.post("/{lead_id}/follow-up-plan", response_model=FollowUpItem)
def create_follow_up_plan(lead_id: str):
    lead = db["leads"].find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    follow_up = generate_follow_up(lead)
    follow_up_dict = follow_up.model_dump()
    now = datetime.now(timezone.utc).isoformat()

    db["leads"].update_one(
        {"id": lead_id},
        {
            "$push": {"followUpPlan": follow_up_dict},
            "$set": {"updatedAt": now},
        },
    )

    return follow_up

