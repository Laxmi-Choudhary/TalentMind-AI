import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Zap, TrendingUp, Star } from 'lucide-react';

export function getMatchColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 65) return '#f59e0b';
  return '#ef4444';
}
export function getMatchClass(score) {
  if (score >= 80) return 'high';
  if (score >= 65) return 'medium';
  return 'low';
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, background: color || 'var(--gradient-primary)' }}
        />
      </div>
      <span className="score-bar-value">{Math.round(value)}</span>
    </div>
  );
}

export default function CandidateCard({ item, jobId }) {
  const navigate = useNavigate();
  const { rank, candidate, scores, match_breakdown, semantic_analysis, xai } = item;
  const matchScore = scores?.hybrid || match_breakdown?.overall || 0;
  const matchClass = getMatchClass(matchScore);
  const matchColor = getMatchColor(matchScore);

  const topSkills = (candidate.skills || []).slice(0, 5);
  const matchedSet = new Set((semantic_analysis?.matched_skills || []).map(s => s.toLowerCase()));

  const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';

  return (
    <div
      className="candidate-card animate-fade"
      onClick={() => navigate(`/candidates/${candidate.id}${jobId ? `?jobId=${jobId}` : ''}`)}
      style={{ animationDelay: `${(rank - 1) * 0.04}s` }}
    >
      <div className={`rank-badge ${rankClass}`}>#{rank}</div>

      <div className="candidate-header" style={{ paddingLeft: '36px' }}>
        <div className="avatar" style={{ background: candidate.avatar_color || '#6366f1' }}>
          {candidate.avatar_initials}
        </div>
        <div style={{ flex: 1 }}>
          <div className="candidate-name">{candidate.name}</div>
          <div className="candidate-title">{candidate.title}</div>
          <div className="candidate-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <MapPin size={10} /> {candidate.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={10} /> {candidate.years_experience}y exp
            </span>
            {candidate.open_to_remote && (
              <span className="badge badge-cyan" style={{ fontSize: 9 }}>Remote</span>
            )}
          </div>
        </div>
        <div className="match-score-badge">
          <div className={`match-pct ${matchClass}`} style={{ color: matchColor }}>
            {Math.round(matchScore)}%
          </div>
          <div className="match-label">AI Match</div>
        </div>
      </div>

      {/* Skills */}
      <div className="skill-tags">
        {topSkills.map(skill => (
          <span
            key={skill}
            className={`skill-tag ${matchedSet.has(skill.toLowerCase()) ? 'matched' : ''}`}
          >
            {skill}
          </span>
        ))}
        {candidate.skills?.length > 5 && (
          <span className="skill-tag">+{candidate.skills.length - 5}</span>
        )}
      </div>

      {/* Score breakdown */}
      {scores && (
        <div className="score-bars" style={{ marginBottom: 10 }}>
          <ScoreBar label="Semantic Fit" value={scores.semantic_fit} color="#6366f1" />
          <ScoreBar label="Career Track" value={scores.career_trajectory} color="#8b5cf6" />
          <ScoreBar label="Behavioral" value={scores.behavioral} color="#06b6d4" />
        </div>
      )}

      {/* XAI snippet */}
      {xai?.strengths?.[0] && (
        <div style={{
          fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
          borderTop: '1px solid var(--border-subtle)', paddingTop: 10,
          display: 'flex', gap: 6, alignItems: 'flex-start'
        }}>
          <Zap size={11} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)' }}>{xai.strengths[0].slice(0, 100)}...</span>
        </div>
      )}

      {/* Engagement badge */}
      <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
        <Star size={10} color="#f59e0b" />
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Engagement {candidate.behavioral_signals?.engagement_score || 70}%
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
          Active {candidate.behavioral_signals?.last_active_days || '?'}d ago
        </span>
      </div>
    </div>
  );
}
