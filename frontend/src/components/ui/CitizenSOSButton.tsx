import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, MapPin, Send, Loader2, Siren, Activity } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useAuth } from '../../context/AuthContext';
import './CitizenSOSButton.css';

export const CitizenSOSButton: React.FC = () => {
  const { addSOS, simTime, environment } = useSimulation();
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // ONLY CITIZENS should have the standard SOS button
  if (role !== 'CITIZEN') return null;

  const getLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          const fallbackLat = 19.0600 + Math.random() * 0.02;
          const fallbackLng = 72.8700 + Math.random() * 0.02;
          setLocation({ lat: fallbackLat, lng: fallbackLng });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const fallbackLat = 19.0600 + Math.random() * 0.02;
      const fallbackLng = 72.8700 + Math.random() * 0.02;
      setLocation({ lat: fallbackLat, lng: fallbackLng });
      setIsLocating(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    getLocation();
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const handleSubmit = () => {
    if (!location) return;

    // AUTO SEVERITY: Decided by current disaster condition (riskLevel)
    let priority: 'critical' | 'moderate' | 'low' = 'low';
    if (environment.riskLevel > 80) priority = 'critical';
    else if (environment.riskLevel > 50) priority = 'moderate';

    addSOS({
      name: `Citizen (You)`,
      priority,
      message: message || 'Emergency! I need immediate help.',
      location: 'GPS Location',
      lat: location.lat,
      lng: location.lng,
      time: `T+${simTime}m`,
      distance: 'Calculating...'
    });

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 200]);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setMessage('');
      setLocation(null);
    }, 3000);
  };

  return (
    <>
      <motion.button
        className="citizen-sos-fab big-emergency-btn"
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          boxShadow: ['0 0 15px rgba(255,59,59,0.4)', '0 0 40px rgba(255,59,59,0.8)', '0 0 15px rgba(255,59,59,0.4)']
        }}
        transition={{ 
          boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        }}
        id="citizen-sos-button"
      >
        <AlertTriangle size={32} />
        <span className="sos-fab-label">SOS ALERT</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sos-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="sos-modal-panel"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              {submitted ? (
                <div className="sos-success-state">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="sos-success-icon"
                  >
                    ✓
                  </motion.div>
                  <h3>SOS SIGNAL SENT</h3>
                  <p>Help is being dispatched to your location.</p>
                  <p className="sos-success-sub">Severity has been automatically determined based on current regional risk.</p>
                </div>
              ) : (
                <>
                  <div className="sos-modal-header">
                    <div>
                      <h3>EMERGENCY SOS</h3>
                      <p>Send distress signal with your location</p>
                    </div>
                    <button className="sos-modal-close" onClick={() => setIsOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  <div className="sos-location-bar">
                    {isLocating ? (
                      <>
                        <Loader2 size={16} className="sos-spin" />
                        <span>Acquiring GPS coordinates...</span>
                      </>
                    ) : location ? (
                      <>
                        <MapPin size={16} />
                        <span>Location locked: {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={16} />
                        <span>Location unavailable</span>
                      </>
                    )}
                  </div>

                  <div className="sos-message-section">
                    <label>Describe the situation (optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. Trapped on 2nd floor, water rising..."
                      rows={4}
                      className="sos-textarea"
                    />
                  </div>

                  <div className="sos-auto-severity-info">
                    <Activity size={14} className="text-warning animate-pulse" />
                    <span>Priority will be auto-calculated by AegisAI telemetry.</span>
                  </div>

                  <motion.button
                    className="sos-submit-btn"
                    onClick={handleSubmit}
                    disabled={!location}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={18} />
                    SEND DISTRESS SIGNAL
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

