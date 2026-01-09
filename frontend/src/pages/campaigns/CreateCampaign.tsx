import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { useCampaignStore } from '../../store/campaignStore';
import { useAuthStore } from '../../store/authStore';
import type { Campaign } from '../../types';

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { addCampaign } = useCampaignStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    campaign_name: '',
    notification_type: '',
    city_filter: '',
  });

  const cities = ['', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

  const handleSaveDraft = () => {
    const newCampaign: Campaign = {
      campaign_id: `camp-${Date.now()}`,
      campaign_name: formData.campaign_name,
      notification_type: formData.notification_type as any,
      city_filter: formData.city_filter || undefined,
      created_by: user?.user_id || '',
      status: 'draft',
      created_at: new Date().toISOString(),
    };

    addCampaign(newCampaign);
    navigate('/campaigns');
  };

  const handlePreview = () => {
    // Store form data temporarily and navigate to preview
    const newCampaign: Campaign = {
      campaign_id: `temp-${Date.now()}`,
      campaign_name: formData.campaign_name,
      notification_type: formData.notification_type as any,
      city_filter: formData.city_filter || undefined,
      created_by: user?.user_id || '',
      status: 'draft',
      created_at: new Date().toISOString(),
    };

    addCampaign(newCampaign);
    navigate(`/campaigns/${newCampaign.campaign_id}/preview`);
  };

  const isValid = formData.campaign_name && formData.notification_type;

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
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Campaign</h1>
        <p className="text-gray-600 mt-1">
          Set up a new notification campaign with targeting criteria
        </p>
      </div>

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
            Save as draft or proceed to preview recipients
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!isValid}
              icon={<Save className="w-5 h-5" />}
            >
              Save as Draft
            </Button>
            <Button
              variant="primary"
              onClick={handlePreview}
              disabled={!isValid}
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
