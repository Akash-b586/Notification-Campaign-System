import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Tag, Smartphone, Mail } from "lucide-react";
import { ToggleSwitch, Card, LoadingSpinner } from "../../components/ui";
import { preferenceService } from "../../services/api";
import type { NotificationPreference, NotificationType } from "../../types";

export const UserPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<Record<NotificationType, NotificationPreference>>({} as Record<NotificationType, NotificationPreference>);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const prefsData = await preferenceService.getAllNotificationPreferences();
      // prefsData should be { OFFERS: {...}, ORDER_UPDATES: {...}, NEWSLETTER: {...} }
      setPreferences(prefsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (notificationType: NotificationType, channel: 'email' | 'sms' | 'push') => {
    if (isSaving) return;

    setIsSaving(true);
    const currentPref = preferences[notificationType];
    const updatedPreferences = {
      ...preferences,
      [notificationType]: {
        ...currentPref,
        [channel]: !currentPref?.[channel as keyof NotificationPreference],
      },
    };

    setPreferences(updatedPreferences);

    try {
      await preferenceService.updateNotificationPreferences(notificationType, {
        ...updatedPreferences[notificationType],
      });
      setSuccessMessage("Preferences updated successfully!");
      setError("");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: "OFFERS" as const,
      title: "Promotional Offers",
      description: "Get notified about special deals and discounts",
      icon: <Tag className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      key: "ORDER_UPDATES" as const,
      title: "Order Updates",
      description: "Stay informed about your order status",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "NEWSLETTER" as const,
      title: "Newsletter",
      description: "Receive our latest news and updates",
      icon: <Bell className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const channels: Array<{ key: 'email' | 'sms' | 'push'; label: string; icon: React.ReactNode }> = [
    { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { key: 'sms', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
    { key: 'push', label: 'Push', icon: <Bell className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading preferences..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Preferences</h1>
        <p className="text-gray-600 mt-1">
          Manage your notification preferences by channel
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Notification Preferences */}
      <div className="grid md:grid-cols-3 gap-4">
        {notificationTypes.map((type) => (
          <Card
            key={type.key}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`p-3 rounded-xl ${type.bgColor} mb-4 inline-block`}>
              <div className={type.color}>{type.icon}</div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {type.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{type.description}</p>
            
            {/* Channel preferences */}
            <div className="space-y-3 border-t pt-4">
              {channels.map((channel) => (
                <div key={channel.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{channel.icon}</span>
                    <span className="text-sm text-gray-700">{channel.label}</span>
                  </div>
                  <ToggleSwitch
                    checked={preferences[type.key]?.[channel.key] || false}
                    onChange={() => handleToggle(type.key, channel.key)}
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
