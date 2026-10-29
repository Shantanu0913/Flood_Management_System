import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { CitizenSOSButton } from '../components/ui/CitizenSOSButton';
import { NotificationPanel } from '../components/ui/NotificationPanel';
import { LiveTracker } from '../components/map/LiveTracker';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export const DashboardLayout: React.FC = () => {
  useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile hamburger button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        id="mobile-menu-toggle"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-sidebar-overlay" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      <div className="main-content">
        <Topbar />
        <div className="dashboard-container">
          <Outlet />
        </div>
      </div>

      {/* Emergency button — ALL ROLES can report emergencies */}
      <CitizenSOSButton />

      {/* Live tracking overlay */}
      <LiveTracker />
    </div>
  );
};
