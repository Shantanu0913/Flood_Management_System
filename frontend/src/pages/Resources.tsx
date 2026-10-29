import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Navigation, Activity, Clock, User, MessageCircle, MapPin } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useSimulation } from '../context/SimulationContext';
import { OperationalMap } from '../components/map/OperationalMap';
import './Resources.css';

export const Resources: React.FC = () => {
  const { resources, simTime, focusMapOn } = useSimulation();

  const idleCount = resources.filter(r => r.status === 'Idle').length;
  const activeCount = resources.filter(r => ['Assigned', 'En Route'].includes(r.status)).length;
  const arrivedCount = resources.filter(r => r.status === 'Arrived').length;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Idle': return 'success';
      case 'Arrived': return 'primary';
      case 'Completed': return 'success';
      default: return 'warning';
    }
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null;
    switch(severity) {
      case 'critical': return <Badge variant="danger">CRITICAL</Badge>;
      case 'moderate': return <Badge variant="warning">MODERATE</Badge>;
      default: return <Badge variant="primary">LOW</Badge>;
    }
  };

  return (
    <motion.div 
      className="resources-container flex flex-col h-full overflow-hidden p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div>
          <h2 className="text-primary text-glow-primary tracking-widest text-xl">RESOURCE LIFELINE ROUTING</h2>
          <div className="text-secondary tracking-widest text-base mt-1">ACTIVE UNIT TELEMETRY RECORD</div>
        </div>
        <div className="flex gap-4">
          <Badge variant="success" glow>{idleCount} Idle Base</Badge>
          <Badge variant="warning" glow>{activeCount} En Route</Badge>
           <Badge variant="primary" glow>{arrivedCount} Arrived</Badge>
        </div>
      </div>

      <div className="flex gap-6 relative flex-1 min-h-0 overflow-hidden">
        {/* Left Col: High Density Resource Cards */}
        <div className="resources-list w-[520px] flex flex-col gap-4 overflow-y-auto pr-4 pb-6 custom-scrollbar flex-shrink-0">
          {resources.map((unit, i) => (
            <motion.div 
              key={unit.id}
              className={`glass-panel border-l-4 p-5 resource-clickable ${['Assigned', 'En Route'].includes(unit.status) ? 'border-l-warning' : unit.status === 'Arrived' ? 'border-l-primary' : 'border-l-success'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => focusMapOn(unit.lat, unit.lng, 15)}
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-[rgba(255,255,255,0.05)] gap-4">
                <div className="text-primary font-heading tracking-widest flex items-center gap-2 flex-shrink-0 min-w-0">
                  <Truck size={18} className="flex-shrink-0" />
                  <span className="truncate">{unit.id}</span> 
                  <span className="text-secondary text-sm ml-2 truncate">({unit.type})</span>
                </div>
                <Badge variant={getStatusColor(unit.status)} className="flex-shrink-0">{unit.status.toUpperCase()}</Badge>
              </div>
              
              <div className="text-sm space-y-3">
                 <div className="flex justify-between">
                    <span className="text-secondary flex items-center gap-2"><MapPin size={14}/> Dispatch Base</span>
                    <span className="text-gray-300">{unit.location}</span>
                 </div>
                 
                 {unit.status !== 'Idle' ? (
                   <>
                     <div className="flex justify-between items-center pt-2 border-t border-[rgba(255,255,255,0.05)]">
                        <span className="text-secondary flex items-center gap-2"><User size={14}/> Target Subject</span>
                        <span className="font-heading tracking-wider">{unit.assignedPerson} {getSeverityBadge(unit.severity)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-secondary flex items-center gap-2"><Navigation size={14}/> SOS Location</span>
                        <span className="text-gray-300 text-right">{unit.sosLocation}</span>
                     </div>
                     <div className="flex items-start justify-between gap-4">
                        <span className="text-secondary flex items-center gap-2 flex-shrink-0"><MessageCircle size={14}/> Situation</span>
                        <span className="text-danger text-right leading-tight max-w-[200px]">{unit.situation}</span>
                     </div>
                     <div className="flex justify-between items-center pt-2 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)] p-2 rounded">
                        <span className="text-secondary flex items-center gap-2"><Clock size={14}/> Active ETA</span>
                        {unit.status === 'En Route' ? (
                           <span className="text-warning font-heading text-lg font-bold animate-pulse">{unit.eta}</span>
                        ) : unit.status === 'Arrived' ? (
                           <span className="text-primary font-heading tracking-widest">ON SCENE</span>
                        ) : (
                           <span className="text-secondary">--</span>
                        )}
                     </div>
                   </>
                 ) : (
                   <div className="flex justify-center items-center h-20 bg-[rgba(0,0,0,0.2)] rounded text-secondary border border-[rgba(255,255,255,0.02)]">
                      UNIT AWAITING DISPATCH ALLOCATION
                   </div>
                 )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Col: Live Operational Map Connection */}
        <motion.div 
          className="glass-panel flex-1 flex flex-col min-w-0"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-3 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[rgba(0,0,0,0.2)]">
             <div className="flex items-center gap-2 text-primary tracking-widest font-heading text-sm">
                <Activity size={16} className="text-warning animate-pulse"/>
                LIVE TACTICAL FLEET ROUTING
             </div>
             <div className="font-heading text-xs text-secondary">T+{simTime} MINS</div>
          </div>
          
          <div className="relative flex-1 overflow-hidden rounded-b" style={{ minHeight: '500px' }}>
             <div style={{ position: 'absolute', inset: 0 }}>
               <OperationalMap />
             </div>
             
             {/* Map HUD Overlay */}
             <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-[1000]">
                <div className="bg-[rgba(0,0,0,0.6)] backdrop-blur px-3 py-2 border border-[rgba(0,229,255,0.2)] rounded flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-[#2ECC71]" /> <span className="text-xs text-secondary tracking-widest">EN ROUTE / IDLE</span>
                </div>
                <div className="bg-[rgba(0,0,0,0.6)] backdrop-blur px-3 py-2 border border-[rgba(0,229,255,0.2)] rounded flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" /> <span className="text-xs text-secondary tracking-widest">ARRIVED</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
