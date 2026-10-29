import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Building, Send, PlusCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import './Coordination.css';

export const Coordination: React.FC = () => {
  return (
    <motion.div 
      className="chat-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-primary text-glow-primary tracking-widest text-xl">SECURE COORDINATION CHAT</h2>
        <Badge variant="success" glow>Encryption Active (AES-256)</Badge>
      </div>

      <div className="chat-layout">
        <div className="chat-sidebar glass-panel" style={{ padding: '1rem' }}>
          <div className="text-secondary text-sm mb-4 font-heading tracking-wide">ACTIVE CHANNELS</div>
          
          <div className="chat-room active">
            <div className="room-icon"><Building size={18}/></div>
            <div className="room-info">
              <div className="room-name">HQ Global Command</div>
              <div className="room-status">12 Online</div>
            </div>
          </div>
          
          <div className="chat-room">
            <div className="room-icon"><Users size={18}/></div>
            <div className="room-info">
              <div className="room-name">Medical Triage</div>
              <div className="room-status" style={{color: 'var(--text-secondary)'}}>45 Online</div>
            </div>
          </div>

          <div className="chat-room">
            <div className="room-icon text-danger" style={{ background: 'rgba(var(--danger-rgba), 0.2)' }}><MessageSquare size={18}/></div>
            <div className="room-info">
              <div className="room-name">Fire Extrication (Sec 4)</div>
              <div className="room-status" style={{color: 'var(--danger)'}}>Emergency Active</div>
            </div>
          </div>

          <button className="sos-btn" style={{ marginTop: 'auto', padding: '0.8rem' }}>
            <PlusCircle size={16} /> New Secure Channel
          </button>
        </div>

        <div className="chat-main glass-panel">
          <div className="chat-header">
            <div>
              <h3 className="font-heading text-lg">HQ Global Command</h3>
              <div className="text-secondary text-sm">Central hub for high-level resource tracking and situational awareness.</div>
            </div>
            <Badge variant="primary">Connection Stable</Badge>
          </div>

          <div className="chat-messages">
            <div className="message-node">
              <div className="message-meta">
                <span className="sender-role">Cmdr. Vance (HQ)</span>
                <span>14:02</span>
              </div>
              <div className="message-bubble">
                Sector 9C river levels are critical. Re-routing all available aerial recon drones to monitor dam structural integrity.
              </div>
            </div>

            <div className="message-node">
              <div className="message-meta">
                <span className="sender-role" style={{ color: 'var(--warning)' }}>Field Ops Lead (Mobile)</span>
                <span>14:05</span>
              </div>
              <div className="message-bubble">
                Copy that. Drone Squadron Alpha is refueling but X1 and X2 are en route. E.T.A 4 minutes. We will need ground extraction ready if the levee breaks.
              </div>
            </div>

            <div className="message-node">
              <div className="message-meta">
                <span className="sender-role">Cmdr. Vance (HQ)</span>
                <span>14:06</span>
              </div>
              <div className="message-bubble">
                Acknowledged. Fire Engine 14 and Ambulance 01 dispatched to the perimeter.
              </div>
            </div>

            <div className="message-node own">
              <div className="message-meta">
                <span className="sender-role">You (System Admin)</span>
                <span>14:08</span>
              </div>
              <div className="message-bubble">
                I have updated the predictive model. Evacuation window is now calculated at 2.5 hours. Automated SOS alerts broadcast to citizens in Sector 9C.
              </div>
            </div>
          </div>

          <div className="chat-input-area">
            <input type="text" className="chat-input" placeholder="Type secure message..." />
            <button className="sos-btn dispatch" style={{ flex: 'none', padding: '0 1.5rem', background: 'var(--primary)', color: 'var(--bg-color)', border: 'none' }}>
              <Send size={18} /> SEND
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
