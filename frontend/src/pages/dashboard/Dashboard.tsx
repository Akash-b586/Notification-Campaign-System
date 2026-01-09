import React, { useState, useEffect } from 'react';
import { Users, Send, TrendingUp, Activity } from 'lucide-react';
import { Card, LoadingSpinner } from '../../components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuthStore } from '../../store/authStore';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${!trend.isPositive && 'rotate-180'}`} />
              {trend.value}
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const [stats] = useState({
    activeUsers: 2847,
    campaignsSent: 156,
    draftCampaigns: 9,
    totalNotifications: 45892,
  });

  const [activityData] = useState([
    { date: 'Jan 1', notifications: 1200 },
    { date: 'Jan 2', notifications: 1900 },
    { date: 'Jan 3', notifications: 1600 },
    { date: 'Jan 4', notifications: 2200 },
    { date: 'Jan 5', notifications: 2800 },
    { date: 'Jan 6', notifications: 2400 },
    { date: 'Jan 7', notifications: 3100 },
  ]);

  const [campaignStats] = useState([
    { type: 'Offers', count: 85 },
    { type: 'Order Updates', count: 45 },
    { type: 'Newsletter', count: 26 },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your notification campaigns today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={<Users className="w-6 h-6 text-slate-600" />}
          color="bg-slate-100"
        />
        <MetricCard
          title="Campaigns Sent"
          value={stats.campaignsSent}
          icon={<Send className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <MetricCard
          title="Draft Campaigns"
          value={`${stats.draftCampaigns}`}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
        <MetricCard
          title="Total Notifications"
          value={stats.totalNotifications.toLocaleString()}
          icon={<Activity className="w-6 h-6 text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card title="Notification Activity" className="col-span-1">
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="notifications"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Campaign Distribution */}
        <Card title="Campaign Distribution" className="col-span-1">
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="type" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                action: 'Campaign "Diwali Offers" sent',
                user: 'Admin',
                time: '2 hours ago',
                type: 'success',
              },
              {
                action: 'New user registered',
                user: 'Amit Kumar',
                time: '3 hours ago',
                type: 'info',
              },
              {
                action: 'Campaign "Newsletter Jan" created',
                user: 'Creator',
                time: '5 hours ago',
                type: 'info',
              },
              {
                action: 'User preferences updated',
                user: 'Riya Sharma',
                time: '6 hours ago',
                type: 'info',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
