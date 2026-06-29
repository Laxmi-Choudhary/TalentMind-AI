"""
Assistant Router — Conversational recruiter assistant with NL search.
"""
import json
import os
import re
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/assistant", tags=["Assistant"])

CANDIDATES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "candidates.json")
JOBS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")


def load_candidates():
    with open(CANDIDATES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_jobs():
    with open(JOBS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


class AssistantQuery(BaseModel):
    query: str
    context: Optional[str] = None


def parse_nl_query(query: str, candidates: list) -> dict:
    """
    Simple NL query parser — extracts intent and filters.
    """
    q = query.lower()

    # Extract skills mentioned
    all_skills = set()
    for c in candidates:
        for s in c.get("skills", []):
            all_skills.add(s.lower())

    mentioned_skills = [s for s in all_skills if s in q]

    # Extract experience hints
    exp_match = re.search(r'(\d+)\+?\s*years?', q)
    min_exp = int(exp_match.group(1)) if exp_match else None

    # Extract industry hints
    industry_keywords = {
        "fintech": "FinTech", "payment": "FinTech", "banking": "FinTech",
        "ml": "AI/ML", "machine learning": "AI/ML", "ai": "AI/ML",
        "cloud": "Cloud Infrastructure", "devops": "Cloud Infrastructure",
        "mobile": "Mobile Tech", "android": "Mobile Tech", "ios": "Mobile Tech",
        "blockchain": "Web3/Blockchain", "web3": "Web3/Blockchain",
        "saas": "SaaS", "startup": "SaaS",
        "security": "Cybersecurity",
    }
    found_industry = None
    for kw, ind in industry_keywords.items():
        if kw in q:
            found_industry = ind
            break

    # Extract seniority hints
    seniority = None
    if "senior" in q or "experienced" in q:
        seniority = "senior"
    elif "junior" in q or "entry" in q:
        seniority = "junior"
    elif "lead" in q or "manager" in q:
        seniority = "lead"

    # Filter candidates
    results = candidates[:]
    if mentioned_skills:
        results = [c for c in results if any(
            ms in [s.lower() for s in c.get("skills", [])] for ms in mentioned_skills
        )]
    if min_exp:
        results = [c for c in results if c.get("years_experience", 0) >= min_exp]
    if found_industry:
        results = [c for c in results if found_industry.lower() in c.get("industry", "").lower()]
    if seniority == "senior":
        results = [c for c in results if c.get("years_experience", 0) >= 5]
    elif seniority == "junior":
        results = [c for c in results if c.get("years_experience", 0) <= 3]
    elif seniority == "lead":
        results = [c for c in results if c.get("years_experience", 0) >= 7]

    # Sort by engagement
    results.sort(key=lambda c: c.get("behavioral_signals", {}).get("engagement_score", 0), reverse=True)

    return {
        "intent": "candidate_search",
        "filters": {
            "skills": mentioned_skills,
            "min_experience": min_exp,
            "industry": found_industry,
            "seniority": seniority,
        },
        "results": results[:6],
        "count": len(results),
    }


def generate_response(query: str, parsed: dict) -> str:
    """Generate a natural language response."""
    count = parsed["count"]
    filters = parsed["filters"]

    if count == 0:
        return f"I couldn't find any candidates matching your query. Try broadening the search — for example, remove specific skill requirements or adjust the experience range."

    parts = []
    if filters.get("skills"):
        parts.append(f"with skills in {', '.join(filters['skills'][:3])}")
    if filters.get("min_experience"):
        parts.append(f"with {filters['min_experience']}+ years of experience")
    if filters.get("industry"):
        parts.append(f"in {filters['industry']}")
    if filters.get("seniority"):
        parts.append(f"at {filters['seniority']} level")

    filter_str = " ".join(parts) if parts else ""
    top_name = parsed["results"][0]["name"] if parsed["results"] else "candidates"

    return (
        f"I found **{count} candidates** {filter_str}. "
        f"Showing the top {min(count, 6)} by engagement score. "
        f"Top match: **{top_name}** — {parsed['results'][0].get('title', '')} "
        f"({parsed['results'][0].get('years_experience', 0)} years experience). "
        f"Would you like me to rank these against a specific job?"
    )


@router.post("/query")
def query_assistant(body: AssistantQuery):
    """
    Natural language recruiter assistant query.
    Understands intent and returns filtered candidates with a conversational response.
    """
    candidates = load_candidates()
    parsed = parse_nl_query(body.query, candidates)
    response = generate_response(body.query, parsed)

    return {
        "query": body.query,
        "response": response,
        "candidates": parsed["results"],
        "filters_applied": parsed["filters"],
        "total_found": parsed["count"],
    }


@router.get("/suggestions")
def get_suggestions():
    """Return suggested prompts for the assistant."""
    return {
        "suggestions": [
            "Show me senior Python engineers with AWS experience",
            "Find ML engineers with 5+ years in FinTech",
            "Who are the most active candidates in the last week?",
            "Show me full stack developers open to remote work",
            "Find architects with 10+ years of experience",
            "Show candidates with Kubernetes expertise",
        ]
    }
