import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
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
import { logService } from '../../services/api';
import type { NotificationLog } from '../../types';

export const NotificationLogs: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const canDownload = hasPermission('logs', 'download');

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, campaignFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await logService.list({
        ...(statusFilter && { status: statusFilter }),
        ...(campaignFilter && { campaignId: campaignFilter }),
      });

      // Map backend format to frontend format
      const mappedLogs: NotificationLog[] = data.map((log: any) => ({
        log_id: log.id,
        user_id: log.userId,
        campaign_id: log.campaignId,
        campaign_name: log.campaign?.campaignName || 'Unknown Campaign',
        user_name: log.user?.name || 'Unknown User',
        user_email: log.user?.email || 'No email',
        sent_at: log.sentAt,
        status: log.status.toLowerCase(),
      }));

      setLogs(mappedLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.log_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || log.status === statusFilter;
    const matchesCampaign = !campaignFilter || log.campaign_id === campaignFilter;

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const handleDownloadCSV = () => {
    const csvContent = [
      'Log ID,User ID,User Name,User Email,Campaign ID,Campaign Name,Sent At,Status',
      ...filteredLogs.map((log) =>
        [
          log.log_id,
          log.user_id,
          log.user_name,
          log.user_email,
          log.campaign_id,
          log.campaign_name,
          log.sent_at,
          log.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const uniqueCampaigns = Array.from(new Set(logs.map((l) => l.campaign_id))).map((id) => {
    const log = logs.find((l) => l.campaign_id === id);
    return { value: id, label: log?.campaign_name || id };
  });

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : '0';

  const columns = [
    {
      key: 'log_id',
      header: 'Log ID',
      render: (log: NotificationLog) => (
        <span className="font-mono text-sm text-gray-600">{log.log_id}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (log: NotificationLog) => (
        <div>
          <div className="font-medium text-gray-900">{log.user_name}</div>
          <div className="text-sm text-gray-500">{log.user_email}</div>
        </div>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      render: (log: NotificationLog) => (
        <div>
          <div className="font-medium text-gray-900">{log.campaign_name}</div>
          <div className="text-sm text-gray-500 font-mono">{log.campaign_id}</div>
        </div>
      ),
    },
    {
      key: 'sent_at',
      header: 'Sent At',
      render: (log: NotificationLog) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(log.sent_at).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(log.sent_at).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (log: NotificationLog) => (
        <Badge variant={log.status === 'success' ? 'success' : 'error'}>
          {log.status}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading logs..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Logs</h1>
          <p className="text-gray-600 mt-1">Track and audit all notification activities</p>
        </div>
        {canDownload && (
          <Button
            onClick={handleDownloadCSV}
            variant="outline"
            icon={<Download className="w-5 h-5" />}
          >
            Export Logs
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Notifications</div>
          <div className="text-3xl font-bold text-gray-900">{logs.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Successful</div>
          <div className="text-3xl font-bold text-green-600">{successCount}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Failed</div>
          <div className="text-3xl font-bold text-red-600">{failedCount}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Success Rate</div>
          <div className="text-3xl font-bold text-primary-600">{successRate}%</div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                placeholder="Search logs..."
                icon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Campaigns' },
                ...uniqueCampaigns,
              ]}
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
            />
            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'success', label: 'Success' },
                { value: 'failed', label: 'Failed' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <Table data={filteredLogs} columns={columns} emptyMessage="No logs found" />
      </Card>
    </div>
  );
};
