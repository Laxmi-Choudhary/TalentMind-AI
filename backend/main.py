"""
TalentMind AI — FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jobs, candidates, rankings, analytics, assistant

app = FastAPI(
    title="TalentMind AI",
    description="Intelligent Candidate Discovery & Ranking API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(candidates.router)
app.include_router(rankings.router)
app.include_router(analytics.router)
app.include_router(assistant.router)


@app.get("/")
def root():
    return {
        "service": "TalentMind AI",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
