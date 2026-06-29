"""
Job Parser Service
Extracts structured intelligence from raw job descriptions using NLP heuristics.
"""
import re
from typing import Dict, List, Any

SKILL_TAXONOMY = {
    "python": "Python", "fastapi": "FastAPI", "django": "Django", "flask": "Flask",
    "java": "Java", "spring": "Spring Boot", "kotlin": "Kotlin",
    "javascript": "JavaScript", "typescript": "TypeScript", "react": "React",
    "node.js": "Node.js", "next.js": "Next.js", "vue": "Vue.js",
    "golang": "Golang", "go": "Golang", "rust": "Rust", "scala": "Scala",
    "swift": "Swift", "swiftui": "SwiftUI",
    "aws": "AWS", "gcp": "GCP", "azure": "Azure",
    "kubernetes": "Kubernetes", "k8s": "Kubernetes", "docker": "Docker",
    "terraform": "Terraform", "ansible": "Ansible",
    "kafka": "Kafka", "redis": "Redis", "postgresql": "PostgreSQL",
    "mongodb": "MongoDB", "elasticsearch": "Elasticsearch", "mysql": "MySQL",
    "spark": "Spark", "airflow": "Airflow", "dbt": "dbt", "snowflake": "Snowflake",
    "pytorch": "PyTorch", "tensorflow": "TensorFlow", "scikit-learn": "Scikit-learn",
    "mlflow": "MLflow", "langchain": "LangChain", "huggingface": "HuggingFace",
    "prometheus": "Prometheus", "grafana": "Grafana", "jenkins": "Jenkins",
    "argocd": "ArgoCD", "grpc": "gRPC",
    "graphql": "GraphQL", "rest api": "REST API",
    "microservices": "Microservices", "ci/cd": "CI/CD",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "sql": "SQL", "nosql": "NoSQL",
    "solidity": "Solidity", "web3": "Web3.js",
    "selenium": "Selenium", "cypress": "Cypress", "playwright": "Playwright",
    "storybook": "Storybook", "figma": "Figma",
    "agile": "Agile", "scrum": "Scrum",
}

SENIORITY_MAP = {
    "junior": ("Junior", 0, 2),
    "mid": ("Mid-Level", 2, 5),
    "senior": ("Senior", 5, 10),
    "staff": ("Staff/Principal", 8, 15),
    "principal": ("Staff/Principal", 8, 15),
    "manager": ("Manager/Director", 8, 20),
    "director": ("Manager/Director", 10, 25),
    "vp": ("VP/C-Suite", 12, 30),
    "lead": ("Tech Lead", 5, 12),
    "architect": ("Architect", 8, 20),
}

SOFT_SKILL_PATTERNS = [
    "communication", "collaboration", "leadership", "problem.solving",
    "mentoring", "analytical", "ownership", "team player", "creative",
    "adaptable", "proactive", "strategic", "empathy", "organized",
    "detail.oriented", "cross.functional",
]

CULTURE_PATTERNS = {
    "fast.paced": "Fast-paced",
    "startup": "Startup culture",
    "innovation": "Innovation-driven",
    "remote.first": "Remote-first",
    "data.driven": "Data-driven",
    "customer.obsessed": "Customer-obsessed",
    "engineering.excellence": "Engineering excellence",
    "open.source": "Open-source culture",
    "performance.driven": "Performance-driven",
    "mission.driven": "Mission-driven",
    "agile": "Agile/Iterative",
    "collaborative": "Collaborative",
    "research": "Research-oriented",
}

HIDDEN_SIGNAL_PATTERNS = {
    "on.call": "On-call rotation expected",
    "24.7": "24/7 availability implied",
    "fast.growing": "Hypergrowth environment",
    "billion|millions of users": "Extreme scale experience needed",
    "startup|early stage": "Startup adaptability required",
    "equity|esop": "Equity compensation component",
    "travel": "Travel may be required",
    "leadership": "Leadership experience expected",
}


def extract_skills_from_text(text: str, skill_list: List[str]) -> List[str]:
    """Extract matching skills from text."""
    text_lower = text.lower()
    found = []
    for key, display in SKILL_TAXONOMY.items():
        if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
            if display not in found:
                found.append(display)
    # Also include explicitly listed skills
    for skill in skill_list:
        if skill not in found:
            found.append(skill)
    return found


def detect_seniority(text: str, explicit: str = "") -> Dict:
    """Detect seniority level from text."""
    text_lower = (text + " " + explicit).lower()
    for key, (level, min_yr, max_yr) in SENIORITY_MAP.items():
        if key in text_lower:
            return {"level": level, "min_years": min_yr, "max_years": max_yr}
    return {"level": "Mid-Level", "min_years": 3, "max_years": 7}


def extract_soft_skills(text: str) -> List[str]:
    """Extract soft skills from text."""
    text_lower = text.lower()
    found = []
    for pattern in SOFT_SKILL_PATTERNS:
        if re.search(pattern, text_lower):
            skill = pattern.replace(".", " ").replace("-", " ").title()
            found.append(skill)
    return list(set(found))


def detect_culture_signals(text: str) -> List[str]:
    """Detect company culture indicators."""
    text_lower = text.lower()
    signals = []
    for pattern, label in CULTURE_PATTERNS.items():
        if re.search(pattern, text_lower):
            signals.append(label)
    return list(set(signals))


def detect_hidden_requirements(text: str) -> List[str]:
    """Detect hidden/implicit requirements."""
    text_lower = text.lower()
    hidden = []
    for pattern, label in HIDDEN_SIGNAL_PATTERNS.items():
        if re.search(pattern, text_lower):
            hidden.append(label)
    return list(set(hidden))


def detect_industry(text: str, explicit: str = "") -> str:
    """Detect primary industry from text."""
    industries = {
        "fintech|payment|banking|finance|wallet": "FinTech",
        "e.commerce|retail|shopping|seller": "E-Commerce",
        "healthcare|health|medical|hospital|patient": "HealthTech",
        "edtech|education|learning|student|school": "EdTech",
        "ai|machine learning|ml|data science": "AI/ML",
        "cloud|infrastructure|devops|platform|sre": "Cloud Infrastructure",
        "gaming|game|esport": "Gaming",
        "blockchain|web3|crypto|defi": "Web3/Blockchain",
        "saas|software|enterprise": "SaaS",
        "security|cybersecurity|infosec": "Cybersecurity",
    }
    text_lower = (text + " " + explicit).lower()
    for pattern, industry in industries.items():
        if re.search(pattern, text_lower):
            return industry
    return "Technology"


def parse_job_description(job: Dict) -> Dict:
    """
    Full AI job parsing — extract all structured intelligence from a job record.
    """
    description = job.get("description", "")
    explicit_required = job.get("required_skills", [])
    explicit_preferred = job.get("preferred_skills", [])
    explicit_seniority = job.get("seniority", "")

    required_skills = extract_skills_from_text(description, explicit_required)
    preferred_skills = extract_skills_from_text("", explicit_preferred)
    seniority = detect_seniority(description, explicit_seniority)
    industry = detect_industry(description, job.get("industry", ""))
    soft_skills = extract_soft_skills(description)
    culture = detect_culture_signals(description)
    hidden = detect_hidden_requirements(description)

    return {
        "job_id": job.get("id"),
        "title": job.get("title"),
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "seniority": seniority,
        "industry": industry,
        "soft_skills": soft_skills if soft_skills else job.get("soft_skills", []),
        "culture_fit": culture if culture else job.get("culture_fit", []),
        "hidden_requirements": hidden if hidden else job.get("hidden_requirements", []),
        "complexity_score": min(100, len(required_skills) * 6 + len(preferred_skills) * 4),
        "role_summary": f"{seniority['level']} role in {industry} requiring {', '.join(required_skills[:3])} expertise.",
    }
