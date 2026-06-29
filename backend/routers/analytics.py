"""
Analytics Router — Dashboard metrics and chart data.
"""
import json
import os
from fastapi import APIRouter
from collections import Counter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

CANDIDATES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "candidates.json")
JOBS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")


def load_candidates():
    with open(CANDIDATES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_jobs():
    with open(JOBS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/overview")
def get_overview():
    """Dashboard KPI cards."""
    candidates = load_candidates()
    jobs = load_jobs()

    avg_engagement = round(
        sum(c.get("behavioral_signals", {}).get("engagement_score", 70) for c in candidates) / max(len(candidates), 1),
        1
    )

    return {
        "total_candidates": len(candidates),
        "active_jobs": len([j for j in jobs if j.get("status") == "active"]),
        "avg_match_score": 74.3,  # representative for PoC
        "interviews_scheduled": 8,
        "new_candidates_this_week": 6,
        "avg_engagement": avg_engagement,
        "shortlisted": 12,
        "hired_this_month": 2,
    }


@router.get("/skill-distribution")
def get_skill_distribution():
    """Top skills across candidate pool."""
    candidates = load_candidates()
    skill_counter = Counter()
    for c in candidates:
        for skill in c.get("skills", []):
            skill_counter[skill] += 1

    top_skills = [{"skill": k, "count": v} for k, v in skill_counter.most_common(12)]
    return {"skills": top_skills}


@router.get("/industry-distribution")
def get_industry_distribution():
    """Industry breakdown of candidate pool."""
    candidates = load_candidates()
    industry_counter = Counter(c.get("industry", "Other") for c in candidates)
    return {
        "industries": [{"industry": k, "count": v} for k, v in industry_counter.most_common()]
    }


@router.get("/experience-distribution")
def get_experience_distribution():
    """Experience level distribution."""
    candidates = load_candidates()
    buckets = {"0-2 yrs": 0, "3-5 yrs": 0, "6-8 yrs": 0, "9-12 yrs": 0, "13+ yrs": 0}
    for c in candidates:
        yrs = c.get("years_experience", 0)
        if yrs <= 2:
            buckets["0-2 yrs"] += 1
        elif yrs <= 5:
            buckets["3-5 yrs"] += 1
        elif yrs <= 8:
            buckets["6-8 yrs"] += 1
        elif yrs <= 12:
            buckets["9-12 yrs"] += 1
        else:
            buckets["13+ yrs"] += 1
    return {"distribution": [{"range": k, "count": v} for k, v in buckets.items()]}


@router.get("/match-score-trend")
def get_match_score_trend():
    """Simulated match score trend over time (last 8 weeks)."""
    trend = [
        {"week": "W1", "avg_score": 61, "top_score": 78},
        {"week": "W2", "avg_score": 63, "top_score": 81},
        {"week": "W3", "avg_score": 65, "top_score": 83},
        {"week": "W4", "avg_score": 68, "top_score": 85},
        {"week": "W5", "avg_score": 70, "top_score": 87},
        {"week": "W6", "avg_score": 72, "top_score": 89},
        {"week": "W7", "avg_score": 74, "top_score": 91},
        {"week": "W8", "avg_score": 76, "top_score": 93},
    ]
    return {"trend": trend}


@router.get("/hiring-funnel")
def get_hiring_funnel():
    """Hiring pipeline funnel data."""
    funnel = [
        {"stage": "Sourced", "count": 87},
        {"stage": "Screened", "count": 45},
        {"stage": "AI Shortlisted", "count": 20},
        {"stage": "Interviewing", "count": 8},
        {"stage": "Offered", "count": 3},
        {"stage": "Hired", "count": 2},
    ]
    return {"funnel": funnel}


@router.get("/candidate-sources")
def get_candidate_sources():
    """Candidate source breakdown."""
    sources = [
        {"source": "Platform Organic", "count": 42, "color": "#6366f1"},
        {"source": "LinkedIn", "count": 23, "color": "#8b5cf6"},
        {"source": "GitHub", "count": 12, "color": "#06b6d4"},
        {"source": "Referrals", "count": 8, "color": "#10b981"},
        {"source": "Job Boards", "count": 5, "color": "#f59e0b"},
    ]
    return {"sources": sources}


@router.get("/engagement-distribution")
def get_engagement_distribution():
    """Candidate engagement score distribution."""
    candidates = load_candidates()
    buckets = {"0-40": 0, "41-60": 0, "61-75": 0, "76-90": 0, "91-100": 0}
    for c in candidates:
        score = c.get("behavioral_signals", {}).get("engagement_score", 50)
        if score <= 40:
            buckets["0-40"] += 1
        elif score <= 60:
            buckets["41-60"] += 1
        elif score <= 75:
            buckets["61-75"] += 1
        elif score <= 90:
            buckets["76-90"] += 1
        else:
            buckets["91-100"] += 1
    return {"distribution": [{"range": k, "count": v} for k, v in buckets.items()]}
