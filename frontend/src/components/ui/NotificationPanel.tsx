import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Check, Send, X, Ambulance, Shield, Flame, PackageOpen } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import './NotificationPanel.css';

const NOTIFY_OPTIONS: { type: string; toRole: Role; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'medical_backup', toRole: 'PARAMEDIC', label: 'Request Medical', icon: <Ambulance size={16} />, description: 'Person needs medical attention' },
  { type: 'fire_backup', toRole: 'FIRE', label: 'Request Fire', icon: <Flame size={16} />, description: 'Fire hazard or rescue cutting needed' },
  { type: 'police_backup', toRole: 'POLICE', label: 'Request Police', icon: <Shield size={16} />, description: 'Security/crowd control needed' },
  { type: 'evacuation', toRole: 'DMA', label: 'Request Evacuation', icon: <PackageOpen size={16} />, description: 'Area needs mass evacuation' },
  { type: 'supply', toRole: 'LOGISTICS', label: 'Request Supplies', icon: <PackageOpen size={16} />, description: 'Medical/food supplies needed' },
];

export const NotificationPanel: React.FC = () => {
  const { notifications, resources, acknowledgeNotification, sendNotification, focusMapOn } = useSimulation();
  const { role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedOption, setSelectedOption] = useState<typeof NOTIFY_OPTIONS[0] | null>(null);
  const [customMessage, setCustomMessage] = useState('');

  // Filter notifications relevant to this role
  const myNotifications = notifications.filter(n => {
    if (role === 'ADMIN' || role === 'DMA') return true;
    // Everyone sees global notifications or public SOS signals
    if (n.toRole === 'ALL' || n.type === 'public_sos') return true;
    return n.toRole === role || n.fromRole === role;
  });

  const pendingCount = myNotifications.filter(n => n.status === 'pending').length;

  // Get arrived resources for this role to enable sending notifications
  const myArrivedResources = resources.filter(r => {
    if (r.status !== 'Arrived') return false;
    if (role === 'ADMIN' || role === 'DMA') return true;
    if (role === 'POLICE') return r.type === 'Police Cruiser';
    if (role === 'PARAMEDIC') return ['Ambulance', 'Evac Helicopter'].includes(r.type);
    if (role === 'FIRE') return ['Fire Truck', 'Evac Helicopter'].includes(r.type);
    return false;
  });

  const handleSendNotification = () => {
    if (!selectedOption || !role) return;
    
    const arrivedRes = myArrivedResources[0];
    if (!arrivedRes) return;

    const message = customMessage || selectedOption.description;
    sendNotification(
      role,
      arrivedRes.id,
      selectedOption.toRole,
      selectedOption.type as any,
      message,
      arrivedRes.lat,
      arrivedRes.lng,
      arrivedRes.destination
    );

    setShowSendForm(false);
    setCustomMessage('');
    setSelectedOption(null);
  };

  // Don't show for citizen - they use SOS button instead
  if (role === 'CITIZEN') return null;

  return (
    <>
      {/* Tactical Notification FAB for Responders */}
      {role !== 'ADMIN' && role !== 'DMA' && typeof document !== 'undefined' && createPortal(
        <motion.button
          className="responder-notify-fab"
          onClick={() => {
            setIsOpen(true);
            setShowSendForm(true);
          }}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            boxShadow: ['0 0 10px rgba(0,229,255,0.2)', '0 0 20px rgba(0,229,255,0.5)', '0 0 10px rgba(0,229,255,0.2)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Send size={24} />
          <span className="notif-fab-label">NOTIFY<br/>BACKUP</span>
        </motion.button>,
        document.body
      )}

      {/* Notification Bell (Mainly for Admin/DMA to see everything) */}
      <div className="notification-bell-wrapper">
        <button
          className={`notification-bell-btn ${pendingCount > 0 ? 'has-pending' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          id="notification-bell"
        >
          {pendingCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
          {pendingCount > 0 && (
            <span className="notification-badge">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-panel"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
          >
            <div className="notif-panel-header">
              <div className="notif-panel-title">
                <Bell size={14} />
                NOTIFICATIONS
              </div>
              <div className="notif-panel-actions">
                <button onClick={() => setIsOpen(false)} className="notif-close-btn">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Send Form — for resources that arrived and need backup */}
            <AnimatePresence>
              {showSendForm && (
                <motion.div
                  className="notif-send-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="notif-send-title">
                    Request backup from another department
                  </div>
                  <div className="notif-send-subtitle">
                    Resource on scene: {myArrivedResources[0]?.id} ({myArrivedResources[0]?.type})
                  </div>

                  <div className="notif-option-grid">
                    {NOTIFY_OPTIONS.filter(opt => opt.toRole !== role).map(opt => (
                      <button
                        key={opt.type}
                        className={`notif-option-btn ${selectedOption?.type === opt.type ? 'selected' : ''}`}
                        onClick={() => setSelectedOption(opt)}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  {selectedOption && (
                    <>
                      <input
                        type="text"
                        className="notif-message-input"
                        placeholder={selectedOption.description}
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                      />
                      <button className="notif-submit-btn" onClick={handleSendNotification}>
                        <Send size={14} />
                        Send to {selectedOption.toRole}
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification List */}
            <div className="notif-list">
              {myNotifications.length === 0 ? (
                <div className="notif-empty">
                  No notifications yet
                </div>
              ) : (
                myNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notif-item ${notif.status} ${notif.type === 'public_sos' ? 'type-sos' : ''}`}
                    onClick={() => focusMapOn(notif.lat, notif.lng, 15)}
                  >
                    <div className="notif-item-top">
                      <span className="notif-from">{notif.fromResourceId}</span>
                      <span className="notif-time">{notif.timestamp}</span>
                    </div>
                    <div className="notif-item-message">
                      → <strong>{notif.toRole}</strong>: {notif.message}
                    </div>
                    <div className="notif-item-bottom">
                      <span className={`notif-status-tag ${notif.status}`}>
                        {notif.status === 'saved' ? '✓ SAVED' : notif.status === 'dispatched' ? '✓ Dispatched' : notif.status === 'acknowledged' ? '✓ Ack' : '● Pending'}
                      </span>
                      {notif.status === 'pending' && (notif.toRole === role || role === 'ADMIN') && (
                        <button
                          className="notif-ack-btn"
                          onClick={() => acknowledgeNotification(notif.id)}
                        >
                          <Check size={12} /> Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
