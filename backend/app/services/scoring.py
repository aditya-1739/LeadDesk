from app.schemas.analysis import LeadAnalysis


def _normalize_score(value: int) -> int:
    # Handle LLMs that occasionally return 0-10 ratings instead of 0-100 percentages.
    if 0 <= value <= 10:
        return value * 10
    if 10 < value <= 100:
        return value
    raise ValueError(f"Score {value} is out of expected 0-100 range.")


def calculate_priority(analysis: LeadAnalysis) -> tuple[int, str]:
    intent = _normalize_score(analysis.intentStrength.score)
    timeline = _normalize_score(analysis.timelineUrgency.score)
    budget = _normalize_score(analysis.budgetFit.score)
    clarity = _normalize_score(analysis.requirementClarity.score)
    engagement = _normalize_score(analysis.engagementSignal.score)

    score = round(
        intent * 0.25
        + timeline * 0.25
        + budget * 0.20
        + clarity * 0.15
        + engagement * 0.15
    )

    if score >= 80:
        label = "HOT"
    elif score >= 50:
        label = "WARM"
    else:
        label = "COLD"

    return score, label
