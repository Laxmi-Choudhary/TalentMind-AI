import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts';

export default function MatchRadarChart({ scores }) {
  if (!scores) return null;

  const data = [
    { subject: 'Semantic', value: scores.semantic_fit || 0 },
    { subject: 'Career', value: scores.career_trajectory || 0 },
    { subject: 'Skills', value: scores.skill_depth || 0 },
    { subject: 'Behavior', value: scores.behavioral || 0 },
    { subject: 'Culture', value: scores.culture_fit || 0 },
    { subject: 'Recency', value: scores.recency || 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(99,102,241,0.15)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--text-primary)',
          }}
          formatter={(v) => [`${Math.round(v)}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
