
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientHistory from './pages/patient/History';
import PatientProfile from './pages/patient/Profile';
import BookingPage from './pages/BookingPage';

// Professional Pages
import ProfessionalDashboard from './pages/professional/Dashboard';
import ProfessionalAvailability from './pages/professional/Availability';
import ProfessionalProfileEditor from './pages/professional/ProfileEditor';
import ProfessionalFinance from './pages/professional/Finance';
import ProfessionalCalendar from './pages/professional/Calendar';
import ProfessionalIntegrations from './pages/professional/Integrations';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCommunications from './pages/admin/Communications';
import AdminFinancials from './pages/admin/Financials';

// In a real app, check context for role.
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = true; 
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

// Simplified Admin Guard (In real app, check auth.currentUser?.role === 'admin')
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = true;
  const isAdmin = true; // Mock check
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Patient Routes */}
        <Route path="/patient/dashboard" element={<PrivateRoute><PatientDashboard /></PrivateRoute>} />
        <Route path="/patient/profile" element={<PrivateRoute><PatientProfile /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><PatientHistory /></PrivateRoute>} />
        <Route path="/book/:id" element={<PrivateRoute><BookingPage /></PrivateRoute>} />

        {/* Professional Routes */}
        <Route path="/professional/dashboard" element={<PrivateRoute><ProfessionalDashboard /></PrivateRoute>} />
        <Route path="/professional/availability" element={<PrivateRoute><ProfessionalAvailability /></PrivateRoute>} />
        <Route path="/professional/profile" element={<PrivateRoute><ProfessionalProfileEditor /></PrivateRoute>} />
        <Route path="/professional/finance" element={<PrivateRoute><ProfessionalFinance /></PrivateRoute>} />
        <Route path="/professional/calendar" element={<PrivateRoute><ProfessionalCalendar /></PrivateRoute>} />
        <Route path="/professional/integrations" element={<PrivateRoute><ProfessionalIntegrations /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/communications" element={<AdminRoute><AdminCommunications /></AdminRoute>} />
        <Route path="/admin/finance" element={<AdminRoute><AdminFinancials /></AdminRoute>} />

      </Routes>
    </HashRouter>
  );
};

export default App;
