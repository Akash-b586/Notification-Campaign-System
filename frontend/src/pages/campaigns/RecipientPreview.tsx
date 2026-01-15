import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Send, Users, CheckCircle, Calendar } from 'lucide-react';
import {
  Button,
  Card,
  Table,
  Badge,
  LoadingSpinner,
  Modal,
  Input,
} from '../../components/ui';
import { campaignService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types';

export const RecipientPreview: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [campaign, setCampaign] = useState<any>(location.state || null);
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [sendType, setSendType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
      fetchPreview();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    // Only fetch if we don't have campaign data with status
    if (campaign && campaign.status) return;
    
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
    if (sendType === 'scheduled') {
      if (!scheduledDateTime) {
        setSendError('Please select a date and time for scheduling');
        return;
      }
      
      const scheduledDate = new Date(scheduledDateTime);
      const now = new Date();
      
      if (scheduledDate <= now) {
        setSendError('Scheduled time must be in the future');
        return;
      }
    }

    setIsSending(true);
    setSendError('');

    try {
      const sendOptions = sendType === 'scheduled' ? { scheduledAt: scheduledDateTime } : {};
      await campaignService.send(campaignId!, sendOptions);
      navigate('/campaigns');
    } catch (err: any) {
      setSendError(err.message || 'Failed to send campaign');
    } finally {
      setIsSending(false);
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
                User must have opted in for OFFERS notifications
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
            {campaign && (
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                icon={<Download className="w-5 h-5" />}
                className="w-full"
              >
                Download CSV
              </Button>
            )}
            {campaign && campaign.status === 'DRAFT' && (
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
        onClose={() => {
          setShowConfirmModal(false);
          setSendError('');
          setSendType('immediate');
          setScheduledDateTime('');
        }}
        title="Confirm Send Campaign"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false);
                setSendError('');
                setSendType('immediate');
                setScheduledDateTime('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSend}
              isLoading={isSending}
              icon={<Send className="w-5 h-5" />}
            >
              {sendType === 'scheduled' ? 'Schedule Campaign' : `Send to ${eligibleUsers.length} Users`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            You are about to send <strong>{campaign?.campaignName || 'this campaign'}</strong> to{' '}
            <strong>{eligibleUsers.length} users</strong>.
          </p>

          {/* Send Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">Send Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: sendType === 'immediate' ? '#3b82f6' : '#e5e7eb', backgroundColor: sendType === 'immediate' ? '#eff6ff' : '#f9fafb'}}>
                <input
                  type="radio"
                  name="sendType"
                  value="immediate"
                  checked={sendType === 'immediate'}
                  onChange={(e) => {
                    setSendType(e.target.value as 'immediate' | 'scheduled');
                    setSendError('');
                  }}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Send Immediately</div>
                    <div className="text-xs text-gray-500">Campaign will be sent right away</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: sendType === 'scheduled' ? '#3b82f6' : '#e5e7eb', backgroundColor: sendType === 'scheduled' ? '#eff6ff' : '#f9fafb'}}>
                <input
                  type="radio"
                  name="sendType"
                  value="scheduled"
                  checked={sendType === 'scheduled'}
                  onChange={(e) => {
                    setSendType(e.target.value as 'immediate' | 'scheduled');
                    setSendError('');
                  }}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-medium text-gray-900">Schedule for Later</div>
                    <div className="text-xs text-gray-500">Campaign will be sent at a specific time</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Scheduled DateTime Input */}
          {sendType === 'scheduled' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Schedule Date & Time</label>
              <Input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => {
                  setScheduledDateTime(e.target.value);
                  setSendError('');
                }}
                placeholder="Select date and time"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Select when you want this campaign to be sent. Must be a future date and time.
              </p>
            </div>
          )}

          {/* Error Message */}
          {sendError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {sendError}
            </div>
          )}

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