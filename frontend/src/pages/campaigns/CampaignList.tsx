import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Table,
  Badge,
  LoadingSpinner,
  Select,
} from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useCampaignStore } from '../../store/campaignStore';
import type { Campaign } from '../../types';

export const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const { campaigns, setCampaigns } = useCampaignStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const canCreate = hasPermission('campaigns', 'create');
  const canUpdate = hasPermission('campaigns', 'update');

  useEffect(() => {
    // Mock data load
    setTimeout(() => {
      const mockCampaigns: Campaign[] = [
        {
          campaign_id: '1',
          campaign_name: 'Diwali Offers 2026',
          notification_type: 'offers',
          city_filter: 'Delhi',
          created_by: 'admin-1',
          status: 'sent',
          created_at: '2026-01-05T10:00:00Z',
          recipient_count: 450,
        },
        {
          campaign_id: '2',
          campaign_name: 'Order Status Updates',
          notification_type: 'order_updates',
          created_by: 'creator-1',
          status: 'sent',
          created_at: '2026-01-06T14:30:00Z',
          recipient_count: 1250,
        },
        {
          campaign_id: '3',
          campaign_name: 'January Newsletter',
          notification_type: 'newsletter',
          city_filter: 'Mumbai',
          created_by: 'creator-1',
          status: 'draft',
          created_at: '2026-01-08T09:15:00Z',
          recipient_count: 0,
        },
        {
          campaign_id: '4',
          campaign_name: 'Flash Sale Bangalore',
          notification_type: 'offers',
          city_filter: 'Bangalore',
          created_by: 'admin-1',
          status: 'draft',
          created_at: '2026-01-09T11:00:00Z',
          recipient_count: 0,
        },
      ];
      setCampaigns(mockCampaigns);
      setIsLoading(false);
    }, 800);
  }, [setCampaigns]);

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.campaign_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    const matchesType = !typeFilter || campaign.notification_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'offers':
        return 'badge-warning';
      case 'order_updates':
        return 'badge-info';
      case 'newsletter':
        return 'badge-success';
      default:
        return 'badge-draft';
    }
  };

  const columns = [
    {
      key: 'campaign_id',
      header: 'Campaign ID',
      render: (campaign: Campaign) => (
        <span className="font-mono text-sm text-gray-600">{campaign.campaign_id}</span>
      ),
    },
    {
      key: 'campaign_name',
      header: 'Campaign Name',
      render: (campaign: Campaign) => (
        <div>
          <div className="font-medium text-gray-900">{campaign.campaign_name}</div>
          <div className="text-sm text-gray-500">
            Created {new Date(campaign.created_at!).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'notification_type',
      header: 'Type',
      render: (campaign: Campaign) => (
        <Badge className={getNotificationTypeColor(campaign.notification_type)}>
          {campaign.notification_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'city_filter',
      header: 'Target City',
      render: (campaign: Campaign) => (
        <span className="text-gray-600">{campaign.city_filter || 'All Cities'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (campaign: Campaign) => (
        <Badge variant={campaign.status === 'sent' ? 'success' : 'draft'}>
          {campaign.status}
        </Badge>
      ),
    },
    {
      key: 'recipient_count',
      header: 'Recipients',
      render: (campaign: Campaign) => (
        <span className="font-medium text-gray-900">
          {campaign.recipient_count || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (campaign: Campaign) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/campaigns/${campaign.campaign_id}/preview`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview Recipients"
          >
            <Eye className="w-4 h-4" />
          </button>
          {campaign.status === 'draft' && canUpdate && (
            <button
              onClick={() => navigate(`/campaigns/${campaign.campaign_id}/edit`)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Edit Campaign"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {campaign.status === 'sent' && (
            <button
              onClick={() => navigate(`/logs?campaign=${campaign.campaign_id}`)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="View Logs"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '120px',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading campaigns..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-1">Create and manage notification campaigns</p>
        </div>
        {canCreate && (
          <Button
            onClick={() => navigate('/campaigns/create')}
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
          >
            Create Campaign
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Campaigns</div>
          <div className="text-3xl font-bold text-gray-900">{campaigns.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Sent</div>
          <div className="text-3xl font-bold text-green-600">
            {campaigns.filter((c) => c.status === 'sent').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-gray-600">
            {campaigns.filter((c) => c.status === 'draft').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Recipients</div>
          <div className="text-3xl font-bold text-primary-600">
            {campaigns.reduce((sum, c) => sum + (c.recipient_count || 0), 0)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="Search campaigns..."
                icon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'All Types' },
                { value: 'offers', label: 'Offers' },
                { value: 'order_updates', label: 'Order Updates' },
                { value: 'newsletter', label: 'Newsletter' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <Table
          data={filteredCampaigns}
          columns={columns}
          emptyMessage="No campaigns found"
        />
      </Card>
    </div>
  );
};
