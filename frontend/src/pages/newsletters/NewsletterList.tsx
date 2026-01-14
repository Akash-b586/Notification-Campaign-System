import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Mail, Users } from "lucide-react";
import { Button, Card, Table, Badge, LoadingSpinner, Modal } from "../../components/ui";
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
    </div>
  );
};