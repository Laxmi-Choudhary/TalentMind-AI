import { useLocation } from 'react-router-dom';
import { Bell, Sun, Moon, Search, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const titles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview & AI insights' },
  '/jobs': { title: 'Job Postings', subtitle: 'Manage and analyze job requirements' },
  '/candidates': { title: 'Candidates', subtitle: 'Talent pool intelligence' },
  '/rankings': { title: 'AI Rankings', subtitle: 'Hybrid candidate ranking engine' },
  '/analytics': { title: 'Analytics', subtitle: 'Hiring metrics and trends' },
  '/insights': { title: 'Insights', subtitle: 'AI-powered talent intelligence' },
  '/settings': { title: 'Settings', subtitle: 'Platform configuration' },
};

export default function TopBar() {
  const { isDark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const basePath = '/' + location.pathname.split('/')[1];
  const meta = titles[basePath] || { title: 'TalentMind AI', subtitle: '' };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/candidates?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{meta.title}</div>
        {meta.subtitle && <div className="topbar-subtitle">{meta.subtitle}</div>}
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={14} color="var(--text-muted)" />
          <input
            placeholder="Search candidates, jobs, skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => navigate('/jobs')}>
          <Plus size={14} /> New Job
        </button>

        <button className="icon-btn notification-dot" aria-label="Notifications">
          <Bell size={16} />
        </button>

        <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
