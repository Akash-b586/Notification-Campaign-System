import React, { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Table,
  Badge,
  LoadingSpinner,
  Select,
} from "../../components/ui";
import { preferenceService } from "../../services/api";

interface Notification {
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

export const UserNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading with dummy data
    setTimeout(() => {
      fetchNotifications();
    }, 500);
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const logs = await preferenceService.getMyNotificationLogs();
      setNotifications(logs);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const campaignName = notif.campaign?.campaignName || `${notif.notificationType} notification`;
    const type = notif.notificationType.replace('_', ' ');

    const matchesSearch =
      campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.channel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || notif.status === statusFilter;
    const matchesType = !typeFilter || notif.notificationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownloadCSV = () => {
    const csvContent = [
      "ID,Campaign,Type,Channel,Status,Sent At",
      ...filteredNotifications.map((notif) =>
        [
          notif.id,
          `"${notif.campaign?.campaignName || `${notif.notificationType} notification`}"`,
          notif.notificationType,
          notif.channel,
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

  const uniqueTypes = Array.from(new Set(notifications.map((n) => n.notificationType)));

   const getStatusVariant = (status: string) => {
    return status === "SUCCESS" ? "success" : "error";
  };


  const columns = [
    {
      key: "campaign",
      header: "Campaign / Type",
      render: (notif: Notification) => (
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
      render: (notif: Notification) => (
         <Badge variant={getStatusVariant(notif.status)}>
          {notif.status.toLowerCase()}
        </Badge>
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
          <p className="text-sm text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-green-600">
            {notifications.filter((n) => n.status === "SUCCESS").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Offers</p>
          <p className="text-2xl font-bold text-purple-600">
            {notifications.filter((n) => n.notificationType === "OFFERS").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Order Updates</p>
          <p className="text-2xl font-bold text-blue-600">
            {notifications.filter((n) => n.notificationType === "ORDER_UPDATES").length}
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
                ...uniqueTypes.map((type) => ({ 
                  value: type, 
                  label: type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) 
                })),
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <Select
              options={[
                { value: "", label: "All Status" },
                 { value: "SUCCESS", label: "Success" },
                { value: "FAILED", label: "Failed" },
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
