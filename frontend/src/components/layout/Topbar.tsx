import React, { useState } from 'react';
import { Search, X, Play, Pause, Clock, Loader2, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { NotificationPanel } from '../ui/NotificationPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSimulation } from '../../context/SimulationContext';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export const Topbar: React.FC = () => {
  useAuth();
  const { simStatus, toggleSimulation, simTime, focusMapOn, rescuedCount } = useSimulation();
  
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchExpanded, setSearchExpanded] = useState(false);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length > 2) {
      setIsSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3`);
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Failed geocoding", err);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const executeFlyTo = (lat: string, lon: string) => {
    focusMapOn(parseFloat(lat), parseFloat(lon), 12);
    setQuery('');
    setResults([]);
    setSearchExpanded(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const formatTime = (minutes: number) => {
    const defaultHours = 9; 
    const realH = Math.floor((defaultHours * 60 + minutes) / 60) % 24;
    const realM = (defaultHours * 60 + minutes) % 60;
    return `${realH.toString().padStart(2, '0')}:${realM.toString().padStart(2, '0')} HRS`;
  };

  return (
    <header className="topbar" style={{ position: 'relative' }}>
      <div className="topbar-left">
        {/* Search — expanded on mobile via button */}
        <button 
          className="topbar-search-toggle"
          onClick={() => setSearchExpanded(!searchExpanded)}
        >
          <Search size={18} />
        </button>

        <div className={`topbar-search-wrapper ${searchExpanded ? 'expanded' : ''}`} style={{ position: 'relative', zIndex: 100 }}>
          <Search size={18} className="topbar-search-icon" />
          <input 
            type="text" 
            placeholder="Search regions (Press Enter)..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="topbar-search-input"
            onFocus={(e) => e.target.style.borderColor = 'rgba(0, 229, 255, 0.5)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          />
          {query && (
            <X 
              size={16} 
              className="topbar-search-clear"
              onClick={clearSearch}
            />
          )}

          <AnimatePresence>
            {(isSearching || results.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="glass-panel topbar-search-results"
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Coordinates</div>
                {isSearching ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span style={{ fontSize: '0.9rem' }}>Acquiring satellite telemetry...</span>
                  </div>
                ) : (
                  results.length > 0 ? results.map(res => (
                    <div 
                      key={res.place_id} 
                      className="hover:bg-[rgba(0,229,255,0.1)] p-2 rounded cursor-pointer transition-colors border border-[rgba(255,255,255,0.05)]"
                      onClick={() => executeFlyTo(res.lat, res.lon)}
                    >
                      <div className="text-primary text-sm font-heading">{res.display_name.split(',')[0]}</div>
                      <div className="text-secondary text-xs truncate">{res.display_name}</div>
                    </div>
                  )) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '0.5rem' }}>
                      No coordinates found.
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="topbar-right" style={{ zIndex: 10 }}>
        
        {/* OPERATIONAL SIMULATION CONTROLS */}
        <div className="topbar-sim-controls">
          <button 
            onClick={toggleSimulation} 
            className={`action-btn ${simStatus === 'Running' ? 'danger' : 'primary'} !py-1 !px-3 font-heading topbar-sim-btn`}
          >
            {simStatus === 'Running' ? <Pause size={12} /> : <Play size={12} />}
            <span className="topbar-sim-label">{simStatus === 'Running' ? 'HALT' : 'START'}</span>
          </button>
        </div>

        {/* Rescued count */}
        {rescuedCount > 0 && (
          <div className="topbar-rescued" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.75rem', fontFamily: "'Orbitron', sans-serif" }}>
            <Users size={14} />
            <span>{rescuedCount} Rescued</span>
          </div>
        )}

        {/* Notification bell */}
        <NotificationPanel />


      </div>
    </header>
  );
};
