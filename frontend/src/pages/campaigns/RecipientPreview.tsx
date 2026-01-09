import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, Users, CheckCircle } from 'lucide-react';
import {
  Button,
  Card,
  Table,
  Badge,
  LoadingSpinner,
  Modal,
} from '../../components/ui';
import { useCampaignStore } from '../../store/campaignStore';
import { useUserStore } from '../../store/userStore';
import { usePreferenceStore } from '../../store/preferenceStore';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

export const RecipientPreview: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { campaigns, updateCampaign } = useCampaignStore();
  const { users } = useUserStore();
  const { preferences } = usePreferenceStore();
  const { hasPermission } = useAuthStore();
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const campaign = campaigns.find((c) => c.campaign_id === campaignId);
  const canSend = hasPermission('campaigns', 'send');
  const canDownload = hasPermission('campaigns', 'download');

  useEffect(() => {
    if (!campaign) return;

    // Calculate eligible users
    setTimeout(() => {
      const eligible = users.filter((user) => {
        // Must be active
        if (!user.is_active) return false;

        // Must have opted in for the notification type
        const userPref = preferences[user.user_id];
        if (!userPref) return false;

        const notifType = campaign.notification_type;
        if (!userPref[notifType]) return false;

        // Must match city filter if specified
        if (campaign.city_filter && user.city !== campaign.city_filter) {
          return false;
        }

        return true;
      });

      setEligibleUsers(eligible);
      setIsLoading(false);
    }, 800);
  }, [campaign, users, preferences]);

  const handleDownloadCSV = () => {
    const csvContent = [
      'User ID,Name,Email,Phone,City',
      ...eligibleUsers.map((user) =>
        [user.user_id, user.name, user.email, user.phone || '', user.city || ''].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaignId}-recipients.csv`;
    a.click();
  };

  const handleSend = async () => {
    setIsSending(true);

    // Mock sending process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update campaign status
    updateCampaign(campaignId!, {
      status: 'sent',
      recipient_count: eligibleUsers.length,
    });

    setIsSending(false);
    setShowConfirmModal(false);
    navigate('/campaigns');
  };

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Campaign not found</p>
        <Button
          onClick={() => navigate('/campaigns')}
          variant="primary"
          className="mt-4"
        >
          Back to Campaigns
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Calculating eligible recipients..." />
      </div>
    );
  }

  const columns = [
    {
      key: 'user_id',
      header: 'User ID',
      render: (user: User) => (
        <span className="font-mono text-sm text-gray-600">{user.user_id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (user: User) => <span className="text-gray-600">{user.phone || '-'}</span>,
    },
    {
      key: 'city',
      header: 'City',
      render: (user: User) => <span className="text-gray-600">{user.city || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <Badge variant="success">Eligible</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          icon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate('/campaigns')}
          size="sm"
        >
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Recipient Preview</h1>
        <p className="text-gray-600 mt-1">{campaign.campaign_name}</p>
      </div>

      {/* Campaign Info */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Targeting Logic</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">User must be active</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">
                User must have opted in for{' '}
                <strong>{campaign.notification_type.replace('_', ' ')}</strong>
              </span>
            </div>
            {campaign.city_filter && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  User must be from <strong>{campaign.city_filter}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Eligible Recipients</h3>
          </div>
          <div className="text-4xl font-bold text-primary-600">
            {eligibleUsers.length}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Ready to Send</h3>
          </div>
          <div className="text-4xl font-bold text-green-600">
            {eligibleUsers.length}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-3">
            {canDownload && (
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                icon={<Download className="w-5 h-5" />}
                className="w-full"
              >
                Download CSV
              </Button>
            )}
            {canSend && campaign.status === 'draft' && (
              <Button
                variant="success"
                onClick={() => setShowConfirmModal(true)}
                icon={<Send className="w-5 h-5" />}
                className="w-full"
                disabled={eligibleUsers.length === 0}
              >
                Confirm & Send
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Recipients Table */}
      <Card title={`Recipients (${eligibleUsers.length})`}>
        <Table
          data={eligibleUsers}
          columns={columns}
          emptyMessage="No eligible recipients found"
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Send Campaign"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSend}
              isLoading={isSending}
              icon={<Send className="w-5 h-5" />}
            >
              Send to {eligibleUsers.length} Users
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            You are about to send <strong>{campaign.campaign_name}</strong> to{' '}
            <strong>{eligibleUsers.length} users</strong>.
          </p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This action cannot be undone. Make sure you have reviewed
              the recipient list carefully.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
