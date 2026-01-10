import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Upload,
  Trash2,
  Edit,
  Eye,
  FileJson,
  FileText,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Table,
  Modal,
  ToggleSwitch,
  LoadingSpinner,
  Select,
} from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import type { User } from "../../types";

export const UserManagement: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const { users, setUsers, addUser, updateUser, deleteUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    is_active: true,
  });

  const [bulkData, setBulkData] = useState("");
  const [bulkType, setBulkType] = useState<"json" | "csv">("json");

  useEffect(() => {
    // Mock data load
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          user_id: "1",
          name: "Amit Kumar",
          email: "amit@example.com",
          phone: "9999999999",
          city: "Delhi",
          is_active: true,
        },
        {
          user_id: "2",
          name: "Riya Sharma",
          email: "riya@example.com",
          phone: "8888888888",
          city: "Mumbai",
          is_active: true,
        },
        {
          user_id: "3",
          name: "Priya Singh",
          email: "priya@example.com",
          phone: "7777777777",
          city: "Bangalore",
          is_active: false,
        },
        {
          user_id: "4",
          name: "Raj Patel",
          email: "raj@example.com",
          phone: "6666666666",
          city: "Delhi",
          is_active: true,
        },
      ];
      setUsers(mockUsers);
      setIsLoading(false);
    }, 800);
  }, [setUsers]);

  const canCreate = hasPermission("users", "create");
  const canUpdate = hasPermission("users", "update");
  const canDelete = hasPermission("users", "delete");

  const cities = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
  ];

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        city: user.city || "",
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      updateUser(editingUser.user_id, formData);
    } else {
      const newUser: User = {
        user_id: `user-${Date.now()}`,
        ...formData,
      };
      addUser(newUser);
    }

    setIsModalOpen(false);
  };

  const handleBulkUpload = () => {
    try {
      if (bulkType === "json") {
        const data = JSON.parse(bulkData);
        const usersArray = data.users || data;
        usersArray.forEach((user: any) => {
          const newUser: User = {
            user_id: user.user_id || `user-${Date.now()}-${Math.random()}`,
            name: user.name,
            email: user.email,
            phone: user.phone,
            city: user.city,
            is_active: user.is_active !== false,
          };
          addUser(newUser);
        });
      } else {
        // CSV parsing
        const lines = bulkData.trim().split("\n");

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const newUser: User = {
            user_id: values[0] || `user-${Date.now()}-${i}`,
            name: values[1],
            email: values[2],
            phone: values[3],
            city: values[4],
            is_active: values[5] !== "false",
          };
          addUser(newUser);
        }
      }
      setIsBulkModalOpen(false);
      setBulkData("");
    } catch (error) {
      alert("Invalid data format. Please check and try again.");
    }
  };

  const handleDelete = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  const handleToggleActive = (userId: string, isActive: boolean) => {
    updateUser(userId, { is_active: isActive });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = !selectedCity || user.city === selectedCity;
    const matchesActive = !showActiveOnly || user.is_active;

    return matchesSearch && matchesCity && matchesActive;
  });

  const columns = [
    {
      key: "user_id",
      header: "User ID",
      render: (user: User) => (
        <span className="font-mono text-sm text-gray-600">{user.user_id}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (user: User) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (user: User) => (
        <span className="text-gray-600">{user.phone || "-"}</span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (user: User) => (
        <span className="text-gray-600">{user.city || "-"}</span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (user: User) => (
        <ToggleSwitch
          checked={user.is_active}
          onChange={(checked) => handleToggleActive(user.user_id, checked)}
          disabled={!canUpdate}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          {canUpdate ? (
            <button
              onClick={() => handleOpenModal(user)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleOpenModal(user)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(user.user_id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: "100px",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage users and their information
          </p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsBulkModalOpen(true)}
              variant="outline"
              icon={<Upload className="w-5 h-5" />}
            >
              Bulk Upload
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
            >
              Add User
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by name, email, or ID..."
                icon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              options={[
                { value: "", label: "All Cities" },
                ...cities.map((city) => ({ value: city, label: city })),
              ]}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            />
            <div className="flex items-center">
              <ToggleSwitch
                checked={showActiveOnly}
                onChange={setShowActiveOnly}
                label="Active Only"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          data={filteredUsers}
          columns={columns}
          emptyMessage="No users found"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Create New User"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canUpdate && !!editingUser}
            >
              {editingUser ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={!canUpdate && !!editingUser}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            disabled={!canUpdate && !!editingUser}
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            disabled={!canUpdate && !!editingUser}
          />
          <Select
            label="City"
            options={[
              { value: "", label: "Select City" },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!canUpdate && !!editingUser}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <ToggleSwitch
              checked={formData.is_active}
              onChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
              label={formData.is_active ? "Active" : "Inactive"}
              disabled={!canUpdate && !!editingUser}
            />
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Upload Users"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkUpload}>
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={bulkType === "json" ? "primary" : "outline"}
              onClick={() => setBulkType("json")}
              icon={<FileJson className="w-4 h-4" />}
              size="sm"
            >
              JSON
            </Button>
            <Button
              variant={bulkType === "csv" ? "primary" : "outline"}
              onClick={() => setBulkType("csv")}
              icon={<FileText className="w-4 h-4" />}
              size="sm"
            >
              CSV
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your {bulkType.toUpperCase()} data
            </label>
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={
                bulkType === "json"
                  ? '{\n  "users": [\n    {\n      "user_id": "12345",\n      "name": "Amit",\n      "email": "amit@test.com",\n      "city": "Delhi"\n    }\n  ]\n}'
                  : "user_id,name,email,phone,city,is_active\n12345,Amit,amit@test.com,9999999999,Delhi,true"
              }
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
