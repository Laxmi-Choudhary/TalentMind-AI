import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobs, fetchRankings } from '../api/client';
import CandidateCard from '../components/CandidateCard';
import { Brain, Trophy, SlidersHorizontal, Settings2 } from 'lucide-react';

export default function Rankings() {
  const { jobId: initialJobId } = useParams();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(initialJobId || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minScore, setMinScore] = useState(60);

  // Load jobs for the selector
  useEffect(() => {
    fetchJobs().then(r => {
      setJobs(r.data.jobs || []);
      if (!selectedJob && r.data.jobs?.length > 0) {
        setSelectedJob(r.data.jobs[0].id);
      }
    });
  }, []);

  // Sync URL when selected job changes
  useEffect(() => {
    if (selectedJob && selectedJob !== initialJobId) {
      navigate(`/rankings/${selectedJob}`, { replace: true });
    }
  }, [selectedJob, navigate, initialJobId]);

  // Load rankings when job or score threshold changes
  useEffect(() => {
    if (!selectedJob) return;
    
    setLoading(true);
    fetchRankings(selectedJob, { min_score: minScore })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedJob, minScore]);

  const currentJob = jobs.find(j => j.id === selectedJob);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">AI Candidate Rankings</h1>
            <p className="page-desc">Hybrid engine combining Semantic, Career, Skills, Behavioral, and Culture signals.</p>
          </div>
          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select Role:</span>
            <select 
              className="filter-select" 
              style={{ minWidth: 280, border: 'none', background: 'var(--bg-elevated)' }}
              value={selectedJob}
              onChange={e => setSelectedJob(e.target.value)}
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title} ({j.company})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="card-glass" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: 'var(--primary-400)' }}>
            <Brain size={16} /> Scoring Algorithm
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Semantic Match</span>
              <span style={{ fontWeight: 600 }}>35%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Career Trajectory</span>
              <span style={{ fontWeight: 600 }}>20%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Skill Depth</span>
              <span style={{ fontWeight: 600 }}>15%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Behavioral Signals</span>
              <span style={{ fontWeight: 600 }}>15%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Culture Fit</span>
              <span style={{ fontWeight: 600 }}>10%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Recency</span>
              <span style={{ fontWeight: 600 }}>5%</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, gridColumn: 'span 3', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Ranking Configuration</div>
            <button className="btn btn-ghost btn-sm"><Settings2 size={14} /> Tweak Weights</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Minimum Match Score:</span>
            <input 
              type="range" 
              min="40" max="95" step="5" 
              value={minScore} 
              onChange={e => setMinScore(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--primary-500)' }}
            />
            <span className="badge badge-primary" style={{ fontSize: 14, width: 48, justifyContent: 'center' }}>{minScore}%</span>
          </div>
          
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            Showing {data?.ranked_count || 0} candidates out of {data?.total_candidates || 0} who meet the minimum threshold for {currentJob?.title}.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
        </div>
      ) : data?.rankings?.length > 0 ? (
        <div className="grid-3">
          {data.rankings.map(item => (
            <CandidateCard 
              key={item.candidate.id} 
              item={item} 
              jobId={selectedJob}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <Trophy size={48} opacity={0.2} color="var(--primary-500)" />
          <div className="empty-title">No candidates met the threshold</div>
          <div className="empty-desc">Try lowering the minimum match score to see more candidates.</div>
          <button className="btn btn-primary" onClick={() => setMinScore(50)}>Lower Threshold to 50%</button>
        </div>
      )}
    </div>
  );
}
