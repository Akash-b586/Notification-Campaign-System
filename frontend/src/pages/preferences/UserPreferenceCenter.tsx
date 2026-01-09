import React, { useState, useEffect } from 'react';
import { Save, Bell, Mail, Package, CheckCircle } from 'lucide-react';
import { Button, Card, LoadingSpinner } from '../../components/ui';

export const UserPreferenceCenter: React.FC = () => {
  const email = 'user@example.com'; // Mock - Get from URL or auth
  const [preferences, setPreferences] = useState({
    offers: true,
    order_updates: true,
    newsletter: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Mock load preferences
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    // Mock save
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
        <LoadingSpinner size="lg" text="Loading your preferences..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="max-w-2xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notification Preferences
          </h1>
          <p className="text-gray-600">
            Manage notification settings for: <strong>{email}</strong>
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Your preferences have been updated successfully!
            </p>
          </div>
        )}

        {/* Preferences Card */}
        <Card>
          <div className="p-8 space-y-8">
            {/* Promotional Offers */}
            <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-lg border border-orange-200">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Promotional Offers
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get notified about special deals, discounts, and exclusive offers
                  tailored for you.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.offers}
                    onChange={(e) =>
                      setPreferences({ ...preferences, offers: e.target.checked })
                    }
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {preferences.offers
                      ? 'You will receive promotional offers'
                      : 'You will not receive promotional offers'}
                  </span>
                </label>
              </div>
            </div>

            {/* Order Updates */}
            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Order Updates
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Stay informed about your order status, shipping updates, and
                  delivery notifications.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.order_updates}
                    onChange={(e) =>
                      setPreferences({ ...preferences, order_updates: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {preferences.order_updates
                      ? 'You will receive order updates'
                      : 'You will not receive order updates'}
                  </span>
                </label>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Newsletter</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Receive our weekly digest with company news, product updates, and
                  helpful tips.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.newsletter}
                    onChange={(e) =>
                      setPreferences({ ...preferences, newsletter: e.target.checked })
                    }
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {preferences.newsletter
                      ? 'You will receive our newsletter'
                      : 'You will not receive our newsletter'}
                  </span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={handleSave}
                variant="primary"
                className="w-full"
                size="lg"
                isLoading={isSaving}
                icon={<Save className="w-5 h-5" />}
              >
                Save My Preferences
              </Button>
            </div>

            {/* Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                You can update your preferences at any time. Changes will take effect
                immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
