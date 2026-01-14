import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Mail, Users, Send, Calendar } from "lucide-react";
import { Button, Card, Table, Badge, LoadingSpinner, Modal, Input } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { newsletterService } from "../../services/api";
import type { Newsletter } from "../../types";

export const NewsletterList: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [publishType, setPublishType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await newsletterService.list();
      setNewsletters(data);
    } catch (err: any) {
      setError(err.message || "Failed to load newsletters");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await newsletterService.delete(deleteId);
      setNewsletters(newsletters.filter((n) => n.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete newsletter");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    if (!publishId) return;

    // Validate scheduled time if sending is scheduled
    if (publishType === 'scheduled') {
      if (!scheduledDateTime) {
        setPublishError('Please select a date and time for scheduling');
        return;
      }

      const scheduledDate = new Date(scheduledDateTime);
      const now = new Date();

      if (scheduledDate <= now) {
        setPublishError('Scheduled time must be in the future');
        return;
      }
    }

    setIsPublishing(true);
    setPublishError('');

    try {
      const scheduledAt = publishType === 'scheduled' ? scheduledDateTime : undefined;
      await newsletterService.publish(publishId, scheduledAt);
      setPublishId(null);
      setPublishType('immediate');
      setScheduledDateTime('');
      // Optionally refresh the list or show a success message
      await fetchNewsletters();
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish newsletter');
    } finally {
      setIsPublishing(false);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Newsletter",
      render: (newsletter: Newsletter) => (
        <div>
          <h3 className="font-semibold text-gray-900">{newsletter.title}</h3>
          <p className="text-sm text-gray-600">{newsletter.slug}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (newsletter: Newsletter) => (
        <span className="text-gray-600">{newsletter.description || "-"}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (newsletter: Newsletter) => (
        <Badge variant={newsletter.isActive ? "success" : "warning"}>
          {newsletter.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (newsletter: Newsletter) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Send className="w-4 h-4 text-green-600" />}
            onClick={() => setPublishId(newsletter.id)}
            disabled={!newsletter.isActive}
            title={!newsletter.isActive ? "Newsletter must be active to publish" : "Publish newsletter"}
          >
            Publish
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={() => navigate(`/newsletters/${newsletter.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 className="w-4 h-4 text-red-600" />}
            onClick={() => setDeleteId(newsletter.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading newsletters..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletters</h1>
          <p className="text-gray-600 mt-1">Manage your newsletters and subscriptions</p>
        </div>
        <Button
          onClick={() => navigate("/newsletters/create")}
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
        >
          Create Newsletter
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Newsletters</p>
          <p className="text-2xl font-bold text-gray-900">{newsletters.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {newsletters.filter((n) => n.isActive).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {newsletters.filter((n) => !n.isActive).length}
          </p>
        </Card>
      </div>

      {/* Newsletters Table */}
      <Card>
        <Table
          data={newsletters}
          columns={columns}
          emptyMessage="No newsletters found"
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        title="Delete Newsletter"
        onClose={() => setDeleteId(null)}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this newsletter? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Publish Modal */}
      <Modal
        isOpen={!!publishId}
        onClose={() => {
          setPublishId(null);
          setPublishError('');
          setPublishType('immediate');
          setScheduledDateTime('');
        }}
        title="Publish Newsletter"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setPublishId(null);
                setPublishError('');
                setPublishType('immediate');
                setScheduledDateTime('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handlePublish}
              isLoading={isPublishing}
              icon={<Send className="w-5 h-5" />}
            >
              {publishType === 'scheduled' ? 'Schedule Newsletter' : 'Publish Now'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            You are about to publish <strong>{newsletters.find(n => n.id === publishId)?.title || 'this newsletter'}</strong> to all subscribers.
          </p>

          {/* Publish Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">Publish Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: publishType === 'immediate' ? '#3b82f6' : '#e5e7eb', backgroundColor: publishType === 'immediate' ? '#eff6ff' : '#f9fafb'}}>
                <input
                  type="radio"
                  name="publishType"
                  value="immediate"
                  checked={publishType === 'immediate'}
                  onChange={(e) => {
                    setPublishType(e.target.value as 'immediate' | 'scheduled');
                    setPublishError('');
                  }}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Publish Immediately</div>
                    <div className="text-xs text-gray-500">Newsletter will be sent right away</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all" style={{borderColor: publishType === 'scheduled' ? '#3b82f6' : '#e5e7eb', backgroundColor: publishType === 'scheduled' ? '#eff6ff' : '#f9fafb'}}>
                <input
                  type="radio"
                  name="publishType"
                  value="scheduled"
                  checked={publishType === 'scheduled'}
                  onChange={(e) => {
                    setPublishType(e.target.value as 'immediate' | 'scheduled');
                    setPublishError('');
                  }}
                  className="w-4 h-4"
                />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-medium text-gray-900">Schedule for Later</div>
                    <div className="text-xs text-gray-500">Newsletter will be sent at a specific time</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Scheduled DateTime Input */}
          {publishType === 'scheduled' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">Schedule Date & Time</label>
              <Input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => {
                  setScheduledDateTime(e.target.value);
                  setPublishError('');
                }}
                placeholder="Select date and time"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Select when you want this newsletter to be published. Must be a future date and time.
              </p>
            </div>
          )}

          {/* Error Message */}
          {publishError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {publishError}
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All active subscribers with enabled notification channels will receive this newsletter.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};