"""
Semantic Matcher Service
Computes semantic similarity between job requirements and candidate profiles
using TF-IDF vectorization and cosine similarity.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List
import numpy as np
import re


def _normalize(text: str) -> str:
    """Lowercase and normalize text for comparison."""
    return re.sub(r'[^a-zA-Z0-9 ]', ' ', text.lower())


def _skills_to_text(skills: List[str]) -> str:
    """Convert skills list to normalized text."""
    return _normalize(' '.join(skills))


def compute_skill_match(job_skills: List[str], candidate_skills: List[str]) -> Dict:
    """
    Compute skill match using TF-IDF cosine similarity + direct overlap.
    Returns score 0-100 and matched/missing skill lists.
    """
    job_set = {s.lower() for s in job_skills}
    cand_set = {s.lower() for s in candidate_skills}

    # Direct overlap
    matched = [s for s in job_skills if s.lower() in cand_set]
    missing = [s for s in job_skills if s.lower() not in cand_set]
    direct_ratio = len(matched) / max(len(job_set), 1)

    # Semantic similarity via TF-IDF
    job_text = _skills_to_text(job_skills)
    cand_text = _skills_to_text(candidate_skills)

    if job_text.strip() and cand_text.strip():
        try:
            vectorizer = TfidfVectorizer(ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform([job_text, cand_text])
            semantic_score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        except Exception:
            semantic_score = direct_ratio
    else:
        semantic_score = 0.0

    # Blend: 60% direct, 40% semantic
    blended = (direct_ratio * 0.6 + semantic_score * 0.4) * 100
    final_score = min(100, round(blended, 1))

    return {
        "score": final_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_coverage": round(direct_ratio * 100, 1),
    }


def compute_experience_match(job_seniority: Dict, candidate_years: int) -> float:
    """Score experience years against job seniority requirements."""
    min_yr = job_seniority.get("min_years", 0)
    max_yr = job_seniority.get("max_years", 20)
    mid_yr = (min_yr + max_yr) / 2

    if candidate_years < min_yr:
        # Under-experienced — penalize
        deficit = min_yr - candidate_years
        score = max(30, 100 - (deficit * 15))
    elif candidate_years > max_yr + 3:
        # Significantly over-experienced — slight penalty
        excess = candidate_years - max_yr - 3
        score = max(70, 100 - (excess * 5))
    else:
        # Within range — reward proximity to midpoint
        distance = abs(candidate_years - mid_yr)
        max_distance = (max_yr - min_yr) / 2
        score = 100 - (distance / max(max_distance, 1)) * 20

    return round(min(100, max(0, score)), 1)


def compute_culture_match(job_culture: List[str], candidate_culture: List[str]) -> float:
    """Score culture alignment between job and candidate."""
    if not job_culture or not candidate_culture:
        return 70.0  # neutral default

    job_culture_lower = {c.lower() for c in job_culture}
    cand_culture_lower = {c.lower() for c in candidate_culture}

    # Semantic overlap
    job_text = _normalize(' '.join(job_culture))
    cand_text = _normalize(' '.join(candidate_culture))

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([job_text, cand_text])
        sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    except Exception:
        sim = 0.5

    # Direct overlap bonus
    direct_overlap = len(job_culture_lower & cand_culture_lower) / max(len(job_culture_lower), 1)

    blended = (sim * 0.5 + direct_overlap * 0.5) * 100
    return round(min(100, max(40, blended + 40)), 1)


def compute_industry_match(job_industry: str, candidate_industry: str) -> float:
    """Score industry domain alignment."""
    if job_industry.lower() == candidate_industry.lower():
        return 95.0

    # Fuzzy industry groups
    groups = [
        {"FinTech", "Banking", "Payments", "Finance"},
        {"E-Commerce", "Retail", "D2C"},
        {"AI/ML", "Data Science", "Analytics"},
        {"Cloud Infrastructure", "DevOps", "SRE", "Platform"},
        {"SaaS", "Enterprise IT", "B2B"},
        {"Mobile Tech", "Gaming"},
        {"HealthTech", "BioTech"},
        {"Web3/Blockchain", "Crypto"},
    ]

    job_i = job_industry.lower()
    cand_i = candidate_industry.lower()

    for group in groups:
        group_lower = {g.lower() for g in group}
        if job_i in group_lower and cand_i in group_lower:
            return 78.0

    return 55.0


def compute_semantic_score(job: Dict, candidate: Dict, parsed_job: Dict) -> Dict:
    """
    Master semantic scoring function.
    Returns all sub-scores and the overall semantic match.
    """
    req_skills = parsed_job.get("required_skills", []) + parsed_job.get("preferred_skills", [])
    skill_match = compute_skill_match(req_skills, candidate.get("skills", []))

    exp_match = compute_experience_match(
        parsed_job.get("seniority", {}),
        candidate.get("years_experience", 0)
    )

    culture_match = compute_culture_match(
        parsed_job.get("culture_fit", []),
        candidate.get("culture_fit", [])
    )

    industry_match = compute_industry_match(
        parsed_job.get("industry", ""),
        candidate.get("industry", "")
    )

    # Career fit = blend of industry + seniority alignment
    career_fit = round((industry_match * 0.5 + exp_match * 0.5), 1)

    # Overall semantic: weighted combination
    overall = round(
        skill_match["score"] * 0.45 +
        exp_match * 0.25 +
        culture_match * 0.15 +
        industry_match * 0.15,
        1
    )

    return {
        "overall": min(100, overall),
        "skill_match": skill_match["score"],
        "experience_match": exp_match,
        "culture_match": culture_match,
        "career_fit": career_fit,
        "industry_match": industry_match,
        "matched_skills": skill_match["matched_skills"],
        "missing_skills": skill_match["missing_skills"],
    }
