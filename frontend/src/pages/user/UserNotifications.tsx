import React, { useState, useEffect } from "react";
import { Search, Download, Filter } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Table,
  Badge,
  LoadingSpinner,
  Select,
} from "../../components/ui";

interface Notification {
  id: string;
  campaignName: string;
  type: string;
  message: string;
  status: "delivered" | "failed" | "pending";
  sentAt: string;
}

export const UserNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading with dummy data
    setTimeout(() => {
      const dummyNotifications: Notification[] = [
        {
          id: "1",
          campaignName: "Welcome Campaign",
          type: "Newsletter",
          message: "Welcome to NotifyCamp! We're excited to have you.",
          status: "delivered",
          sentAt: "2026-01-12T10:30:00Z",
        },
        {
          id: "2",
          campaignName: "New Year Sale",
          type: "Offers",
          message: "Get 50% off on all products this New Year!",
          status: "delivered",
          sentAt: "2026-01-11T14:20:00Z",
        },
        {
          id: "3",
          campaignName: "Order Shipped",
          type: "Order Updates",
          message: "Your order #ORD002 has been shipped and will arrive soon.",
          status: "delivered",
          sentAt: "2026-01-10T09:15:00Z",
        },
        {
          id: "4",
          campaignName: "Weekend Special",
          type: "Offers",
          message: "Exclusive weekend deals just for you!",
          status: "delivered",
          sentAt: "2026-01-09T16:45:00Z",
        },
        {
          id: "5",
          campaignName: "Order Delivered",
          type: "Order Updates",
          message: "Your order #ORD001 has been delivered successfully.",
          status: "delivered",
          sentAt: "2026-01-09T11:00:00Z",
        },
        {
          id: "6",
          campaignName: "Monthly Newsletter",
          type: "Newsletter",
          message: "Check out our January newsletter with tips and updates.",
          status: "delivered",
          sentAt: "2026-01-08T08:00:00Z",
        },
        {
          id: "7",
          campaignName: "Flash Sale Alert",
          type: "Offers",
          message: "24-hour flash sale starting now! Don't miss out.",
          status: "delivered",
          sentAt: "2026-01-07T18:30:00Z",
        },
        {
          id: "8",
          campaignName: "Order Confirmed",
          type: "Order Updates",
          message: "Your order #ORD003 has been confirmed and is being processed.",
          status: "delivered",
          sentAt: "2026-01-07T12:00:00Z",
        },
      ];
      setNotifications(dummyNotifications);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || notif.status === statusFilter;
    const matchesType = !typeFilter || notif.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownloadCSV = () => {
    const csvContent = [
      "ID,Campaign,Type,Message,Status,Sent At",
      ...filteredNotifications.map((notif) =>
        [
          notif.id,
          `"${notif.campaignName}"`,
          notif.type,
          `"${notif.message}"`,
          notif.status,
          notif.sentAt,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-notifications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const uniqueTypes = Array.from(new Set(notifications.map((n) => n.type)));

  const getStatusVariant = (status: Notification["status"]) => {
    switch (status) {
      case "delivered":
        return "success";
      case "failed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = [
    {
      key: "campaignName",
      header: "Campaign",
      render: (notif: Notification) => (
        <div>
          <div className="font-medium text-gray-900">{notif.campaignName}</div>
          <div className="text-sm text-gray-500">{notif.type}</div>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (notif: Notification) => (
        <span className="text-gray-600 line-clamp-2">{notif.message}</span>
      ),
    },
    {
      key: "sentAt",
      header: "Sent At",
      render: (notif: Notification) => (
        <span className="text-gray-600">
          {new Date(notif.sentAt).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
      width: "180px",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading notifications..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
          <p className="text-gray-600 mt-1">
            Complete history of all your notifications
          </p>
        </div>
        <Button
          onClick={handleDownloadCSV}
          variant="outline"
          icon={<Download className="w-5 h-5" />}
        >
          Download CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Notifications</p>
          <p className="text-2xl font-bold text-gray-900">
            {notifications.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {notifications.filter((n) => n.status === "delivered").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Offers</p>
          <p className="text-2xl font-bold text-purple-600">
            {notifications.filter((n) => n.type === "Offers").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Order Updates</p>
          <p className="text-2xl font-bold text-blue-600">
            {notifications.filter((n) => n.type === "Order Updates").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="Search notifications..."
                icon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={[
                { value: "", label: "All Types" },
                ...uniqueTypes.map((type) => ({ value: type, label: type })),
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "delivered", label: "Delivered" },
                { value: "failed", label: "Failed" },
                { value: "pending", label: "Pending" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Notifications Table */}
      <Card>
        <Table
          data={filteredNotifications}
          columns={columns}
          emptyMessage="No notifications found"
        />
      </Card>
    </div>
  );
};
