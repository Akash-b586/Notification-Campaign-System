import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Tag } from "lucide-react";
import { ToggleSwitch, Card, LoadingSpinner } from "../../components/ui";
import { preferenceService } from "../../services/api";

interface NotificationPreference {
  offers: boolean;
  order_updates: boolean;
  newsletter: boolean;
}

export const UserDashboard: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference>({
    offers: false,
    order_updates: false,
    newsletter: false,
  });
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
      const prefsData = await preferenceService.get();
      setPreferences(prefsData);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };


const handleToggle = async (type: keyof NotificationPreference) => {
  if (isSaving) return;

  setIsSaving(true);
  const updatedPreferences = {
    ...preferences,
    [type]: !preferences[type],
  };

  setPreferences(updatedPreferences);

  try {
    await preferenceService.update(updatedPreferences);
    setSuccessMessage("Preferences updated successfully!");
    setError("");
  } catch (err: any) {
    setError(err.message || "Failed to update preferences");
    setPreferences(preferences);
  } finally {
    setIsSaving(false);
  }
};

  const notificationTypes = [
    {
      key: "offers" as const,
      title: "Promotional Offers",
      description: "Get notified about special deals and discounts",
      icon: <Tag className="w-5 h-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      key: "order_updates" as const,
      title: "Order Updates",
      description: "Stay informed about your order status",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "newsletter" as const,
      title: "Newsletter",
      description: "Receive our latest news and updates",
      icon: <Bell className="w-5 h-5" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">Manage your notification preferences</p>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            Notification Preferences
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {notificationTypes.map((type) => (
              <Card
                key={type.key}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${type.bgColor}`}>
                    <div className={type.color}>{type.icon}</div>
                  </div>
                  <ToggleSwitch
                    checked={preferences[type.key]}
                    onChange={() => handleToggle(type.key)}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
