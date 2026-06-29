"""
Rankings Router — Hybrid candidate ranking engine endpoints.
"""
import json
import os
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.ranking_engine import rank_candidates
from services.xai_generator import generate_xai

router = APIRouter(prefix="/rankings", tags=["Rankings"])

CANDIDATES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "candidates.json")
JOBS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")


def load_candidates():
    with open(CANDIDATES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_jobs():
    with open(JOBS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/{job_id}")
def get_rankings(
    job_id: str,
    limit: int = Query(default=20, ge=1, le=20),
    min_score: float = Query(default=0, ge=0, le=100),
):
    """
    Get AI-ranked candidates for a specific job.
    Returns ranked shortlist with full scoring and XAI explanations.
    """
    jobs = load_jobs()
    job = next((j for j in jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(404, "Job not found")

    candidates = load_candidates()
    ranked = rank_candidates(job, candidates)

    # Filter by minimum score
    ranked = [r for r in ranked if r["scores"]["hybrid"] >= min_score]

    # Attach XAI explanations
    results = []
    for item in ranked[:limit]:
        xai = generate_xai(
            item["candidate"],
            item["scores"],
            item["semantic_analysis"],
            item["career_analysis"],
        )
        results.append({
            "rank": item["rank"],
            "candidate": item["candidate"],
            "scores": item["scores"],
            "match_breakdown": item["match_breakdown"],
            "career_analysis": item["career_analysis"],
            "behavioral_analysis": item["behavioral_analysis"],
            "semantic_analysis": item["semantic_analysis"],
            "xai": xai,
        })

    return {
        "job_id": job_id,
        "job_title": job["title"],
        "total_candidates": len(candidates),
        "ranked_count": len(results),
        "rankings": results,
    }


@router.get("/{job_id}/candidate/{candidate_id}")
def get_candidate_ranking(job_id: str, candidate_id: str):
    """Get detailed ranking for a specific candidate against a job."""
    jobs = load_jobs()
    job = next((j for j in jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(404, "Job not found")

    candidates = load_candidates()
    candidate = next((c for c in candidates if c["id"] == candidate_id), None)
    if not candidate:
        raise HTTPException(404, "Candidate not found")

    ranked = rank_candidates(job, [candidate])
    if not ranked:
        raise HTTPException(500, "Ranking failed")

    item = ranked[0]
    xai = generate_xai(
        item["candidate"],
        item["scores"],
        item["semantic_analysis"],
        item["career_analysis"],
    )

    return {
        "job": job,
        "candidate": item["candidate"],
        "scores": item["scores"],
        "match_breakdown": item["match_breakdown"],
        "career_analysis": item["career_analysis"],
        "behavioral_analysis": item["behavioral_analysis"],
        "xai": xai,
    }
