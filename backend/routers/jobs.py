"""
Jobs Router — Deep job understanding endpoints.
"""
import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.job_parser import parse_job_description

router = APIRouter(prefix="/jobs", tags=["Jobs"])

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")


def load_jobs():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/")
def get_jobs():
    """Return all job postings."""
    return {"jobs": load_jobs()}


@router.get("/{job_id}")
def get_job(job_id: str):
    """Return a single job by ID."""
    jobs = load_jobs()
    job = next((j for j in jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(404, "Job not found")
    return {"job": job}


@router.get("/{job_id}/parse")
def parse_job(job_id: str):
    """AI-powered deep job description parsing."""
    jobs = load_jobs()
    job = next((j for j in jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(404, "Job not found")
    parsed = parse_job_description(job)
    return {"job": job, "parsed": parsed}


class JobDescriptionRequest(BaseModel):
    title: str
    description: str
    required_skills: list = []
    preferred_skills: list = []
    seniority: str = ""
    industry: str = ""


@router.post("/analyze")
def analyze_job_description(req: JobDescriptionRequest):
    """Analyze a raw job description submitted by the recruiter."""
    job_dict = req.dict()
    job_dict["id"] = "adhoc"
    parsed = parse_job_description(job_dict)
    return {"parsed": parsed}
