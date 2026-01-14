import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Upload,
  Trash2,
  Edit,
  Eye,
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
import { userService } from "../../services/api";
import type { User } from "../../types";

const generateRandomPassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const UserManagement: React.FC = () => {
  const { hasPermission } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    is_active: true,
  });

  const [bulkData, setBulkData] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await userService.list();
      // Map backend format to frontend format
      const mappedUsers: User[] = data.map((u: any) => ({
        user_id: u.userId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        city: u.city,
        is_active: u.isActive,
      }));
      setUsers(mappedUsers);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const canCreate = hasPermission("users", "create");
  const canUpdate = hasPermission("users", "update");
  const canDelete = hasPermission("users", "delete");

  const isValidPhone = (phone: string) => {
    if (!phone) return true; // phone is optional
    return /^[6-9]\d{9}$/.test(phone);
  };

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
        password: "",
        phone: user.phone || "",
        city: user.city || "",
        is_active: user.is_active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        city: "",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidPhone(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      if (editingUser) {
        await userService.update(editingUser.user_id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          isActive: formData.is_active,
        });
      } else {
        if (!formData.password) {
          setError("Password is required for new users");
          return;
        }
        await userService.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          city: formData.city,
        });
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    }
  };

  const handleBulkUpload = async () => {
    setError("");
    try {
      let usersArray: any[] = [];

      // CSV parsing (format: user_id,name,email,phone,city,is_active)
      const lines = bulkData.trim().split("\n");
      
      // Validate CSV header
      if (lines.length === 0) {
        throw new Error("CSV file is empty");
      }
      
      const expectedHeader = "user_id,name,email,phone,city,is_active";
      const fileHeader = lines[0].trim().toLowerCase();

      if (fileHeader !== expectedHeader) {
        throw new Error(
          "Invalid CSV format. Expected columns: user_id,name,email,phone,city,is_active"
        );
      }

      // Parse CSV data rows
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines
        const values = line.split(",").map(v => v.trim());
        
        // Validate row has enough columns
        if (values.length < 5) {
          throw new Error(
            `Invalid row ${i}: Expected at least 5 columns, found ${values.length}`
          );
        }
        
        usersArray.push({
          // Skip user_id (values[0]) - will be auto-generated
          name: values[1],
          email: values[2],
          phone: values[3],
          city: values[4],
        });
      }

      for (const user of usersArray) {
        if (!isValidPhone(user.phone)) {
          throw new Error(
            `Invalid phone number for user ${user.name || user.email}`
          );
        }
      }

      const promises = usersArray.map((user) =>
        userService.create({
          name: user.name,
          email: user.email,
          password: user.password || generateRandomPassword(),
          phone: user.phone,
          city: user.city,
        })
      );

      await Promise.all(promises);
      setIsBulkModalOpen(false);
      setBulkData("");
      fetchUsers();
    } catch (err: any) {
      setError(
        err.message || "Invalid data format. Please check and try again."
      );
    }
  };

  const handleCSVFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file");
      return;
    }

    setError("");
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkData(text); // same variable you already use
    };

    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };

    reader.readAsText(file);
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setError("");
      try {
        await userService.delete(userId);
        fetchUsers();
      } catch (err: any) {
        setError(err.message || "Failed to delete user");
      }
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setError("");
    try {
      await userService.update(userId, { isActive });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    }
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

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
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              placeholder="Enter password for new user"
            />
          )}
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, phone: value });
            }}
            maxLength={10}
            placeholder="10-digit mobile number"
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
        onClose={() => {
          setIsBulkModalOpen(false);
          setError("");
          setBulkData("");
        }}
        title="Bulk Upload Users (CSV)"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => {
              setIsBulkModalOpen(false);
              setError("");
              setBulkData("");
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkUpload} disabled={!bulkData}>
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Error Message inside Modal */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV file
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label 
                htmlFor="csv-file-input"
                className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <span className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Choose CSV File
                </span>
                <p className="text-sm text-gray-600 mt-3">
                  or drag and drop your CSV file here
                </p>
              </label>
              
              {bulkData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ File loaded successfully
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {bulkData.split("\n").filter(l => l.trim()).length} rows detected
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  CSV Format:
                </p>
                <p className="text-xs text-blue-800 font-mono">
                  id,name,email,phone,city,is_active
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  A secure random password will be generated for each user
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
