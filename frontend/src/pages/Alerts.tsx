import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Flame, CloudLightning, Waves, Info, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import './Alerts.css';

export const Alerts: React.FC = () => {
  const { alerts, simTime, focusMapOn } = useSimulation();
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const handleMapFocus = (lat: number, lng: number) => {
    focusMapOn(lat, lng, 12);
    navigate('/dashboard');
  };

  const filteredAlerts = activeFilter === 'All' 
    ? alerts 
    : alerts.filter(a => a.category === activeFilter);

  const getIcon = (category: string, type: string) => {
    const color = type === 'critical' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--primary)';
    switch(category) {
      case 'Fire': return <Flame color={color} size={24} />;
      case 'Flood': return <Waves color={color} size={24} />;
      case 'Storm': return <CloudLightning color={color} size={24} />;
      case 'System': return <ShieldAlert color={color} size={24} />;
      default: return <Info color={color} size={24} />;
    }
  };

  return (
    <motion.div 
      className="alerts-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-primary text-glow-primary tracking-widest text-xl">REAL-TIME ALERTS PANEL</h2>
        <div className="text-secondary text-sm">Last Synced: T+{simTime}m</div>
      </div>

      <div className="filter-bar">
        {['All', 'Flood', 'Fire', 'Storm', 'Medical'].map(f => (
          <div 
            key={f}
            className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </div>
        ))}
      </div>

      <div className="alerts-list">
        <AnimatePresence>
          {filteredAlerts.length > 0 ? filteredAlerts.map((alert, _i) => (
            <motion.div 
              key={alert.id}
              className={`glass-panel alert-card ${alert.type}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0 }}
            >
              <div className="alert-icon">
                {getIcon(alert.category, alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <div className="alert-title">{alert.id} // {alert.title}</div>
                  <div className="alert-time">{alert.timestamp}</div>
                </div>
                <div className="alert-desc">{alert.description}</div>
                <div className="alert-actions">
                  <button className="action-btn primary">Acknowledge</button>
                  <button 
                    className="action-btn" 
                    onClick={() => handleMapFocus(alert.lat, alert.lng)}
                  >
                    <Navigation size={16}/> View on Map
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
             <div className="p-8 text-center text-secondary">
               No active alerts in this operational timeline.
             </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
