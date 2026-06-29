import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, Trophy, BarChart3,
  Lightbulb, Settings, Brain, ChevronRight, Sparkles
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs', badge: '5' },
  { path: '/candidates', icon: Users, label: 'Candidates', badge: '20' },
  { path: '/rankings', icon: Trophy, label: 'AI Rankings' },
];

const bottomNav = [
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/insights', icon: Lightbulb, label: 'Insights' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Brain size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-text">TalentMind AI</div>
          <div className="sidebar-logo-sub">Intelligence Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}

        <div className="sidebar-section-label">Intelligence</div>
        {bottomNav.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label">AI Assistant</div>
        <NavLink to="/insights" className="nav-item" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <Sparkles size={17} color="#818cf8" />
          <span style={{ color: '#818cf8' }}>Ask TalentMind</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">SR</div>
          <div className="user-info">
            <div className="user-name">Sarah Recruiter</div>
            <div className="user-role">Head of Talent</div>
          </div>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
      </div>
    </aside>
  );
}
