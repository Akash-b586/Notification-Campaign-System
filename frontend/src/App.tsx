import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import { UserDashboardLayout } from './components/layout/UserDashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLogin, UserSignup } from './pages/auth';
import { Dashboard } from './pages/dashboard';
import { UserManagement } from './pages/users';
import { NotificationPreferences } from './pages/preferences';
import { CampaignList, CreateCampaign, RecipientPreview } from './pages/campaigns';
// import { NotificationLogs } from './pages/logs';
import { UserDashboard } from './pages/user';
import { AddStaff } from './pages/staff';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Smart redirect based on user type
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return user?.userType === 'END_USER' ? '/user' : '/dashboard';
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <UserLogin />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <UserSignup />} />

        {/* User Dashboard (Protected) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
        </Route>

        {/* Admin/System User Dashboard (Protected) */}
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
          {/* <Route path="logs" element={<NotificationLogs />} /> */}
          <Route path="staff/add" element={<AddStaff />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
