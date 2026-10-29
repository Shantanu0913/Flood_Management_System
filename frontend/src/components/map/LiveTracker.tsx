import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Clock, MapPin, Shield } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useAuth } from '../../context/AuthContext';
import './LiveTracker.css';

export const LiveTracker: React.FC = () => {
  const { liveTracking, resources, sosQueue } = useSimulation();
  const { role } = useAuth();

  // For CITIZEN: show their active tracking (help coming to them)
  // For Resources (POLICE/PARAMEDIC/FIRE): show who they're going to help
  // For ADMIN/DMA: show all active tracking pairs
  
  const activeTracking = liveTracking.filter(t => t.status === 'active' || t.status === 'arrived');

  if (activeTracking.length === 0) return null;

  // Citizen sees a special "help is coming" banner
  if (role === 'CITIZEN') {
    const track = activeTracking[0]; // Citizen sees their first active request
    const resource = resources.find(r => r.id === track?.resourceId);
    if (!track || !resource) return null;

    return (
      <motion.div
        className="live-tracker-citizen"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div className="tracker-citizen-header">
          <div className="tracker-pulse-dot" />
          <span>{track.status === 'arrived' ? 'HELP HAS ARRIVED' : 'HELP IS ON THE WAY'}</span>
        </div>

        <div className="tracker-citizen-body">
          <div className="tracker-resource-info">
            <div className="tracker-resource-type">
              {resource.type.toUpperCase()}
            </div>
            <div className="tracker-resource-id">{resource.id}</div>
          </div>

          <div className="tracker-eta-display">
            {track.status === 'arrived' ? (
              <div className="tracker-arrived-badge">
                <Shield size={16} />
                ON SCENE
              </div>
            ) : (
              <>
                <div className="tracker-eta-number">{track.eta}</div>
                <div className="tracker-eta-label">ESTIMATED ARRIVAL</div>
              </>
            )}
          </div>
        </div>

        <div className="tracker-citizen-footer">
          <div className="tracker-coords">
            <MapPin size={12} />
            <span>{track.resourceLat.toFixed(4)}°N, {track.resourceLng.toFixed(4)}°E</span>
          </div>
          <div className="tracker-status-live">
            <div className="tracker-live-dot" />
            LIVE TRACKING
          </div>
        </div>
      </motion.div>
    );
  }

  // For resource roles and admin: compact tracking panel
  if (!['ADMIN', 'DMA', 'POLICE', 'PARAMEDIC', 'FIRE', 'LOGISTICS'].includes(role || '')) return null;

  // Filter based on role
  const visibleTracking = role === 'ADMIN' || role === 'DMA' || role === 'LOGISTICS'
    ? activeTracking
    : activeTracking.filter(t => {
        const res = resources.find(r => r.id === t.resourceId);
        if (!res) return false;
        if (role === 'POLICE') return res.type === 'Police Cruiser';
        if (role === 'PARAMEDIC') return ['Ambulance', 'Evac Helicopter'].includes(res.type);
        if (role === 'FIRE') return ['Fire Truck', 'Evac Helicopter'].includes(res.type);
        return true;
      });

  if (visibleTracking.length === 0) return null;

  return (
    <div className="live-tracker-panel">
      <div className="tracker-panel-header">
        <div className="tracker-panel-title">
          <Navigation size={14} />
          LIVE DISPATCH TRACKING
        </div>
        <div className="tracker-count">{visibleTracking.length} Active</div>
      </div>

      <div className="tracker-list">
        <AnimatePresence>
          {visibleTracking.map(track => {
            const resource = resources.find(r => r.id === track.resourceId);
            const sos = sosQueue.find(s => s.id === track.sosId);
            if (!resource) return null;

            return (
              <motion.div
                key={track.id}
                className={`tracker-item ${track.status === 'arrived' ? 'tracker-arrived' : ''}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="tracker-item-top">
                  <div className="tracker-item-resource">
                    <span className="tracker-item-id">{resource.id}</span>
                    <span className="tracker-item-type">{resource.type}</span>
                  </div>
                  <div className={`tracker-item-eta ${track.status === 'arrived' ? 'arrived' : ''}`}>
                    <Clock size={10} />
                    {track.status === 'arrived' ? 'ARRIVED' : track.eta}
                  </div>
                </div>
                <div className="tracker-item-bottom">
                  <span className="tracker-item-person">
                    → {sos?.name || 'Unknown'}
                  </span>
                  <span className="tracker-item-live">
                    <div className="tracker-live-dot-sm" />
                    LIVE
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
