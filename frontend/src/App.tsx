
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLogin, UserSignup, AdminLogin } from './pages/auth';
import { Dashboard } from './pages/dashboard';
import { UserManagement } from './pages/users';
import { NotificationPreferences } from './pages/preferences';
import { CampaignList, CreateCampaign, RecipientPreview } from './pages/campaigns';
import { NotificationLogs } from './pages/logs';
import { UserPreferenceCenter } from './pages/preferences/UserPreferenceCenter';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <UserLogin />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <UserSignup />} />
        <Route path="/admin/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <AdminLogin />} />
        <Route path="/preferences/public" element={<UserPreferenceCenter />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="preferences" element={<NotificationPreferences />} />
          <Route path="campaigns" element={<CampaignList />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route path="campaigns/:campaignId/edit" element={<CreateCampaign />} />
          <Route path="campaigns/:campaignId/preview" element={<RecipientPreview />} />
          <Route path="logs" element={<NotificationLogs />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
