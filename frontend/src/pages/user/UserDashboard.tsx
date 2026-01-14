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
  activeSubscriptions: number;
  lastNotification: {
    title: string;
    date: string;
  } | null;
}

interface RecentNotification {
  id: string;
  title: string;
  type: string;
  status: string;
  sentAt: string;
}

export const UserDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotifications: 0,
    activeSubscriptions: 0,
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
      // Fetch user preferences to calculate active subscriptions
      const prefs = await preferenceService.get();
      const activeCount = [
        prefs.offers,
        prefs.order_updates,
        prefs.newsletter,
      ].filter(Boolean).length;

      // Dummy data for notifications
      const dummyNotifications: RecentNotification[] = [
        {
          id: "1",
          title: "Welcome to NotifyCamp!",
          type: "Newsletter",
          status: "delivered",
          sentAt: "2026-01-12T10:30:00Z",
        },
        {
          id: "2",
          title: "New Year Sale - 50% Off",
          type: "Offers",
          status: "delivered",
          sentAt: "2026-01-11T14:20:00Z",
        },
        {
          id: "3",
          title: "Your order has been shipped",
          type: "Order Updates",
          status: "delivered",
          sentAt: "2026-01-10T09:15:00Z",
        },
        {
          id: "4",
          title: "Weekend Special Deals",
          type: "Offers",
          status: "delivered",
          sentAt: "2026-01-09T16:45:00Z",
        },
        {
          id: "5",
          title: "Monthly Newsletter - January",
          type: "Newsletter",
          status: "delivered",
          sentAt: "2026-01-08T08:00:00Z",
        },
      ];

      setStats({
        totalNotifications: dummyNotifications.length,
        activeSubscriptions: activeCount,
        lastNotification: dummyNotifications[0]
          ? {
              title: dummyNotifications[0].title,
              date: new Date(dummyNotifications[0].sentAt).toLocaleDateString(),
            }
          : null,
      });
      setRecentNotifications(dummyNotifications);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
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
      title: "Active Subscriptions",
      value: `${stats.activeSubscriptions}/3`,
      icon: <CheckCircle className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
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
      key: "title",
      header: "Notification",
      render: (notif: RecentNotification) => (
        <div>
          <div className="font-medium text-gray-900">{notif.title}</div>
          <div className="text-sm text-gray-500">{notif.type}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (notif: RecentNotification) => (
        <Badge
          variant={notif.status === "delivered" ? "success" : "warning"}
        >
          {notif.status}
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
      <div className="grid md:grid-cols-3 gap-6">
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
