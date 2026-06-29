# TalentMind AI
**Enterprise Intelligent Candidate Discovery & Ranking Platform**

TalentMind AI is a proof-of-concept AI recruiter platform that goes beyond basic keyword matching. It intelligently ranks candidates using semantic understanding, career trajectory analysis, and behavioral signals, providing a transparent Explainable AI (XAI) breakdown for every recommendation.

## Architecture & Tech Stack

- **Frontend:** React 18, Vite, React Router v6
- **Styling:** Vanilla CSS (Glassmorphism, Dark/Light Mode, Recharts)
- **Backend:** FastAPI (Python)
- **AI Core:** TF-IDF Cosine Similarity, Custom NLP Heuristics
- **Data Layer:** Rich JSON seeding (Simulating MongoDB)

## Core Features Implemented

1. **Hybrid AI Ranking Engine:**
   - 35% Semantic Fit (Skills & Experience)
   - 20% Career Trajectory (Growth velocity, Stability, Leadership)
   - 15% Skill Depth
   - 15% Behavioral Signals (Platform engagement, GitHub commits)
   - 10% Culture Fit
   - 5% Recency (Availability & Last active)

2. **Explainable AI (XAI):**
   Generates human-readable context for every ranked candidate, including Strengths, Missing Skills, Risks, and Career insights.

3. **Conversational Recruiter Assistant:**
   Natural language search for the talent pool (e.g., "Find senior backend engineers with AWS experience").

4. **Rich Dashboard & Analytics:**
   Real-time metrics, match score trends, funnel analytics, and candidate source distributions.

## How to Run Locally

You can use the provided `start.bat` script to launch both servers simultaneously:
1. Double-click `start.bat`
2. Two command prompt windows will open.
3. The frontend will be available at `http://localhost:5173`

Alternatively, you can run them manually:

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Directory Structure
- `backend/routers/` - FastAPI endpoint definitions
- `backend/services/` - AI intelligence, parsing, and ranking logic
- `backend/data/` - 20 rich candidate profiles & 5 sample jobs
- `frontend/src/pages/` - Main React views
- `frontend/src/components/` - Reusable UI elements
- `frontend/src/index.css` - Complete design system
