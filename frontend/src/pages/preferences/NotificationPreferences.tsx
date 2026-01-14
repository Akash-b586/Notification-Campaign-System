import React, { useState, useEffect } from 'react';
import { Search, Save, Bell, Mail, Package } from 'lucide-react';
import {
  Card,
  Input,
  Table,
  ToggleSwitch,
  LoadingSpinner,
  Button,
} from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { preferenceService } from '../../services/api';
import type { User } from '../../types';

interface UserWithPreferences extends User {
  preference: {
    offers: boolean;
    orderUpdates: boolean;
    newsletter: boolean;
  } | null;
}

export const NotificationPreferences: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const [users, setUsers] = useState<UserWithPreferences[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [changedUsers, setChangedUsers] = useState<Map<string, any>>(new Map());

  // Admin and creators can only view preferences, not edit them
  // Users can edit their own preferences in the user dashboard
  const canUpdate = false;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await preferenceService.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (
    userId: string,
    type: 'offers' | 'orderUpdates' | 'newsletter',
    value: boolean
  ) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.user_id === userId && user.preference) {
          return {
            ...user,
            preference: {
              ...user.preference,
              [type]: value,
            },
          };
        }
        return user;
      })
    );

    const existingChanges = changedUsers.get(userId) || {};
    setChangedUsers(new Map(changedUsers.set(userId, { ...existingChanges, [type]: value })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      const promises = Array.from(changedUsers.entries()).map(([userId, changes]) =>
        preferenceService.updateUserPreference(userId, changes)
      );

      await Promise.all(promises);
      setChangedUsers(new Map());
      alert('Preferences saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const usersWithPreferences: UserWithPreferences[] = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: UserWithPreferences) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
        </div>
      ),
      width: '30%',
    },
    {
      key: 'offers',
      header: (
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <span>Promotional Offers</span>
        </div>
      ),
      render: (user: UserWithPreferences) => (
        <div className="flex items-center justify-center">
          <ToggleSwitch
            checked={user.preference?.offers || false}
            onChange={(value) =>
              handlePreferenceChange(user.user_id, 'offers', value)
            }
            disabled={!canUpdate || !user.preference}
          />
        </div>
      ),
    },
    {
      key: 'order_updates',
      header: (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-500" />
          <span>Order Updates</span>
        </div>
      ),
      render: (user: UserWithPreferences) => (
        <div className="flex items-center justify-center">
          <ToggleSwitch
            checked={user.preference?.orderUpdates || false}
            onChange={(value) =>
              handlePreferenceChange(user.user_id, 'orderUpdates', value)
            }
            disabled={!canUpdate || !user.preference}
          />
        </div>
      ),
    },
    {
      key: 'newsletter',
      header: (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-green-500" />
          <span>Newsletter</span>
        </div>
      ),
      render: (user: UserWithPreferences) => (
        <div className="flex items-center justify-center">
          <ToggleSwitch
            checked={user.preference?.newsletter || false}
            onChange={(value) =>
              handlePreferenceChange(user.user_id, 'newsletter', value)
            }
            disabled={!canUpdate || !user.preference}
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading preferences..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
          <p className="text-gray-600 mt-1">
            Manage user notification preferences and opt-ins
          </p>
        </div>
        {canUpdate && changedUsers.size > 0 && (
          <Button
            onClick={handleSave}
            variant="success"
            icon={<Save className="w-5 h-5" />}
            isLoading={isSaving}
          >
            Save Changes ({changedUsers.size})
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Promotional Offers</h3>
          </div>
          <p className="text-sm text-gray-600">
            Special deals, discounts, and exclusive offers
          </p>
          <div className="mt-3 text-2xl font-bold text-orange-600">
            {
              usersWithPreferences.filter((u) => u.preference?.offers).length
            }{' '}
            <span className="text-sm font-normal text-gray-600">opted in</span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Order Updates</h3>
          </div>
          <p className="text-sm text-gray-600">
            Shipping, delivery, and order status notifications
          </p>
          <div className="mt-3 text-2xl font-bold text-blue-600">
            {
              usersWithPreferences.filter((u) => u.preference?.orderUpdates).length
            }{' '}
            <span className="text-sm font-normal text-gray-600">opted in</span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Newsletter</h3>
          </div>
          <p className="text-sm text-gray-600">
            Weekly digest, company news, and product updates
          </p>
          <div className="mt-3 text-2xl font-bold text-green-600">
            {
              usersWithPreferences.filter((u) => u.preference?.newsletter).length
            }{' '}
            <span className="text-sm font-normal text-gray-600">opted in</span>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="p-6">
          <Input
            placeholder="Search users by name or email..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Preferences Table */}
      <Card>
        <Table
          data={usersWithPreferences}
          columns={columns}
          emptyMessage="No users found"
        />
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
        <p className="font-medium">📋 View-Only Access</p>
      </div>
    </div>
  );
};
