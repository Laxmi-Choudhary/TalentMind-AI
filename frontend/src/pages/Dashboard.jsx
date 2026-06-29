import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Briefcase, Target, Calendar, TrendingUp, Zap,
  ArrowRight, Brain, BarChart3, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList, Area, AreaChart
} from 'recharts';
import StatCard from '../components/StatCard';
import {
  fetchOverview, fetchSkillDistribution, fetchMatchTrend,
  fetchHiringFunnel, fetchCandidateSources, fetchRankings, fetchJobs
} from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [skills, setSkills] = useState([]);
  const [trend, setTrend] = useState([]);
  const [funnel, setFunnel] = useState([]);
  const [sources, setSources] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, sk, tr, fn, sr, jobs] = await Promise.all([
          fetchOverview(), fetchSkillDistribution(), fetchMatchTrend(),
          fetchHiringFunnel(), fetchCandidateSources(), fetchJobs()
        ]);
        setOverview(ov.data);
        setSkills(sk.data.skills.slice(0, 8));
        setTrend(tr.data.trend);
        setFunnel(fn.data.funnel);
        setSources(sr.data.sources);

        // Get top ranked candidates for first job
        if (jobs.data.jobs?.length) {
          const rankRes = await fetchRankings(jobs.data.jobs[0].id, { limit: 3 });
          setTopCandidates(rankRes.data.rankings || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = overview ? [
    { icon: <Users size={22} color="#6366f1" />, label: 'Total Candidates', value: overview.total_candidates, change: `${overview.new_candidates_this_week} new this week`, changeType: 'up', bgColor: 'rgba(99,102,241,0.1)' },
    { icon: <Briefcase size={22} color="#8b5cf6" />, label: 'Active Jobs', value: overview.active_jobs, change: '2 expiring soon', changeType: 'down', bgColor: 'rgba(139,92,246,0.1)' },
    { icon: <Target size={22} color="#06b6d4" />, label: 'Avg Match Score', value: `${overview.avg_match_score}%`, change: '+3.2% vs last week', changeType: 'up', bgColor: 'rgba(6,182,212,0.1)' },
    { icon: <Calendar size={22} color="#10b981" />, label: 'Interviews Scheduled', value: overview.interviews_scheduled, change: '3 this week', changeType: 'up', bgColor: 'rgba(16,185,129,0.1)' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Welcome back, Sarah 👋</h1>
            <p className="page-desc">Your AI recruitment engine is active and finding top talent.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => navigate('/analytics')}>
              <BarChart3 size={15} /> View Analytics
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/rankings')}>
              <Brain size={15} /> AI Rankings
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)
        ) : (
          stats.map((s, i) => <StatCard key={i} {...s} />)
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Match Score Trend */}
        <div className="chart-card">
          <div className="chart-title">Match Score Trend</div>
          <div className="chart-subtitle">Average & peak scores over 8 weeks</div>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gradAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2} fill="url(#gradAvg)" name="Avg Score" />
                <Area type="monotone" dataKey="top_score" stroke="#06b6d4" strokeWidth={2} fill="url(#gradTop)" name="Top Score" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 200 }} />}
        </div>

        {/* Hiring Funnel */}
        <div className="chart-card">
          <div className="chart-title">Hiring Funnel</div>
          <div className="chart-subtitle">Pipeline stage distribution</div>
          {funnel.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnel.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 200 }} />}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Skill Distribution */}
        <div className="chart-card">
          <div className="chart-title">Top Skills in Pool</div>
          <div className="chart-subtitle">Most common candidate skills</div>
          {skills.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={skills}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {skills.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton" style={{ height: 200 }} />}
        </div>

        {/* Sources */}
        <div className="chart-card">
          <div className="chart-title">Candidate Sources</div>
          <div className="chart-subtitle">Where top talent comes from</div>
          {sources.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <PieChart width={160} height={160}>
                <Pie data={sources} dataKey="count" cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {sources.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sources.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{s.source}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="skeleton" style={{ height: 160 }} />}
        </div>
      </div>

      {/* Top AI-Ranked Candidates */}
      <div className="card">
        <div className="section-header">
          <div>
            <div className="section-title">🏆 Top AI-Ranked Candidates</div>
            <div className="section-subtitle">Highest-scoring candidates for Senior Backend Engineer</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/rankings/j001')}>
            View All <ArrowRight size={13} />
          </button>
        </div>
        {topCandidates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topCandidates.map((item, i) => (
              <div
                key={item.candidate.id}
                className="card"
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
                onClick={() => navigate(`/candidates/${item.candidate.id}?jobId=j001`)}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#818cf8' }}>
                  #{item.rank}
                </div>
                <div className="avatar" style={{ background: item.candidate.avatar_color, width: 40, height: 40, fontSize: 14 }}>
                  {item.candidate.avatar_initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.candidate.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.candidate.title}</div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="badge badge-success">{Math.round(item.scores.hybrid)}% Match</span>
                  <span className="badge badge-primary">{item.candidate.years_experience}y exp</span>
                  <Activity size={14} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        ) : <LoadingSkeleton />}
      </div>
    </div>
  );
}
