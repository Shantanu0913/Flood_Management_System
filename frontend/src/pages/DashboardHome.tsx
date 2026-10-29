import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, ArrowUpCircle, AlertTriangle, Users } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useSimulation } from '../context/SimulationContext';
import { OperationalMap } from '../components/map/OperationalMap';
import './DashboardHome.css';

export const DashboardHome: React.FC = () => {
  const { environment, simStatus, simTime } = useSimulation();

  // Auto-scroll chat - DISABLED per user request to prevent jumping during simulation
  /*
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);
  */

  // Dynamic telemetry parsing based on environment struct
  const stats = [
    { label: 'Rainfall Intensity', value: `${environment.rainfallIntensity.toFixed(1)} mm/hr`, icon: <Droplets size={28} color="var(--primary)" />, status: 'primary' },
    { label: 'River Level (m)', value: `${environment.riverLevel.toFixed(2)} / 7.5m`, icon: <ArrowUpCircle size={28} color={environment.riverLevel > 7.5 ? "var(--danger)" : "var(--warning)"} />, status: environment.riverLevel > 7.5 ? 'danger' : 'warning' },
    { label: 'Flood Spread (Area)', value: `${environment.floodSpread.toFixed(1)} km²`, icon: <Activity size={28} color={environment.floodSpread > 0 ? "var(--danger)" : "var(--success)"} />, status: environment.floodSpread > 0 ? 'danger' : 'success' },
    { label: 'Population Affected', value: environment.affectedPopulation.toLocaleString(), icon: <Users size={28} color="var(--danger)" />, status: 'danger' }
  ];

  return (
    <div className="dashboard-home h-full flex flex-col overflow-hidden">
      <div className="dashboard-home-header flex justify-between items-center mb-4 shrink-0">
        <div>
           <h2 className="text-primary text-glow-primary text-xl flex items-center gap-2 dashboard-incident-title">
             <AlertTriangle size={24} className="text-warning"/>
             CENTRAL INCIDENT: {environment.incidentName.toUpperCase()}
           </h2>
           <div className="text-secondary tracking-widest text-sm mt-1 dashboard-subtitle">ACTIVE CAUSAL TIMELINE OVERRIDE LOCATED IN MUMBAI OPERATIONS SECTOR</div>
        </div>
        <div className="flex flex-col items-end gap-2 dashboard-badges">
          <Badge variant={simStatus === 'Running' ? "success" : "warning"} glow>
            {simStatus === 'Running' ? "Simulation Active" : "Simulation Paused"}
          </Badge>
          <div className="flex gap-2 dashboard-badge-row">
             <Badge variant={environment.currentPhase === 'CRITICAL' ? 'danger' : environment.currentPhase === 'RESPONSE' ? 'primary' : 'warning'}>OPERATIONAL PHASE: {environment.currentPhase}</Badge>
             <Badge variant={environment.riskLevel > 80 ? 'danger' : 'warning'}>RISK LEVEL: {environment.riskLevel}%</Badge>
          </div>
        </div>
      </div>

      <div className="dashboard-stats mb-6 shrink-0">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            className={`glass-panel stat-card ${stat.status !== 'primary' ? stat.status : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="stat-icon-wrapper">
              {stat.icon}
            </div>
            <div>
              <div className="stat-value text-primary">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-main-row flex gap-6 relative flex-1 min-h-0">
        
        {/* Central Map Column */}
        <motion.div 
          className="glass-panel map-container flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="map-header shrink-0">
            <div className="map-title font-heading tracking-widest text-lg">LOGICAL CAUSAL MAP SENSOR</div>
            <div className="text-secondary text-sm flex gap-4">
              <span className="text-primary font-bold">TIMESTEP: T+{simTime} MINS</span>
            </div>
          </div>

          <div className="relative w-full flex-1 overflow-hidden rounded-lg">
            <OperationalMap />
          </div>
        </motion.div>


      </div>
    </div>
  );
};
