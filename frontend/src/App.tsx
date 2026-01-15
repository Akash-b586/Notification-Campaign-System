import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import { UserDashboardLayout } from './components/layout/UserDashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLogin, UserSignup } from './pages/auth';
import { Dashboard } from './pages/dashboard';
import { UserManagement } from './pages/users';
import { NotificationPreferences } from './pages/preferences';
import { CampaignList, CreateCampaign, RecipientPreview } from './pages/campaigns';
import { NewsletterList, CreateNewsletter } from './pages/newsletters';
import { OrderManagement } from './pages/orders';
import { NotificationLogs } from './pages/logs';
import { UserNewsletterSubscriptions } from './pages/user';

import { 
  UserDashboard, 
  UserPreferences, 
  UserOrders, 
  CreateOrder, 
  UserNotifications,
  UserProfile 
} from './pages/user';
import { AddStaff, StaffProfile } from './pages/staff';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  // Smart redirect based on user role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return user?.role === 'CUSTOMER' ? '/user' : '/dashboard';
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
          <Route path="preferences" element={<UserPreferences />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="orders/new" element={<CreateOrder />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="newsletters" element={<UserNewsletterSubscriptions />} />
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
          <Route path="orders" element={<OrderManagement />} />
          <Route path="newsletters" element={<NewsletterList />} />
          <Route path="newsletters/create" element={<CreateNewsletter />} />
          <Route path="newsletters/:newsletterId/edit" element={<CreateNewsletter />} />
          <Route path="logs" element={<NotificationLogs />} />
          <Route path="staff/add" element={<AddStaff />} />
          <Route path="staff/profile" element={<StaffProfile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;