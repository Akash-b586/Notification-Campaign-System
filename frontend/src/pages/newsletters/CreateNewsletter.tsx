import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button, Card, Input, ToggleSwitch, LoadingSpinner } from "../../components/ui";
import { newsletterService } from "../../services/api";

export const CreateNewsletter: React.FC = () => {
  const navigate = useNavigate();
  const { newsletterId } = useParams<{ newsletterId: string }>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!newsletterId;

  useEffect(() => {
    if (isEditMode) {
      fetchNewsletter();
    }
  }, [newsletterId]);

  const fetchNewsletter = async () => {
    setIsFetching(true);
    setError("");
    try {
      const data = await newsletterService.get(newsletterId!);
      setFormData({
        title: data.title,
        description: data.description || "",
        isActive: data.isActive,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load newsletter");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isEditMode) {
        await newsletterService.update(newsletterId!, {
          title: formData.title,
          description: formData.description || undefined,
          isActive: formData.isActive,
        });
      } else {
        await newsletterService.create({
          title: formData.title,
          description: formData.description || undefined,
          isActive: formData.isActive,
        });
      }
      navigate("/newsletters");
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? "update" : "create"} newsletter`);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.title;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading newsletter..." />
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
          onClick={() => navigate("/newsletters")}
          size="sm"
        >
          Back to Newsletters
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          {isEditMode ? "Edit Newsletter" : "Create New Newsletter"}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? "Update newsletter details"
            : "Create a new newsletter to send to subscribers"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <Card title="Newsletter Details">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Input
            label="Title"
            placeholder="e.g., Weekly Product Updates"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description for your newsletter"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Newsletter Status
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Only active newsletters can be published
              </p>
            </div>
            <ToggleSwitch
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/newsletters")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              icon={<Save className="w-5 h-5" />}
              className="flex-1"
            >
              {isEditMode ? "Update Newsletter" : "Create Newsletter"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};