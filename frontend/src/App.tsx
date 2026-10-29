import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { DashboardLayout } from './pages/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { Alerts } from './pages/Alerts';
import { Predictions } from './pages/Predictions';
import { SOS } from './pages/SOS';
import { Resources } from './pages/Resources';

import { Analytics } from './pages/Analytics';
import { Login } from './pages/Login';

// Redirect to root if not authorized
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Auto-navigate depending on auth state
const RootRouter = () => {
  const { role } = useAuth();
  if (role) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SimulationProvider>
        <Router>
          <Routes>
          <Route path="/" element={<RootRouter />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="sos" element={<SOS />} />
            <Route path="resources" element={<Resources />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </SimulationProvider>
    </AuthProvider>
  );
}

export default App;
