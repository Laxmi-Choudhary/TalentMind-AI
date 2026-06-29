import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Users, Clock, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { fetchJobs, parseJob } from '../api/client';

function JobCard({ job }) {
  const navigate = useNavigate();
  const seniority = job.seniority || 'Mid-Level';
  const seniorityColor = {
    'Senior': 'badge-primary', 'Staff/Principal': 'badge-purple',
    'Manager/Director': 'badge-warning', 'Mid-Senior': 'badge-info',
    'Junior': 'badge-success',
  }[seniority] || 'badge-info';

  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'var(--transition-bounce)' }}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{job.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Briefcase size={12} /> {job.company}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} /> {job.location}
            </span>
          </div>
        </div>
        <span className={`badge ${seniorityColor}`}>{seniority}</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>
        {job.description?.slice(0, 140)}...
      </p>

      <div className="skill-tags" style={{ marginBottom: 14 }}>
        {(job.required_skills || []).slice(0, 5).map(s => (
          <span key={s} className="skill-tag">{s}</span>
        ))}
        {(job.required_skills || []).length > 5 && (
          <span className="skill-tag">+{job.required_skills.length - 5}</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} /> {job.active_applications} applicants
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> {job.posted_days}d ago
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontWeight: 600 }}>
          ₹{(job.salary_range?.min / 100000).toFixed(0)}–{(job.salary_range?.max / 100000).toFixed(0)}L
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={e => { e.stopPropagation(); navigate(`/rankings/${job.id}`); }}
        >
          <Zap size={12} /> AI Rank Candidates
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={e => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
        >
          <ArrowRight size={12} /> Analyze Job
        </button>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchJobs()
      .then(r => setJobs(r.data.jobs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j =>
    !filter || j.title.toLowerCase().includes(filter.toLowerCase()) ||
    j.company.toLowerCase().includes(filter.toLowerCase()) ||
    (j.industry || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Job Postings</h1>
            <p className="page-desc">Manage job requirements and trigger AI candidate ranking</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-success">{jobs.length} Active</span>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="Search jobs..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ minWidth: 280 }}
        />
        <select className="filter-select">
          <option>All Industries</option>
          <option>FinTech</option>
          <option>AI/ML</option>
          <option>SaaS</option>
          <option>Cloud Infrastructure</option>
        </select>
        <select className="filter-select">
          <option>All Seniority</option>
          <option>Junior</option>
          <option>Senior</option>
          <option>Manager</option>
        </select>
      </div>

      {loading ? (
        <div className="grid-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
