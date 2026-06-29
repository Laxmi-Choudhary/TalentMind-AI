"""
Candidates Router — Candidate management and profile endpoints.
"""
import json
import os
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List

router = APIRouter(prefix="/candidates", tags=["Candidates"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "candidates.json")


def load_candidates():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/")
def get_candidates(
    industry: Optional[str] = None,
    location: Optional[str] = None,
    min_experience: Optional[int] = None,
    max_experience: Optional[int] = None,
    skills: Optional[str] = None,
    remote_only: Optional[bool] = None,
    search: Optional[str] = None,
):
    """Get candidates with optional filters."""
    candidates = load_candidates()

    if industry:
        candidates = [c for c in candidates if industry.lower() in c.get("industry", "").lower()]
    if location:
        candidates = [c for c in candidates if location.lower() in c.get("location", "").lower()]
    if min_experience is not None:
        candidates = [c for c in candidates if c.get("years_experience", 0) >= min_experience]
    if max_experience is not None:
        candidates = [c for c in candidates if c.get("years_experience", 0) <= max_experience]
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        candidates = [
            c for c in candidates
            if any(s in [sk.lower() for sk in c.get("skills", [])] for s in skill_list)
        ]
    if remote_only:
        candidates = [c for c in candidates if c.get("open_to_remote")]
    if search:
        q = search.lower()
        candidates = [
            c for c in candidates
            if q in c.get("name", "").lower()
            or q in c.get("title", "").lower()
            or q in " ".join(c.get("skills", [])).lower()
            or q in c.get("industry", "").lower()
        ]

    return {"candidates": candidates, "total": len(candidates)}


@router.get("/{candidate_id}")
def get_candidate(candidate_id: str):
    """Get a single candidate by ID."""
    candidates = load_candidates()
    candidate = next((c for c in candidates if c["id"] == candidate_id), None)
    if not candidate:
        raise HTTPException(404, "Candidate not found")
    return {"candidate": candidate}


@router.get("/{candidate_id}/similar")
def get_similar_candidates(candidate_id: str, limit: int = 4):
    """Find similar candidates based on skills and industry."""
    candidates = load_candidates()
    target = next((c for c in candidates if c["id"] == candidate_id), None)
    if not target:
        raise HTTPException(404, "Candidate not found")

    target_skills = set(s.lower() for s in target.get("skills", []))
    target_industry = target.get("industry", "").lower()

    scored = []
    for c in candidates:
        if c["id"] == candidate_id:
            continue
        cand_skills = set(s.lower() for s in c.get("skills", []))
        skill_overlap = len(target_skills & cand_skills) / max(len(target_skills), 1)
        industry_match = 1.0 if c.get("industry", "").lower() == target_industry else 0.3
        similarity = round((skill_overlap * 0.7 + industry_match * 0.3) * 100, 1)
        scored.append({"candidate": c, "similarity": similarity})

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return {"similar": scored[:limit]}
