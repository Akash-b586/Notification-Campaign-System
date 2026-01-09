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
import { useUserStore } from '../../store/userStore';
import { usePreferenceStore } from '../../store/preferenceStore';
import type { NotificationPreference, User } from '../../types';

interface UserWithPreferences extends User {
  preferences: NotificationPreference;
}

export const NotificationPreferences: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const { users, setUsers } = useUserStore();
  const { preferences, setPreferences, updatePreference } = usePreferenceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [changedUsers, setChangedUsers] = useState<Set<string>>(new Set());

  const canUpdate = hasPermission('preferences', 'update');

  useEffect(() => {
    // Mock data load
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          user_id: '1',
          name: 'Amit Kumar',
          email: 'amit@example.com',
          phone: '9999999999',
          city: 'Delhi',
          is_active: true,
        },
        {
          user_id: '2',
          name: 'Riya Sharma',
          email: 'riya@example.com',
          phone: '8888888888',
          city: 'Mumbai',
          is_active: true,
        },
        {
          user_id: '3',
          name: 'Priya Singh',
          email: 'priya@example.com',
          phone: '7777777777',
          city: 'Bangalore',
          is_active: false,
        },
        {
          user_id: '4',
          name: 'Raj Patel',
          email: 'raj@example.com',
          phone: '6666666666',
          city: 'Delhi',
          is_active: true,
        },
      ];
      setUsers(mockUsers);

      const mockPreferences: NotificationPreference[] = [
        { user_id: '1', offers: true, order_updates: true, newsletter: false },
        { user_id: '2', offers: false, order_updates: true, newsletter: true },
        { user_id: '3', offers: true, order_updates: false, newsletter: false },
        { user_id: '4', offers: true, order_updates: true, newsletter: true },
      ];
      setPreferences(mockPreferences);

      setIsLoading(false);
    }, 800);
  }, [setUsers, setPreferences]);

  const handlePreferenceChange = (
    userId: string,
    type: keyof NotificationPreference,
    value: boolean
  ) => {
    updatePreference(userId, { [type]: value });
    setChangedUsers(new Set([...changedUsers, userId]));
  };

  const handleSave = () => {
    // Mock save - Replace with actual API call
    console.log('Saving preferences for users:', Array.from(changedUsers));
    setChangedUsers(new Set());
    alert('Preferences saved successfully!');
  };

  const usersWithPreferences: UserWithPreferences[] = users
    .filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map((user) => ({
      ...user,
      preferences: preferences[user.user_id] || {
        user_id: user.user_id,
        offers: false,
        order_updates: false,
        newsletter: false,
      },
    }));

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (user: UserWithPreferences) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
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
            checked={user.preferences.offers}
            onChange={(value) =>
              handlePreferenceChange(user.user_id, 'offers', value)
            }
            disabled={!canUpdate}
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
            checked={user.preferences.order_updates}
            onChange={(value) =>
              handlePreferenceChange(user.user_id, 'order_updates', value)
            }
            disabled={!canUpdate}
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
            checked={user.preferences.newsletter}
            onChange={(value) =>
              handlePreferenceChange(user.user_id, 'newsletter', value)
            }
            disabled={!canUpdate}
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
          >
            Save Changes ({changedUsers.size})
          </Button>
        )}
      </div>

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
              usersWithPreferences.filter((u) => u.preferences.offers).length
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
              usersWithPreferences.filter((u) => u.preferences.order_updates).length
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
              usersWithPreferences.filter((u) => u.preferences.newsletter).length
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

      {!canUpdate && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <p className="font-medium">Read-only mode</p>
          <p>You don't have permission to update preferences.</p>
        </div>
      )}
    </div>
  );
};
