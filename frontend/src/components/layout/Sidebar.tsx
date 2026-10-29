import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BellRing, 
  BrainCircuit, 
  LifeBuoy, 
  Truck, 
  MessageSquare, 
  BarChart3,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

export const Sidebar: React.FC = () => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'DMA', 'POLICE', 'PARAMEDIC', 'FIRE', 'LOGISTICS', 'CITIZEN'] as Role[] },
    { name: 'Alerts', path: '/dashboard/alerts', icon: <BellRing size={20} />, roles: ['ADMIN', 'DMA', 'POLICE', 'FIRE', 'CITIZEN'] as Role[] },
    { name: 'AI Predictions', path: '/dashboard/predictions', icon: <BrainCircuit size={20} />, roles: ['ADMIN', 'DMA'] as Role[] },
    { name: 'SOS Requests', path: '/dashboard/sos', icon: <LifeBuoy size={20} />, roles: ['ADMIN', 'PARAMEDIC', 'FIRE', 'POLICE'] as Role[] },
    { name: 'Resources', path: '/dashboard/resources', icon: <Truck size={20} />, roles: ['ADMIN', 'LOGISTICS', 'PARAMEDIC', 'FIRE'] as Role[] },
    { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 size={20} />, roles: ['ADMIN', 'DMA'] as Role[] },
  ];

  const filteredNav = navItems.filter(item => role && item.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <ShieldAlert color="var(--primary)" size={32} />
        <span className="sidebar-brand">AEGIS AI</span>
      </div>

      <div className="mb-6 mx-4 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-lg">
        <div className="text-secondary text-xs uppercase mb-1">Clearance Level</div>
        <div className="text-primary font-heading tracking-widest">{role || 'GUEST'}</div>
      </div>

      <div className="sidebar-nav">
        {filteredNav.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/dashboard'}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto p-4">
        <button className="nav-item text-danger bg-transparent w-full" onClick={handleLogout}>
          <LogOut size={20} />
          Exit System
        </button>
      </div>
    </aside>
  );
};
