import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Users } from 'lucide-react';
import { fetchCandidates } from '../api/client';
import CandidateCard from '../components/CandidateCard';

export default function Candidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(initialSearch);
  const [industry, setIndustry] = useState('');
  const [minExp, setMinExp] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (industry) params.industry = industry;
      if (minExp) params.min_experience = minExp;
      
      const res = await fetchCandidates(params);
      setCandidates(res.data.candidates || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [industry, minExp]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
    // Update URL
    if (search) {
      navigate(`/candidates?search=${encodeURIComponent(search)}`, { replace: true });
    } else {
      navigate('/candidates', { replace: true });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-main">
          <div>
            <h1 className="page-title">Talent Pool</h1>
            <p className="page-desc">Browse and filter {total} intelligent candidate profiles</p>
          </div>
          <button className="btn btn-secondary">
            <Users size={15} /> Import Candidates
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="topbar-search" style={{ flex: 1, minWidth: 300, background: 'var(--bg-base)' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              placeholder="Search by name, skills, title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontSize: 14 }}
            />
          </div>
          
          <select className="filter-select" value={industry} onChange={e => setIndustry(e.target.value)}>
            <option value="">All Industries</option>
            <option value="FinTech">FinTech</option>
            <option value="SaaS">SaaS</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Cloud Infrastructure">Cloud</option>
            <option value="Mobile Tech">Mobile Tech</option>
          </select>
          
          <select className="filter-select" value={minExp} onChange={e => setMinExp(e.target.value)}>
            <option value="">Any Experience</option>
            <option value="3">3+ Years</option>
            <option value="5">5+ Years</option>
            <option value="8">8+ Years</option>
          </select>
          
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
            <Filter size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 16 }} />)}
        </div>
      ) : candidates.length > 0 ? (
        <div className="grid-3">
          {candidates.map((c, i) => (
            <CandidateCard 
              key={c.id} 
              item={{ candidate: c, rank: i + 1 }} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No candidates found</div>
          <div className="empty-desc">Try adjusting your filters or search terms.</div>
          <button className="btn btn-secondary" onClick={() => { setSearch(''); setIndustry(''); setMinExp(''); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
