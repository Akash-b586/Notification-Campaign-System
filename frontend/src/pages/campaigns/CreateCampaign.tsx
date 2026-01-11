import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { campaignService } from '../../services/api';

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    campaign_name: '',
    notification_type: '',
    city_filter: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCampaign, setIsFetchingCampaign] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!campaignId;

  useEffect(() => {
    if (isEditMode) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setIsFetchingCampaign(true);
    setError('');
    try {
      const data = await campaignService.get(campaignId!);
      // Convert backend format to frontend format
      const notifType = data.notificationType.toLowerCase().replace(/_/g, '-');
      setFormData({
        campaign_name: data.campaignName,
        notification_type: notifType === 'order-updates' ? 'order_updates' : notifType,
        city_filter: data.cityFilter || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign');
    } finally {
      setIsFetchingCampaign(false);
    }
  };

  const cities = ['', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

  const handleSaveDraft = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (isEditMode) {
        await campaignService.update(campaignId!, {
          campaignName: formData.campaign_name,
          notificationType: formData.notification_type,
          cityFilter: formData.city_filter || undefined,
        });
      } else {
        await campaignService.create({
          campaignName: formData.campaign_name,
          notificationType: formData.notification_type,
          cityFilter: formData.city_filter || undefined,
        });
      }

      navigate('/campaigns');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} campaign`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsLoading(true);
    setError('');
    try {
      let campaignIdToPreview = campaignId;

      if (isEditMode) {
        await campaignService.update(campaignId!, {
          campaignName: formData.campaign_name,
          notificationType: formData.notification_type,
          cityFilter: formData.city_filter || undefined,
        });
      } else {
        const response = await campaignService.create({
          campaignName: formData.campaign_name,
          notificationType: formData.notification_type,
          cityFilter: formData.city_filter || undefined,
        });
        campaignIdToPreview = response.campaignId;
      }

      navigate(`/campaigns/${campaignIdToPreview}/preview`, {
        state: { campaignName: formData.campaign_name },
      });
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} campaign`);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.campaign_name && formData.notification_type;

  if (isFetchingCampaign) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">Loading campaign...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? 'Update your notification campaign details'
            : 'Set up a new notification campaign with targeting criteria'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <Card title="Campaign Details">
        <div className="p-6 space-y-6">
          <Input
            label="Campaign Name"
            placeholder="e.g., Diwali Offers 2026"
            value={formData.campaign_name}
            onChange={(e) =>
              setFormData({ ...formData, campaign_name: e.target.value })
            }
            required
          />

          <Select
            label="Notification Type"
            options={[
              { value: '', label: 'Select notification type' },
              { value: 'offers', label: 'Promotional Offers' },
              { value: 'order_updates', label: 'Order Updates' },
              { value: 'newsletter', label: 'Newsletter' },
            ]}
            value={formData.notification_type}
            onChange={(e) =>
              setFormData({ ...formData, notification_type: e.target.value })
            }
            required
          />

          <Select
            label="Target City (Optional)"
            options={cities.map((city) => ({
              value: city,
              label: city || 'All Cities',
            }))}
            value={formData.city_filter}
            onChange={(e) =>
              setFormData({ ...formData, city_filter: e.target.value })
            }
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Targeting Criteria</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ User must be active</li>
              <li>
                ✓ User must have opted in for{' '}
                <strong>
                  {formData.notification_type
                    ? formData.notification_type.replace('_', ' ')
                    : 'selected notification type'}
                </strong>
              </li>
              {formData.city_filter && (
                <li>
                  ✓ User must be from <strong>{formData.city_filter}</strong>
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="p-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            {isEditMode ? 'Update campaign or preview recipients' : 'Save as draft or proceed to preview recipients'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              icon={<Save className="w-5 h-5" />}
            >
              {isEditMode ? 'Update Campaign' : 'Save as Draft'}
            </Button>
            <Button
              variant="primary"
              onClick={handlePreview}
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              icon={<Eye className="w-5 h-5" />}
            >
              Preview Recipients
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
