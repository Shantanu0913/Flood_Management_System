import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import './Predictions.css';
import { Badge } from '../components/ui/Badge';

// Helper to generate dynamic chart lines to keep the UI beautiful
const generateForecastLine = (confidence: number) => {
  const data = [];
  let baseProb = confidence - 20; 
  for(let i=0; i<7; i++) {
    data.push({
      time: `T+${i*2}H`,
      prob: Math.min(100, Math.max(0, baseProb + (Math.random() * 15))),
    });
    baseProb += (confidence > 50 ? 5 : -5);
  }
  return data;
};

const PredictionCard: React.FC<{ decision: any, idx: number }> = ({ decision, idx }) => {
  const chartData = useMemo(() => generateForecastLine(decision.confidence), [decision.confidence]);
  const isHighConfidence = decision.confidence > 80;
  const colorVar = isHighConfidence ? 'var(--danger)' : 'var(--warning)';

  return (
    <motion.div 
      className="glass-panel prediction-card" 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.1 }}
    >
      <div className="prediction-header">
        <div className="prediction-title" style={{ color: colorVar }}>
          <Sparkles size={20} />
          System Recommendation
        </div>
        <div className={`prediction-prob ${isHighConfidence ? 'prob-high' : 'prob-med'}`}>
          {decision.confidence}% Conf.
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${decision.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorVar} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={colorVar} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-color)', borderColor: colorVar, color: 'var(--text-primary)' }}
              itemStyle={{ color: colorVar }}
            />
            <Area type="monotone" dataKey="prob" stroke={colorVar} strokeWidth={2} fillOpacity={1} fill={`url(#color-${decision.id})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="prediction-details">
        <strong className="text-primary font-heading tracking-widest block mb-2">{decision.recommendation}</strong>
        <span className="text-secondary">{decision.reasoning}</span>
        <div className="text-xs text-secondary mt-4 border-t border-[rgba(255,255,255,0.1)] pt-2">
          Log Time: {decision.timestamp}
        </div>
      </div>
    </motion.div>
  );
};

export const Predictions: React.FC = () => {
  const { aiDecisions, simStatus } = useSimulation();

  return (
    <motion.div 
      className="predictions-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-primary text-glow-primary tracking-widest text-xl flex items-center gap-2">
          <BrainCircuit /> AI DECISION & PREDICTION ENGINE
        </h2>
        <Badge variant={simStatus === 'Running' ? 'warning' : 'primary'} glow>
          {simStatus === 'Running' ? 'Active Inference...' : 'Models Synced'}
        </Badge>
      </div>

      <div className="predictions-grid">
        <AnimatePresence>
          {aiDecisions.length > 0 ? aiDecisions.map((decision, idx) => (
            <PredictionCard key={decision.id} decision={decision} idx={idx} />
          )) : (
            <div className="col-span-full p-8 text-center text-secondary glass-panel flex flex-col items-center justify-center min-h-[300px]">
              <BrainCircuit size={48} className="mb-4 opacity-50" />
              <div>Awaiting scenario data to generate AI inferences...</div>
              <div className="text-xs mt-2 opacity-50">Initiate global simulation to begin.</div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
