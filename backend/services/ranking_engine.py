"""
Hybrid Ranking Engine
Ranks candidates using weighted composite scoring:
  35% Semantic Fit
  20% Career Trajectory
  15% Skill Depth
  15% Behavioral Signals
  10% Culture Fit
   5% Recency
"""
from typing import List, Dict
from .semantic_matcher import compute_semantic_score
from .career_analyzer import analyze_career
from .behavioral_scorer import score_behavioral_signals
from .job_parser import parse_job_description

WEIGHTS = {
    "semantic_fit": 0.35,
    "career_trajectory": 0.20,
    "skill_depth": 0.15,
    "behavioral_signals": 0.15,
    "culture_fit": 0.10,
    "recency": 0.05,
}


def rank_candidates(job: Dict, candidates: List[Dict]) -> List[Dict]:
    """
    Full ranking pipeline for a given job + candidate pool.
    Returns ranked list with all sub-scores and explanations.
    """
    parsed_job = parse_job_description(job)
    ranked = []

    for candidate in candidates:
        # --- Compute all signal scores ---
        semantic = compute_semantic_score(job, candidate, parsed_job)
        career = analyze_career(candidate, job, parsed_job)
        behavioral = score_behavioral_signals(candidate)

        # Culture fit (normalized from semantic culture_match)
        culture_score = semantic.get("culture_match", 70)

        # Recency score
        recency_score = behavioral.get("recency_score", 60)

        # Skill depth (from career analysis)
        skill_depth_score = career.get("skill_depth_score", 70)

        # --- Composite hybrid score ---
        hybrid_score = round(
            semantic["overall"] * WEIGHTS["semantic_fit"] +
            career["trajectory_score"] * WEIGHTS["career_trajectory"] +
            skill_depth_score * WEIGHTS["skill_depth"] +
            behavioral["engagement_score"] * WEIGHTS["behavioral_signals"] +
            culture_score * WEIGHTS["culture_fit"] +
            recency_score * WEIGHTS["recency"],
            2
        )

        ranked.append({
            "candidate": candidate,
            "scores": {
                "hybrid": round(hybrid_score, 1),
                "semantic_fit": round(semantic["overall"], 1),
                "career_trajectory": round(career["trajectory_score"], 1),
                "skill_depth": round(skill_depth_score, 1),
                "behavioral": round(behavioral["engagement_score"], 1),
                "culture_fit": round(culture_score, 1),
                "recency": round(recency_score, 1),
            },
            "match_breakdown": {
                "overall": round(hybrid_score, 1),
                "skill_match": round(semantic["skill_match"], 1),
                "experience_match": round(semantic["experience_match"], 1),
                "culture_match": round(culture_score, 1),
                "career_fit": round(semantic["career_fit"], 1),
            },
            "career_analysis": career,
            "behavioral_analysis": behavioral,
            "semantic_analysis": {
                "matched_skills": semantic.get("matched_skills", []),
                "missing_skills": semantic.get("missing_skills", []),
                "industry_match": semantic.get("industry_match", 0),
            },
            "parsed_job": parsed_job,
        })

    # Sort descending by hybrid score
    ranked.sort(key=lambda x: x["scores"]["hybrid"], reverse=True)

    # Assign ranks
    for i, item in enumerate(ranked):
        item["rank"] = i + 1

    return ranked
