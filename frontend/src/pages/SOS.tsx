import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, PhoneCall, Navigation, Ambulance, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import './SOS.css';

export const SOS: React.FC = () => {
  const { sosQueue, resources, dispatchResource, focusMapOn } = useSimulation();
  const navigate = useNavigate();

  const handleMapFocus = (lat: number, lng: number) => {
    focusMapOn(lat, lng, 14);
    navigate('/dashboard');
  };

  // Find idle resource
  const autoDispatch = (sosId: string) => {
    const idleRes = resources.find(r => r.status === 'Idle');
    if (idleRes) {
      dispatchResource(idleRes.id, sosId);
    } else {
      alert("No resources available for dispatch! Escalate to National Command.");
    }
  };

  const critical = sosQueue.filter(r => r.priority === 'critical').length;
  const moderate = sosQueue.filter(r => r.priority === 'moderate').length;
  const low = sosQueue.filter(r => r.priority === 'low').length;

  return (
    <motion.div 
      className="sos-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-primary text-glow-primary tracking-widest text-xl">GLOBAL SOS TRIAGE</h2>
        <div className="flex gap-4">
          <div className="text-danger flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger"></span> {critical} Critical</div>
          <div className="text-warning flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-warning"></span> {moderate} Moderate</div>
          <div className="text-primary flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> {low} Low</div>
        </div>
      </div>

      <div className="sos-grid">
        <AnimatePresence>
          {sosQueue.length > 0 ? sosQueue.map((req, _i) => (
            <motion.div 
              key={req.id}
              className={`glass-panel sos-card ${req.priority} ${(req.status === 'dispatched' || req.status === 'resolved') ? 'opacity-60' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0 }}
            >
              <div className="sos-header">
                <div className="text-primary font-heading tracking-wide flex items-center gap-2">
                  <PhoneCall size={16} />
                  {req.id}
                </div>
                <div className={`sos-tag ${req.priority}`}>{req.priority}</div>
              </div>
              
              <div className="text-sm text-secondary">
                Citizen: <span className="text-primary">{req.name}</span>
              </div>

              <div className="sos-body">
                "{req.message}"
              </div>

              <div className="sos-location">
                <MapPin size={16} className="text-primary" /> 
                {req.location} 
                <span className="text-secondary" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  {req.distance} away
                </span>
              </div>

              <div className="sos-actions">
                {req.status === 'pending' ? (
                  <button className="sos-btn dispatch" onClick={() => autoDispatch(req.id)}>
                    <Ambulance size={16}/> Auto-Dispatch Resource
                  </button>
                ) : req.status === 'resolved' ? (
                  <div className="text-primary-light flex items-center gap-2 font-heading tracking-widest text-sm py-1 px-3 bg-primary/10 rounded border border-primary/30 glow-sm">
                    <CheckCircle size={16} className="text-primary" /> SAVED
                  </div>
                ) : (
                  <div className="text-success flex items-center gap-2 font-heading tracking-widest text-sm">
                    <CheckCircle size={16} /> DELIVERING: {req.assignedResourceId}
                  </div>
                )}
                <button className="sos-btn" onClick={() => handleMapFocus(req.lat, req.lng)}>
                  <Navigation size={16}/> Map
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full p-8 text-center text-secondary">
              No active distress beacons. Comm channel clear.
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
