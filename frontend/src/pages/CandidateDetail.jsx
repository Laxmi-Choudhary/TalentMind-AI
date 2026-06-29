import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, Mail, Phone, ExternalLink, Code, Award, 
  Briefcase, GraduationCap, Zap, ChevronLeft, Calendar 
} from 'lucide-react';
import { fetchCandidateRanking, fetchCandidate } from '../api/client';
import MatchRadarChart from '../components/MatchRadarChart';

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get('jobId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (jobId) {
          const res = await fetchCandidateRanking(jobId, candidateId);
          setData(res.data);
        } else {
          const res = await fetchCandidate(candidateId);
          setData({ candidate: res.data.candidate });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [candidateId, jobId]);

  if (loading) return <div className="loading-container"><div className="loading-spinner" /></div>;
  if (!data) return <div className="empty-state">Candidate not found.</div>;

  const { candidate, scores, match_breakdown, xai, job } = data;
  const isRanked = !!jobId;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div className="detail-layout">
        {/* Left Sidebar */}
        <div className="detail-sidebar">
          <div className="card">
            <div className="profile-card-header">
              <div className="profile-avatar-lg" style={{ background: candidate.avatar_color || '#6366f1' }}>
                {candidate.avatar_initials}
              </div>
              <div className="profile-name">{candidate.name}</div>
              <div className="profile-title-text">{candidate.title}</div>
              <div className="profile-location">
                <MapPin size={12} /> {candidate.location}
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href={`mailto:${candidate.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  <Mail size={14} color="var(--primary-400)" /> {candidate.email}
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Phone size={14} color="var(--primary-400)" /> {candidate.phone}
                </div>
                {candidate.portfolio && (
                  <a href={candidate.portfolio} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    <ExternalLink size={14} color="var(--primary-400)" /> Portfolio
                  </a>
                )}
                {candidate.github_url && (
                  <a href={candidate.github_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    <Code size={14} color="var(--primary-400)" /> GitHub
                  </a>
                )}
              </div>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Experience</span>
                <span style={{ fontWeight: 600 }}>{candidate.years_experience} Years</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Industry</span>
                <span style={{ fontWeight: 600 }}>{candidate.industry}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected Salary</span>
                <span style={{ fontWeight: 600 }}>₹{(candidate.salary_expectation / 100000).toFixed(1)}L</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Available</span>
                <span style={{ fontWeight: 600 }}>{new Date(candidate.available_from).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: 14 }}>
              Behavioral Signals
            </div>
            <div className="ai-score-grid">
              <div className="ai-score-item">
                <div className="ai-score-value" style={{ color: '#06b6d4' }}>
                  {candidate.behavioral_signals?.engagement_score || 0}
                </div>
                <div className="ai-score-label">Engagement</div>
              </div>
              <div className="ai-score-item">
                <div className="ai-score-value" style={{ color: '#10b981' }}>
                  {candidate.behavioral_signals?.last_active_days || 0}d
                </div>
                <div className="ai-score-label">Last Active</div>
              </div>
              <div className="ai-score-item">
                <div className="ai-score-value" style={{ color: '#8b5cf6' }}>
                  {candidate.behavioral_signals?.github_commits_30d || 0}
                </div>
                <div className="ai-score-label">Commits (30d)</div>
              </div>
              <div className="ai-score-item">
                <div className="ai-score-value" style={{ color: '#f59e0b' }}>
                  {candidate.behavioral_signals?.courses_completed || 0}
                </div>
                <div className="ai-score-label">Courses Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="detail-main">
          {/* XAI Panel (If Ranked) */}
          {isRanked && xai && (
            <div className="xai-panel animate-slide">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                    {Math.round(scores.hybrid)}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                      AI Match for {job.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {xai.recommendation}
                    </div>
                  </div>
                </div>
                
                <div style={{ width: 220 }}>
                  <MatchRadarChart scores={scores} />
                </div>
              </div>

              <div className="grid-2">
                <div className="xai-section">
                  <div className="xai-section-title strengths">
                    <CheckCircle2 size={14} /> Key Strengths
                  </div>
                  {xai.strengths?.map((str, i) => (
                    <div key={i} className="xai-item">
                      <div className="xai-item-dot" style={{ background: '#10b981' }} />
                      <div>{str}</div>
                    </div>
                  ))}
                </div>
                <div className="xai-section">
                  <div className="xai-section-title risks">
                    <AlertCircle size={14} /> Risks & Gaps
                  </div>
                  {xai.risks?.map((risk, i) => (
                    <div key={i} className="xai-item">
                      <div className="xai-item-dot" style={{ background: '#ef4444' }} />
                      <div>{risk}</div>
                    </div>
                  ))}
                  {xai.missing_skills?.map((ms, i) => (
                    <div key={i} className="xai-item">
                      <div className="xai-item-dot" style={{ background: '#f59e0b' }} />
                      <div>{ms}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="xai-section" style={{ marginTop: 20 }}>
                <div className="xai-section-title insights">
                  <Zap size={14} /> Career Narrative Insight
                </div>
                <div className="xai-insight">"{xai.insight}"</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Technical Skills</div>
            <div className="skill-tags">
              {candidate.skills?.map(s => (
                <span key={s} className="skill-tag" style={{ fontSize: 13, padding: '6px 14px' }}>{s}</span>
              ))}
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {candidate.certifications?.map(c => (
                <span key={c} className="badge badge-purple" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                  <Award size={14} /> {c}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Career Timeline</div>
            <div className="timeline">
              {candidate.experience?.map((exp, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot">
                    <Briefcase size={14} color="var(--primary-400)" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-role">{exp.role}</div>
                    <div className="timeline-company">{exp.company}</div>
                    <div className="timeline-duration">{exp.years} Years</div>
                    <div className="timeline-desc">{exp.description}</div>
                  </div>
                </div>
              ))}
              {candidate.education?.map((edu, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'var(--secondary-500)' }}>
                    <GraduationCap size={14} color="var(--secondary-500)" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-role">{edu.degree}</div>
                    <div className="timeline-company" style={{ color: 'var(--secondary-400)' }}>{edu.institution}</div>
                    <div className="timeline-duration">Class of {edu.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
