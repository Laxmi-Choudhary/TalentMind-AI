import { useTheme } from '../context/ThemeContext';
import { Settings2, SlidersHorizontal, Database, Bell, Shield, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { isDark, toggle } = useTheme();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-desc">Configure TalentMind AI platform preferences</p>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <SlidersHorizontal size={18} color="var(--primary-400)" />
              AI Ranking Engine
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>Semantic Match Weight</span>
                  <span style={{ fontWeight: 600 }}>35%</span>
                </div>
                <input type="range" min="0" max="100" value="35" readOnly style={{ width: '100%', accentColor: 'var(--primary-500)' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>Career Trajectory Weight</span>
                  <span style={{ fontWeight: 600 }}>20%</span>
                </div>
                <input type="range" min="0" max="100" value="20" readOnly style={{ width: '100%', accentColor: 'var(--primary-500)' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span>Skill Depth Weight</span>
                  <span style={{ fontWeight: 600 }}>15%</span>
                </div>
                <input type="range" min="0" max="100" value="15" readOnly style={{ width: '100%', accentColor: 'var(--primary-500)' }} />
              </div>
              
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                Note: Engine weights are currently locked for the Proof of Concept.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              {isDark ? <Moon size={18} color="var(--primary-400)" /> : <Sun size={18} color="var(--primary-400)" />}
              Appearance
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Theme Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toggle dark or light interface</div>
              </div>
              <button className="btn btn-secondary" onClick={toggle}>
                {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Database size={18} color="var(--primary-400)" />
              Data Integrations
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Greenhouse ATS</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sync candidates and jobs</div>
                </div>
                <span className="badge badge-success">Connected</span>
              </div>
              
              <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Workday</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>HRIS Integration</div>
                </div>
                <button className="btn btn-ghost btn-sm">Connect</button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Shield size={18} color="var(--primary-400)" />
              Bias Prevention
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <input type="checkbox" defaultChecked style={{ marginTop: 4, accentColor: 'var(--primary-500)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Strict Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>
                  Enforces that ranking algorithms absolutely ignore demographic indicators. Currently active.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
