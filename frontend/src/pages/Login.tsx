import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, Users, HeartPulse, Flame, Truck, User, Lock, Mail, Eye, EyeOff, UserPlus, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import './Login.css';

type AuthTab = 'signin' | 'signup';

export const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In fields
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<Role | null>(null);

  const roles: { id: Role; label: string; icon: React.ReactNode; className?: string }[] = [
    { id: 'ADMIN', label: 'COMMAND', icon: <ShieldAlert size={20} color="var(--danger)" />, className: 'admin' },
    { id: 'POLICE', label: 'POLICE', icon: <Users size={20} /> },
    { id: 'PARAMEDIC', label: 'MEDICAL', icon: <HeartPulse size={20} color="var(--success)" /> },
    { id: 'FIRE', label: 'FIRE', icon: <Flame size={20} color="var(--warning)" /> },
    { id: 'LOGISTICS', label: 'LOGISTICS', icon: <Truck size={20} /> },
    { id: 'CITIZEN', label: 'CITIZEN', icon: <User size={20} /> },
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await login(signinEmail, signinPassword);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message || 'Authentication failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signupRole) {
      setErrorMsg('SELECT YOUR CLEARANCE ROLE');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    setIsLoading(true);
    const result = await signup(signupName, signupEmail, signupPassword, signupRole);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message || 'Registration failed');
    }
  };

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMsg('');
    setShowPassword(false);
  };

  return (
    <div className="login-container relative">
      <div className="bg-grid"></div>
      
      <motion.div 
        className="login-glass-panel relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="login-header-glitch">AEGIS_AI</div>
        <div className="text-secondary text-center text-sm tracking-widest mb-6">
          CRITICAL INCIDENT RESPONSE PLATFORM
        </div>

        {/* Auth Tabs */}
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => switchTab('signin')}
          >
            <LogIn size={14} />
            SIGN IN
          </button>
          <button 
            type="button"
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            <UserPlus size={14} />
            SIGN UP
          </button>
        </div>

        {/* SIGN IN FORM */}
        {activeTab === 'signin' && (
          <motion.form
            key="signin-form"
            onSubmit={handleSignIn}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="auth-form"
          >
            <div className="auth-input-group">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={signinEmail}
                onChange={e => setSigninEmail(e.target.value)}
                className="auth-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-input-group">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="PASSWORD"
                value={signinPassword}
                onChange={e => setSigninPassword(e.target.value)}
                className="auth-input"
                required
                autoComplete="current-password"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
                <AlertCircle size={14} /> {errorMsg}
              </motion.div>
            )}

            <button type="submit" className="auth-submit-btn signin" disabled={isLoading}>
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> AUTHENTICATING...</> : <><Shield size={16} /> DECRYPT &amp; ACCESS</>}
            </button>

            <div className="auth-hint">
              Don't have an account? <button type="button" className="auth-link" onClick={() => switchTab('signup')}>Create one</button>
            </div>
          </motion.form>
        )}

        {/* SIGN UP FORM */}
        {activeTab === 'signup' && (
          <motion.form
            key="signup-form"
            onSubmit={handleSignUp}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="auth-form"
          >
            {/* Role Selection Grid — FIRST, before other fields */}
            <div className="auth-role-label">SELECT CLEARANCE ROLE</div>
            <div className="role-grid compact">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  className={`role-btn ${role.className || ''} ${signupRole === role.id ? 'selected' : ''}`}
                  onClick={() => setSignupRole(role.id)}
                >
                  {role.icon}
                  <span>{role.label}</span>
                </button>
              ))}
            </div>

            <div className="auth-input-group">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="FULL NAME"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                className="auth-input"
                required
                minLength={2}
              />
            </div>

            <div className="auth-input-group">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                className="auth-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-input-group">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="PASSWORD (MIN 6 CHARS)"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                className="auth-input"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
                <AlertCircle size={14} /> {errorMsg}
              </motion.div>
            )}

            <button type="submit" className="auth-submit-btn signup" disabled={isLoading}>
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> REGISTERING...</> : <><UserPlus size={16} /> CREATE IDENTITY</>}
            </button>

            <div className="auth-hint">
              Already registered? <button type="button" className="auth-link" onClick={() => switchTab('signin')}>Sign in</button>
            </div>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};
