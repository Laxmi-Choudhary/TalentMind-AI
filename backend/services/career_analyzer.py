"""
Career Analyzer Service
Analyzes career trajectory, growth velocity, and stability signals.
"""
from typing import Dict, List
import math


def compute_growth_velocity(experience: List[Dict]) -> float:
    """
    Score career growth by analyzing role progressions.
    Rewards upward movement (Junior → Senior → Lead → Manager → Director).
    """
    if not experience:
        return 50.0

    progression_ranks = {
        "intern": 0, "junior": 1, "associate": 1, "developer": 2,
        "engineer": 2, "analyst": 2, "senior": 3, "lead": 4,
        "staff": 5, "principal": 6, "manager": 5, "architect": 6,
        "director": 7, "vp": 8, "head": 7, "chief": 9, "cto": 9, "ceo": 10,
    }

    def get_rank(role: str) -> int:
        role_lower = role.lower()
        max_rank = 2  # default engineer-level
        for keyword, rank in progression_ranks.items():
            if keyword in role_lower:
                max_rank = max(max_rank, rank)
        return max_rank

    ranks = [get_rank(exp.get("role", "")) for exp in experience]

    if len(ranks) < 2:
        # Single role — check level
        return min(100, 50 + ranks[0] * 8)

    # Check overall upward trend
    upward_moves = sum(1 for i in range(1, len(ranks)) if ranks[i] >= ranks[i - 1])
    lateral_moves = sum(1 for i in range(1, len(ranks)) if ranks[i] < ranks[i - 1])

    progression_score = (upward_moves / (len(ranks) - 1)) * 100
    penalty = lateral_moves * 8
    current_level_bonus = ranks[0] * 5  # most recent role weight

    score = progression_score - penalty + current_level_bonus
    return round(min(100, max(20, score)), 1)


def compute_stability_score(experience: List[Dict], years_total: int) -> float:
    """
    Score career stability.
    Penalizes very short tenures; rewards 2-4 year stints at reputable companies.
    """
    if not experience:
        return 50.0

    tenures = [exp.get("years", 0) for exp in experience]
    if not tenures:
        return 50.0

    avg_tenure = sum(tenures) / len(tenures)
    short_stints = sum(1 for t in tenures if t < 1)
    long_stints = sum(1 for t in tenures if t >= 3)

    # Base: average tenure score (2-4 years ideal)
    if avg_tenure < 1:
        base = 30
    elif avg_tenure < 1.5:
        base = 50
    elif avg_tenure < 2:
        base = 65
    elif avg_tenure < 3:
        base = 80
    elif avg_tenure < 5:
        base = 90
    else:
        base = 85  # very long stints may indicate stagnation

    penalty = short_stints * 10
    bonus = long_stints * 5

    return round(min(100, max(20, base - penalty + bonus)), 1)


def compute_leadership_score(candidate: Dict) -> float:
    """
    Infer leadership potential from role titles, team sizes, and project descriptions.
    """
    ai_score = candidate.get("ai_scores", {}).get("leadership", 0)
    if ai_score:
        return float(ai_score)

    experience = candidate.get("experience", [])
    soft_skills = [s.lower() for s in candidate.get("soft_skills", [])]
    years = candidate.get("years_experience", 0)

    leadership_keywords = ["lead", "manager", "director", "head", "architect", "principal", "staff", "chief"]
    leadership_soft = ["leadership", "mentoring", "training", "coaching", "vision", "strategy"]

    role_bonus = sum(10 for exp in experience
                     if any(kw in exp.get("role", "").lower() for kw in leadership_keywords))

    soft_bonus = sum(8 for skill in soft_skills if any(kw in skill for kw in leadership_soft))
    seniority_bonus = min(30, years * 2)

    score = 40 + role_bonus + soft_bonus + seniority_bonus
    return round(min(100, score), 1)


def compute_domain_expertise(candidate: Dict, job_industry: str) -> float:
    """Score depth of domain expertise."""
    ai_score = candidate.get("ai_scores", {}).get("domain_expertise", 0)
    if ai_score:
        # Adjust by industry match
        industry_bonus = 10 if candidate.get("industry", "").lower() == job_industry.lower() else -5
        return round(min(100, ai_score + industry_bonus), 1)

    years = candidate.get("years_experience", 0)
    certs = len(candidate.get("certifications", []))
    projects = len(candidate.get("projects", []))

    base = min(60, years * 6)
    cert_bonus = min(20, certs * 5)
    project_bonus = min(20, projects * 5)

    return round(min(100, base + cert_bonus + project_bonus), 1)


def compute_learning_agility(candidate: Dict) -> float:
    """Score candidate's learning velocity and adaptability."""
    ai_score = candidate.get("ai_scores", {}).get("learning_agility", 0)
    if ai_score:
        return float(ai_score)

    certs = len(candidate.get("certifications", []))
    behavioral = candidate.get("behavioral_signals", {})
    courses = behavioral.get("courses_completed", 0)
    commits = behavioral.get("github_commits_30d", 0)

    base = 50
    cert_bonus = min(20, certs * 5)
    course_bonus = min(15, courses * 3)
    github_bonus = min(15, commits // 5)

    return round(min(100, base + cert_bonus + course_bonus + github_bonus), 1)


def analyze_career(candidate: Dict, job: Dict, parsed_job: Dict) -> Dict:
    """
    Full career trajectory analysis.
    """
    experience = candidate.get("experience", [])
    years = candidate.get("years_experience", 0)

    growth_score = candidate.get("ai_scores", {}).get("career_growth") or \
        compute_growth_velocity(experience)
    stability_score = candidate.get("ai_scores", {}).get("stability") or \
        compute_stability_score(experience, years)
    leadership_score = compute_leadership_score(candidate)
    domain_score = compute_domain_expertise(candidate, parsed_job.get("industry", ""))
    learning_score = compute_learning_agility(candidate)
    skill_depth = candidate.get("ai_scores", {}).get("skill_depth") or \
        min(100, len(candidate.get("skills", [])) * 6 + len(candidate.get("certifications", [])) * 8)

    # Career trajectory composite
    trajectory_score = round(
        growth_score * 0.35 +
        stability_score * 0.25 +
        leadership_score * 0.20 +
        learning_score * 0.20,
        1
    )

    return {
        "growth_score": round(growth_score, 1),
        "stability_score": round(stability_score, 1),
        "leadership_score": round(leadership_score, 1),
        "domain_expertise_score": round(domain_score, 1),
        "learning_agility_score": round(learning_score, 1),
        "skill_depth_score": round(skill_depth, 1),
        "trajectory_score": round(trajectory_score, 1),
        "companies": [exp.get("company") for exp in experience],
        "career_span_years": years,
        "num_roles": len(experience),
    }
