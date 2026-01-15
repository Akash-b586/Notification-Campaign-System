import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, AlertCircle } from "lucide-react";
import { Card, Button, Input, LoadingSpinner, Select } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { preferenceService } from "../../services/api";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  city: string;
}

const cities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
];


export const UserProfile: React.FC = () => {
  const { user, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = await preferenceService.getProfile();
      setFormData({
         name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: profileData.city || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
     if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    if (!user?.userId) {
      setError("User ID not found");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        city: formData.city || undefined,
      };

      await preferenceService.updateProfile(updateData);
      
      // Update auth store with new user data
      login({
        ...user,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        city: formData.city || undefined,
      });

      setSuccess("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

   if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Profile Card */}
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {formData?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formData?.name}</h2>
              <p className="text-gray-600">{formData?.email}</p>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={<User className="w-5 h-5" />}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  name="email"
                  disabled  
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  icon={<Phone className="w-5 h-5" />}
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 10-digit mobile number
                </p>
              </div>

              {/* City */}
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    City
  </label>
  <Select
    value={formData.city}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        city: e.target.value,
      }))
    }
    options={[
      { value: "", label: "Select City" },
      ...cities.map((city) => ({
        value: city,
        label: city,
      })),
    ]}
  />
</div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Account Info */}
      <Card className="max-w-2xl mx-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">User ID</span>
              <span className="font-medium text-gray-900">{user?.userId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Account Type</span>
              <span className="font-medium text-gray-900">Customer</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Active
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
