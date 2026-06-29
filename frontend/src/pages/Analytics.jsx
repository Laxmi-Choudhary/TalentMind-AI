import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Download, Filter, Calendar } from 'lucide-react';
import { 
  fetchExperienceDistribution, fetchIndustryDistribution, 
  fetchEngagementDistribution, fetchMatchTrend 
} from '../api/client';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [expDist, setExpDist] = useState([]);
  const [indDist, setIndDist] = useState([]);
  const [engDist, setEngDist] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchExperienceDistribution(),
      fetchIndustryDistribution(),
      fetchEngagementDistribution(),
      fetchMatchTrend()
    ]).then(([exp, ind, eng, tr]) => {
      setExpDist(exp.data.distribution || []);
      setIndDist(ind.data.industries || []);
      setEngDist(eng.data.distribution || []);
      setTrend(tr.data.trend || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Analytics</h1>
            <p className="page-desc">Deep dive into your talent pool metrics</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary">
              <Calendar size={14} /> Last 30 Days
            </button>
            <button className="btn btn-primary">
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}
        </div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="chart-card">
              <div className="chart-title">Experience Distribution</div>
              <div className="chart-subtitle">Candidate seniority breakdown</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={expDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Candidate Engagement</div>
              <div className="chart-subtitle">Distribution of behavioral engagement scores</div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={engDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid-2">
            <div className="chart-card">
              <div className="chart-title">Industry Breakdown</div>
              <div className="chart-subtitle">Primary domain expertise of pool</div>
              <div style={{ display: 'flex', alignItems: 'center', height: 250 }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={indDist} dataKey="count" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                      {indDist.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 20 }}>
                  {indDist.slice(0, 6).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{item.industry}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">AI Match Quality Trend</div>
              <div className="chart-subtitle">Average match scores for active jobs over time</div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 100]} />
                  <RechartsTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="avg_score" stroke="#10b981" fillOpacity={1} fill="url(#colorAvg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
