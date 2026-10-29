import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { ShieldAlert, Cpu, Rss, ArrowRight, Zap, Globe, Layers } from 'lucide-react';
import './LandingPage.css';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="map-grid"></div>
        
        <motion.div 
          className="container"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="headline" variants={fadeIn}>
            AI That Saves Lives <br />
            <span className="text-primary">Before Disaster Strikes</span>
          </motion.h1>
          
          <motion.p className="subtext" variants={fadeIn}>
            Real-time prediction. Instant response. Decentralized coordination. 
            The future of global crisis management is here.
          </motion.p>
          
          <motion.div className="flex gap-6 items-center justify-center" variants={fadeIn}>
            <Button onClick={() => window.location.href = '/dashboard'} size="lg" glow>
              View Live Dashboard <ArrowRight className="ml-2" size={20} style={{ marginLeft: '8px' }}/>
            </Button>
            <Button size="lg" variant="outline" glow onClick={() => window.location.href = '/dashboard?start=true'}>
              Run Simulation
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="how-wrapper">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How <span>AegisAI</span> Works
          </motion.h2>
          
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            {[
              { icon: <Rss size={40} />, title: "1. Detect", desc: "Sensors and citizen reports instantly flag anomalies." },
              { icon: <Cpu size={40} />, title: "2. Predict", desc: "AI models forecast spread, impact, and required resources." },
              { icon: <Zap size={40} />, title: "3. Respond", desc: "Automated dispatch of first responders and drones." }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                className="step-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="step-icon-wrapper">
                  {step.icon}
                </div>
                <h3 className="mb-4" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>{step.title}</h3>
                <p className="text-secondary">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section className="features-wrapper">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Core <span>Capabilities</span>
          </motion.h2>

          <div className="feature-grid">
            {[
              { icon: <ShieldAlert color="var(--danger)" size={32} />, title: "Real-time Alerts", text: "Sub-second notification delivery to endangered zones." },
              { icon: <Cpu color="var(--primary)" size={32} />, title: "AI Predictions", text: "95% accuracy in flood, fire, and storm path forecasting." },
              { icon: <Globe color="var(--success)" size={32} />, title: "SOS System", text: "Offline-capable mesh networking for citizen distress signals." },
              { icon: <Layers color="var(--warning)" size={32} />, title: "Resource Coordination", text: "Intelligent re-routing of ambulances and fire trucks." }
            ].map((feat, i) => (
              <Card key={i} intensity="low" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="feature-icon">{feat.icon}</div>
                <h4 className="mb-2" style={{ fontSize: '1.25rem' }}>{feat.title}</h4>
                <p className="text-secondary">{feat.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIVE SIMULATION PREVIEW */}
      <section className="simulation-wrapper">
        <div className="container">
          <motion.h2 
            className="section-title" style={{ marginBottom: '2rem' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Live Simulation <span>Engine</span>
          </motion.h2>

          <Card intensity="high" className="p-0">
            <div className="simulation-map">
              {/* Fake ripples representing disasters spreading */}
              <div className="ripple" style={{ width: '20px', height: '20px', left: '30%', top: '40%' }}></div>
              <div className="ripple" style={{ width: '40px', height: '40px', left: '60%', top: '70%', animationDelay: '1s' }}></div>
              <div className="ripple" style={{ width: '10px', height: '10px', left: '80%', top: '20%', animationDelay: '2s', borderColor: 'var(--warning)', boxShadow: '0 0 20px var(--warning)' }}></div>
              
              {/* Drone trackers */}
              <motion.div 
                style={{ position: 'absolute', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary)' }}
                animate={{ x: [100, 300, 400], y: [100, 150, 50] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div 
                style={{ position: 'absolute', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}
                animate={{ x: [500, 400, 200], y: [300, 200, 250] }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* 5. TRUST / IMPACT SECTION */}
      <section className="stats-wrapper">
        <div className="container flex justify-between" style={{ flexWrap: 'wrap', gap: '2rem' }}>
          <div className="stat-item flex-col items-center">
            <div className="stat-number">
              <AnimatedCounter value={63} suffix="%" />
            </div>
            <div className="stat-label">Faster Response</div>
          </div>
          <div className="stat-item flex-col items-center">
            <div className="stat-number">
              <AnimatedCounter value={10000} prefix="+" />
            </div>
            <div className="stat-label">Lives Impacted</div>
          </div>
          <div className="stat-item flex-col items-center">
            <div className="stat-number">
              <AnimatedCounter value={99.99} suffix="%" />
            </div>
            <div className="stat-label">Uptime Reliability</div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="footer">
        <div className="container">
          <p className="text-secondary" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>
            AEGIS AI © 2026. SECURING THE FUTURE.
          </p>
        </div>
      </footer>
    </div>
  );
};
