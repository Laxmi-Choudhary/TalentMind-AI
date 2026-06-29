import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Users, Zap, CheckCircle2, AlertCircle, Eye, Network, Brain } from 'lucide-react';
import { parseJob } from '../api/client';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parseJob(jobId)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!data) return <div className="empty-state">Job not found.</div>;

  const { job, parsed } = data;

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')} style={{ marginBottom: 16 }}>
          ← Back to Jobs
        </button>
        <div className="page-header-main">
          <div>
            <h1 className="page-title">{job.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={14} /> {job.company}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> {job.location}
              </span>
              <span className="badge badge-primary">{parsed.seniority?.level || job.seniority}</span>
              <span className="badge badge-purple">{parsed.industry || job.industry}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={() => navigate(`/rankings/${job.id}`)}>
              <Zap size={16} /> Rank Candidates
            </button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Parsed Intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card-glass" style={{ padding: 24 }}>
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Brain size={18} color="var(--primary-400)" />
              AI Extracted Intelligence
            </div>

            <div className="job-analysis-grid">
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Required Skills
                </div>
                <div className="analysis-chip-group">
                  {parsed.required_skills?.map(s => (
                    <span key={s} className="skill-tag matched">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Preferred Skills
                </div>
                <div className="analysis-chip-group">
                  {parsed.preferred_skills?.map(s => (
                    <span key={s} className="skill-tag">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Soft Skills
                </div>
                <div className="analysis-chip-group">
                  {parsed.soft_skills?.map(s => (
                    <span key={s} className="badge badge-cyan">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Culture Fit
                </div>
                <div className="analysis-chip-group">
                  {parsed.culture_fit?.map(s => (
                    <span key={s} className="badge badge-purple">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {parsed.hidden_requirements?.length > 0 && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> Hidden/Implicit Signals Detected
                </div>
                <ul style={{ paddingLeft: 24, margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {parsed.hidden_requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Original Description</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {job.description}
            </div>
          </div>
        </div>

        {/* Right Column: Meta & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Role Configuration</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI Complexity Score</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-400)' }}>
                  {parsed.complexity_score}/100
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Experience Required</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {parsed.seniority?.min_years}-{parsed.seniority?.max_years} years
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Salary Range</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  ₹{(job.salary_range?.min / 100000).toFixed(0)}L – ₹{(job.salary_range?.max / 100000).toFixed(0)}L
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Status</span>
                <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                  {job.status}
                </span>
              </div>
            </div>
          </div>

          <div className="card-gradient" style={{ padding: 24, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Network size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Talent Graph Search</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Find candidates matching these exact specs</div>
              </div>
            </div>
            
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              The AI has structured the job requirements. You can now run a deep semantic search across the talent pool to find matches.
            </p>
            
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/rankings/${job.id}`)}>
              Run AI Ranking <Zap size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

