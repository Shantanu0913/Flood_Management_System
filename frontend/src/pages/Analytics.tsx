import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Clock, ShieldCheck, Target } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import './Analytics.css';

export const Analytics: React.FC = () => {
  const { environment, sosQueue, aiDecisions } = useSimulation();

  const totalSOS = sosQueue.length;
  const resolvedSOS = sosQueue.filter(s => s.status !== 'pending').length;
  
  const mithiRiverData = [
    { time: 'T-2', level: 4.2 },
    { time: 'T-1', level: 5.8 },
    { time: 'Current', level: environment.riverLevel },
    { time: 'T+1', level: environment.riverLevel + (environment.rainfallIntensity * 0.05) },
    { time: 'T+2', level: environment.riverLevel + (environment.rainfallIntensity * 0.1) }
  ];

  const sosDispatchData = [
    { time: 'Incoming', amount: totalSOS },
    { time: 'Dispatched', amount: resolvedSOS }
  ];

  const efficiency = totalSOS > 0 ? (resolvedSOS / totalSOS) * 100 : 100;

  return (
    <motion.div 
      className="analytics-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-primary text-glow-primary tracking-widest text-xl">INCIDENT POST-ACTION REPORT</h2>
          <div className="text-secondary tracking-widest text-sm mt-1">OPERATIONAL DATA FOR: {environment.incidentName.toUpperCase()}</div>
        </div>
      </div>

      <div className="analytics-stats-grid">
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-primary">
          <Clock size={32} color="var(--primary)" />
          <div>
            <div className="text-sm text-secondary">Avg Response Time</div>
            <div className="text-2xl text-primary font-heading">4.2 mins</div>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-warning">
          <Activity size={32} color="var(--warning)" />
          <div>
            <div className="text-sm text-secondary">SOS Handled</div>
            <div className="text-2xl text-warning font-heading">{resolvedSOS} / {totalSOS}</div>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-success">
          <ShieldCheck size={32} color="var(--success)" />
          <div>
            <div className="text-sm text-secondary">Resource Efficiency</div>
            <div className="text-2xl text-success font-heading">{efficiency.toFixed(1)}%</div>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center gap-4 border-l-4 border-danger">
          <Target size={32} color="var(--danger)" />
          <div>
            <div className="text-sm text-secondary">Prediction Accuracy</div>
            <div className="text-2xl text-danger font-heading">{aiDecisions.length > 0 ? '94%' : 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="glass-panel p-6">
          <h3 className="font-heading tracking-widest text-primary mb-6">MITHI RIVER LEVEL PROJECTION (M)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mithiRiverData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--warning)', color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="level" stroke="var(--warning)" strokeWidth={3} dot={{ r: 4, fill: 'var(--warning)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="font-heading tracking-widest text-primary mb-6">SOS TRIAGE DISPATCH RATES</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sosDispatchData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--primary)', color: 'var(--text-primary)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="amount" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
