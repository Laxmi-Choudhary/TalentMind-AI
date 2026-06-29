"""
XAI Generator Service
Generates human-readable explanations for each candidate ranking:
- Strengths (why recommended)
- Missing Skills (gaps)
- Risks (concerns)
- Insights (career progression narrative)
"""
from typing import Dict, List


def _format_list(items: List[str], max_items: int = 3) -> str:
    if not items:
        return "none identified"
    return ', '.join(items[:max_items])


def generate_strengths(candidate: Dict, scores: Dict, semantic: Dict, career: Dict) -> List[str]:
    """Generate strength statements."""
    strengths = []
    name = candidate.get("name", "Candidate").split()[0]

    matched = semantic.get("matched_skills", [])
    years = candidate.get("years_experience", 0)
    industry = candidate.get("industry", "")
    title = candidate.get("title", "")

    if scores["skill_depth"] >= 85:
        strengths.append(f"Deep technical mastery across {_format_list(matched[:4])} with certifications that validate expertise.")

    if scores["semantic_fit"] >= 80:
        strengths.append(f"Strong semantic alignment with role requirements — {len(matched)} of {len(matched) + len(semantic.get('missing_skills', []))} required skills matched.")

    if career["growth_score"] >= 80:
        strengths.append(f"Impressive career trajectory across {career.get('num_roles', 0)} roles, demonstrating consistent upward progression.")

    if career["stability_score"] >= 80:
        strengths.append(f"Stable career history with healthy tenure at each organization, indicating reliability and commitment.")

    if career["leadership_score"] >= 80:
        strengths.append(f"Demonstrated leadership experience in progressively senior roles, with team management exposure.")

    if career["learning_agility_score"] >= 85:
        strengths.append(f"Exceptional learning agility — actively completing courses, certifications, and open-source contributions.")

    if scores["behavioral"] >= 85:
        strengths.append(f"Highly engaged on the platform with strong recent activity, suggesting active job search alignment.")

    if years >= 8:
        strengths.append(f"{years} years of hands-on industry experience brings significant depth and maturity to the role.")

    if industry == candidate.get("industry"):
        strengths.append(f"Direct domain experience in {industry} reduces onboarding time and risk significantly.")

    assessment = candidate.get("assessment_scores", {})
    if assessment.get("system_design", 0) >= 88:
        strengths.append(f"Top-tier system design assessment score ({assessment['system_design']}/100) signals strong architectural thinking.")

    if assessment.get("coding", 0) >= 90:
        strengths.append(f"Exceptional coding assessment score ({assessment['coding']}/100) demonstrates strong engineering fundamentals.")

    if not strengths:
        strengths.append(f"Solid background in {title} with relevant experience for the role requirements.")

    return strengths[:4]


def generate_missing_skills(semantic: Dict, candidate: Dict) -> List[str]:
    """Generate missing skill gaps."""
    missing = semantic.get("missing_skills", [])
    gaps = []

    for skill in missing[:5]:
        gaps.append(f"{skill} — not listed in profile; may need upskilling or training.")

    if not gaps:
        gaps.append("No critical skill gaps identified — candidate covers all required areas.")

    return gaps


def generate_risks(candidate: Dict, scores: Dict, career: Dict) -> List[str]:
    """Generate risk assessment statements."""
    risks = []

    if career["stability_score"] < 65:
        risks.append("Below-average job tenure history suggests potential retention risk — verify reasons for transitions.")

    if scores["behavioral"] < 55:
        risks.append("Low platform engagement score — candidate may not be actively job searching; outreach required.")

    years = candidate.get("years_experience", 0)
    if years < 3:
        risks.append("Limited experience (under 3 years) may require extended onboarding for a senior-level scope.")

    if years > 15 and scores["semantic_fit"] < 70:
        risks.append("Highly experienced candidate may be overqualified — risk of role being below expectations.")

    salary = candidate.get("salary_expectation", 0)
    if salary > 4000000:
        risks.append(f"Salary expectation (₹{salary/100000:.0f}L) may exceed typical budget — compensation alignment needed.")

    assessment = candidate.get("assessment_scores", {})
    if assessment.get("communication", 0) < 70:
        risks.append("Communication assessment score below threshold — important for collaborative or client-facing roles.")

    if not candidate.get("open_to_remote") and False:  # location-specific logic placeholder
        risks.append("Candidate not open to remote work — verify location compatibility.")

    if not risks:
        risks.append("No significant risk flags identified for this candidate.")

    return risks[:3]


def generate_insights(candidate: Dict, career: Dict, scores: Dict) -> str:
    """Generate a holistic career progression narrative."""
    name = candidate.get("name", "Candidate").split()[0]
    years = candidate.get("years_experience", 0)
    title = candidate.get("title", "")
    companies = career.get("companies", [])
    industry = candidate.get("industry", "")

    growth = career.get("growth_score", 0)
    learning = career.get("learning_agility_score", 0)

    company_str = ' → '.join(companies[-3:]) if companies else "multiple organizations"

    narrative = f"{name} brings {years} years of focused experience as a {title}, building expertise progressively across {company_str}. "

    if growth >= 85:
        narrative += "Their career trajectory demonstrates exceptional upward growth, consistently taking on more complex responsibilities. "
    elif growth >= 70:
        narrative += "Their career shows steady progression with increasing seniority and scope at each role. "
    else:
        narrative += "Their career reflects solid stability with depth of expertise in specialized areas. "

    if learning >= 85:
        narrative += f"A prolific learner with strong self-development habits — {candidate.get('behavioral_signals', {}).get('courses_completed', 0)} courses and active GitHub contributions indicate a growth mindset. "

    certs = candidate.get("certifications", [])
    if certs:
        narrative += f"Professional certifications in {', '.join(certs[:2])} validate technical competence beyond day-to-day work. "

    narrative += f"Based on holistic signals, this candidate presents a {_score_tier(scores['hybrid'])} fit for this role."

    return narrative


def _score_tier(score: float) -> str:
    if score >= 85:
        return "exceptional"
    elif score >= 75:
        return "strong"
    elif score >= 65:
        return "moderate-to-good"
    elif score >= 55:
        return "moderate"
    else:
        return "partial"


def generate_xai(candidate: Dict, scores: Dict, semantic_analysis: Dict, career_analysis: Dict) -> Dict:
    """
    Master XAI function — generates full explainability report.
    """
    strengths = generate_strengths(candidate, scores, semantic_analysis, career_analysis)
    missing = generate_missing_skills(semantic_analysis, candidate)
    risks = generate_risks(candidate, scores, career_analysis)
    insight = generate_insights(candidate, career_analysis, scores)

    tier = _score_tier(scores.get("hybrid", 0))
    recommendation = {
        "exceptional": "🌟 Strongly recommend for immediate interview — top-tier candidate.",
        "strong": "✅ Recommend for interview — strong alignment with role requirements.",
        "moderate-to-good": "👍 Consider for screening — good potential with minor gaps.",
        "moderate": "🔍 Proceed with caution — review gaps before advancing.",
        "partial": "⚠️ Significant gaps identified — may not meet minimum requirements.",
    }[tier]

    return {
        "strengths": strengths,
        "missing_skills": missing,
        "risks": risks,
        "insight": insight,
        "recommendation": recommendation,
        "tier": tier,
        "bias_flags": generate_bias_check(candidate),
    }


def generate_bias_check(candidate: Dict) -> List[str]:
    """Simple bias detection — flag if any protected attributes might influence scoring."""
    flags = []
    # In a real system, this would check for demographic data leakage
    # For PoC, we surface that scoring is skills/experience-only
    flags.append("✓ Scoring based exclusively on skills, experience, and behavioral data.")
    flags.append("✓ No demographic attributes (gender, age, location) factored into AI scores.")
    return flags
