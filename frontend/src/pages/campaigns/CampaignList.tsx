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
import { campaignService } from '../../services/api';
import type { Campaign } from '../../types';

export const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const { campaigns, setCampaigns } = useCampaignStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canCreate = hasPermission('campaigns', 'create');
  const canUpdate = hasPermission('campaigns', 'update');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await campaignService.list();
      // Map backend response to frontend format
      const mappedCampaigns: Campaign[] = data.map((c: any) => ({
        campaign_id: c.id,
        campaign_name: c.campaignName,
        notification_type: c.notificationType.toLowerCase(),
        city_filter: c.cityFilter,
        created_by: c.createdById,
        status: c.status.toLowerCase(),
        created_at: c.createdAt,
        recipient_count: 0, // Will be fetched separately if needed
      }));
      setCampaigns(mappedCampaigns);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
