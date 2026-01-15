import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/ui';
import { staffService } from '../../services/api';

export const AddStaff: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: '', label: 'Select Role' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CREATOR', label: 'Creator' },
    { value: 'VIEWER', label: 'Viewer' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!formData.password.trim()) {
        throw new Error('Password is required');
      }
      if (!formData.role) {
        throw new Error('Role is required');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 8 characters');
      }

      await staffService.create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      setSuccess('Staff member created successfully!');
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create staff member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
            <p className="text-gray-600 mt-1">Create a new staff account with specific role</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter staff member's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used for login credentials
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Enter password (minimum 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters required
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                disabled={isLoading}
                options={roles}
              />
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-600 font-medium">Role Permissions:</p>
                <ul className="text-xs text-gray-500 space-y-1 ml-4">
                  <li>• <span className="font-medium">Admin:</span> Full access to all features including staff management</li>
                  <li>• <span className="font-medium">Creator:</span> Can create, edit, and send campaigns</li>
                  <li>• <span className="font-medium">Viewer:</span> Read-only access to campaigns and logs</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                icon={<UserPlus className="w-4 h-4" />}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Create Staff Member
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Info Card */}
      <Card>
        <div className="p-6 bg-blue-50">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Important Notes</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Staff members can login using their email and password</li>
            <li>• Only Admins can create or manage staff accounts</li>
            <li>• The staff member will have access based on their assigned role</li>
            <li>• Passwords should be shared securely with the new staff member</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
