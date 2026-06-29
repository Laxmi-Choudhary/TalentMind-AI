"""
Behavioral Scorer Service
Scores candidates based on platform activity, GitHub contributions,
learning signals, and recency factors.
"""
from typing import Dict
import math
from datetime import datetime


def compute_engagement_score(signals: Dict) -> float:
    """
    Compute overall engagement score from behavioral signals.
    """
    if not signals:
        return 50.0

    # Pre-computed engagement score
    if signals.get("engagement_score"):
        return float(signals["engagement_score"])

    last_active = signals.get("last_active_days", 30)
    profile_updated = signals.get("profile_updated_days", 60)
    github_commits = signals.get("github_commits_30d", 0)
    assessments = signals.get("assessments_completed", 0)
    logins = signals.get("platform_logins_30d", 0)
    courses = signals.get("courses_completed", 0)

    # Activity recency (0-25 pts)
    if last_active <= 1:
        activity_score = 25
    elif last_active <= 3:
        activity_score = 20
    elif last_active <= 7:
        activity_score = 15
    elif last_active <= 14:
        activity_score = 8
    else:
        activity_score = 3

    # GitHub activity (0-25 pts)
    github_score = min(25, github_commits * 0.4)

    # Platform engagement (0-20 pts)
    login_score = min(20, logins * 0.8)

    # Learning signals (0-20 pts)
    learning_score = min(20, assessments * 3 + courses * 2)

    # Profile freshness (0-10 pts)
    if profile_updated <= 7:
        profile_score = 10
    elif profile_updated <= 30:
        profile_score = 7
    elif profile_updated <= 60:
        profile_score = 4
    else:
        profile_score = 1

    total = activity_score + github_score + login_score + learning_score + profile_score
    return round(min(100, total), 1)


def compute_recency_score(candidate: Dict) -> float:
    """
    Score candidate's recency — how recently they've been active and available.
    """
    signals = candidate.get("behavioral_signals", {})
    last_active = signals.get("last_active_days", 30)
    available_from = candidate.get("available_from", "")

    # Activity recency
    if last_active <= 1:
        activity_recency = 100
    elif last_active <= 3:
        activity_recency = 85
    elif last_active <= 7:
        activity_recency = 70
    elif last_active <= 14:
        activity_recency = 50
    elif last_active <= 30:
        activity_recency = 30
    else:
        activity_recency = 10

    # Availability recency
    try:
        avail_date = datetime.strptime(available_from, "%Y-%m-%d")
        today = datetime.now()
        days_until = (avail_date - today).days
        if days_until <= 0:
            avail_score = 100
        elif days_until <= 30:
            avail_score = 90
        elif days_until <= 60:
            avail_score = 75
        elif days_until <= 90:
            avail_score = 60
        elif days_until <= 180:
            avail_score = 40
        else:
            avail_score = 20
    except Exception:
        avail_score = 60

    return round((activity_recency * 0.6 + avail_score * 0.4), 1)


def score_behavioral_signals(candidate: Dict) -> Dict:
    """
    Full behavioral signal analysis.
    """
    signals = candidate.get("behavioral_signals", {})

    engagement = compute_engagement_score(signals)
    recency = compute_recency_score(candidate)

    # GitHub contribution tier
    commits = signals.get("github_commits_30d", 0)
    if commits >= 60:
        github_tier = "Very High"
    elif commits >= 30:
        github_tier = "High"
    elif commits >= 10:
        github_tier = "Moderate"
    elif commits > 0:
        github_tier = "Low"
    else:
        github_tier = "None"

    # Learning activity
    courses = signals.get("courses_completed", 0)
    assessments = signals.get("assessments_completed", 0)
    if courses + assessments >= 10:
        learning_tier = "Exceptional Learner"
    elif courses + assessments >= 6:
        learning_tier = "Active Learner"
    elif courses + assessments >= 3:
        learning_tier = "Moderate Learner"
    else:
        learning_tier = "Passive Learner"

    return {
        "engagement_score": engagement,
        "recency_score": recency,
        "github_tier": github_tier,
        "learning_tier": learning_tier,
        "raw_signals": {
            "last_active_days": signals.get("last_active_days", 0),
            "github_commits_30d": signals.get("github_commits_30d", 0),
            "courses_completed": signals.get("courses_completed", 0),
            "assessments_completed": signals.get("assessments_completed", 0),
            "platform_logins_30d": signals.get("platform_logins_30d", 0),
            "profile_updated_days": signals.get("profile_updated_days", 0),
        }
    }
