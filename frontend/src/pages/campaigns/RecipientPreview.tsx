import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Send, Users, CheckCircle } from 'lucide-react';
import {
  Button,
  Card,
  Table,
  Badge,
  LoadingSpinner,
  Modal,
} from '../../components/ui';
import { campaignService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

export const RecipientPreview: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuthStore();
  const [campaign, setCampaign] = useState<any>(location.state || null);
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const canSend = hasPermission('campaigns', 'send');
  const canDownload = hasPermission('campaigns', 'download');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
      fetchPreview();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    if (campaign && campaign.campaignName) return; // Already have campaign data from navigation
    
    try {
      const data = await campaignService.get(campaignId!);
      setCampaign(data);
    } catch (err: any) {
      console.error('Failed to fetch campaign:', err);
    }
  };

  const fetchPreview = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await campaignService.preview(campaignId!);
      setEligibleUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      'User ID,Name,Email,Phone,City',
      ...eligibleUsers.map((user) =>
        [user.userId, user.name, user.email, user.phone || '', user.city || ''].join(',')
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
    setError('');

    try {
      await campaignService.send(campaignId!);
      navigate('/campaigns');
    } catch (err: any) {
      setError(err.message || 'Failed to send campaign');
    } finally {
      setIsSending(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading recipients..." />
      </div>
    );
  }

  if (error && eligibleUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
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

  const columns = [
    {
      key: 'userId' as const,
      header: 'User ID',
      render: (user: User) => (
        <span className="font-mono text-sm text-gray-600">{user.userId}</span>
      ),
    },
    {
      key: 'name' as const,
      header: 'Name',
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      render: (user: User) => <span className="text-gray-600">{user.phone || '-'}</span>,
    },
    {
      key: 'city' as const,
      header: 'City',
      render: (user: User) => <span className="text-gray-600">{user.city || '-'}</span>,
    },
    {
      key: 'isActive' as const,
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
        <p className="text-gray-600 mt-1">
          {campaign ? campaign.campaignName : `Campaign ID: ${campaignId}`}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
                User must have opted in for notifications
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-linear-to-br from-primary-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Eligible Recipients</h3>
          </div>
          <div className="text-4xl font-bold text-primary-600">
            {eligibleUsers.length}
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-green-50 to-white">
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
            {canSend && campaign && campaign.status === 'DRAFT' && (
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
            You are about to send <strong>{campaign?.campaignName || 'this campaign'}</strong> to{' '}
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
