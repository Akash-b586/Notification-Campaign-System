import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  TrendingUp,
  Calendar,
  Package,
} from "lucide-react";
import { Card, Table, Badge, LoadingSpinner } from "../../components/ui";
import { preferenceService } from "../../services/api";

interface DashboardStats {
  totalNotifications: number;
  lastNotification: {
    title: string;
    date: string;
  } | null;
}

interface RecentNotification {
  id: string;
  notificationType: string;
  channel: string;
  status: string;
  sentAt: string;
    campaign?: {
    campaignName: string;
    notificationType: string;
  };
}

export const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotifications: 0,
    lastNotification: null,
  });
  const [recentNotifications, setRecentNotifications] = useState<
    RecentNotification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const logs = await preferenceService.getMyNotificationLogs();
      console.log(logs);
      setStats({
        totalNotifications: logs.length,
        lastNotification: logs[0]
          ? {
              title: logs[0].campaign?.campaignName || `${logs[0].newsletter.title}`,
              date: new Date(logs[0].sentAt).toLocaleDateString(),
            }
          : null,
      });
      setRecentNotifications(logs.slice(0, 10));
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      // Set empty state on error
      setStats({
        totalNotifications: 0,
        lastNotification: null,
      });
      setRecentNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const summaryCards = [
    {
      title: "Total Notifications",
      value: stats.totalNotifications.toString(),
      icon: <Bell className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Last Notification",
      value: stats.lastNotification?.title || "No notifications",
      subtitle: stats.lastNotification?.date || "-",
      icon: <Calendar className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const columns = [
    {
      key: "campaign",
      header: "Notification",
      render: (notif: RecentNotification) => (
        <div>
         <div className="font-medium text-gray-900">
            {notif.campaign?.campaignName || `${notif.notificationType} notification`}
          </div>
          <div className="text-sm text-gray-500">
            {notif.notificationType.replace('_', ' ')} • {notif.channel}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (notif: RecentNotification) => (
        <Badge
          variant={notif.status === "SUCCESS" ? "success" : "error"}
        >
          {notif.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "sentAt",
      header: "Date & Time",
      render: (notif: RecentNotification) => (
        <span className="text-gray-600">
          {new Date(notif.sentAt).toLocaleString()}
        </span>
      ),
    },

  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your notification overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <div className={card.color}>{card.icon}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Notification History */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Notification History
        </h2>
        <Card>
          <Table
            data={recentNotifications}
            columns={columns}
            emptyMessage="No notifications yet"
          />
        </Card>
      </div>
    </div>
  );
};
