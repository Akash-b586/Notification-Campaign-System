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
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    const matchesType = !typeFilter || campaign.notificationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'OFFERS':
        return 'badge-warning';
      case 'ORDER_UPDATES':
        return 'badge-info';
      case 'NEWSLETTER':
        return 'badge-success';
      default:
        return 'badge-draft';
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Campaign ID',
      render: (campaign: Campaign) => (
        <span className="font-mono text-sm text-gray-600">{campaign.id}</span>
      ),
    },
    {
      key: 'campaignName',
      header: 'Campaign Name',
      render: (campaign: Campaign) => (
        <div>
          <div className="font-medium text-gray-900">{campaign.campaignName}</div>
          <div className="text-sm text-gray-500">
            Created {new Date(campaign.createdAt!).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'notificationType',
      header: 'Type',
      render: (campaign: Campaign) => (
        <Badge className={getNotificationTypeColor(campaign.notificationType)}>
          {campaign.notificationType.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'cityFilter',
      header: 'Target City',
      render: (campaign: Campaign) => (
        <span className="text-gray-600">{campaign.cityFilter || 'All Cities'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (campaign: Campaign) => (
        <Badge variant={campaign.status === 'SENT' ? 'success' : 'draft'}>
          {campaign.status}
        </Badge>
      ),
    },
    {
      key: 'recipientCount',
      header: 'Recipients',
      render: (campaign: Campaign) => (
        <span className="font-medium text-gray-900">
          {campaign.recipientCount || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (campaign: Campaign) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/campaigns/${campaign.id}/preview`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview Recipients"
          >
            <Eye className="w-4 h-4" />
          </button>
          {campaign.status === 'DRAFT' && canUpdate && (
            <button
              onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Edit Campaign"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {campaign.status === 'SENT' && (
            <button
              onClick={() => navigate(`/logs?campaign=${campaign.id}`)}
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
            {campaigns.filter((c) => c.status === 'SENT').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-gray-600">
            {campaigns.filter((c) => c.status === 'DRAFT').length}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Recipients</div>
          <div className="text-3xl font-bold text-primary-600">
            {campaigns.reduce((sum, c) => sum + (c.recipientCount || 0), 0)}
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
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Sent' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'All Types' },
                { value: 'OFFERS', label: 'Offers' },
                { value: 'ORDER_UPDATES', label: 'Order Updates' },
                { value: 'NEWSLETTER', label: 'Newsletter' },
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
