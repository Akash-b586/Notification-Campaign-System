import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Bell, Check, X } from "lucide-react";
import { Card, Button, Input, LoadingSpinner, Select, ToggleSwitch } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { preferenceService } from "../../services/api";
import type { NotificationPreference, NotificationType } from "../../types";

const PHONE_REGEX = /^(\+91[-\s]?)?[0-9]{10}$/;

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  city: string;
  isActive: boolean;
}

const cities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
];

const notificationTypes: NotificationType[] = ["OFFERS", "ORDER_UPDATES"];

export const StaffProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    city: "",
    isActive: true,
  });
  const [preferences, setPreferences] = useState<{ [key in NotificationType]?: NotificationPreference }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">("profile");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const profileData = await preferenceService.getProfile();
      setFormData({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: profileData.city || "",
        isActive: profileData.isActive,
      });

      // Fetch preferences for each notification type
      const prefs: { [key in NotificationType]?: NotificationPreference } = {};
      for (const type of notificationTypes) {
        try {
          const pref = await preferenceService.getNotificationPreferences(type);
          prefs[type] = pref;
        } catch (err) {
          // Preference might not exist, that's ok
        }
      }
      setPreferences(prefs);
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate phone number
    if (name === "phone") {
      if (value && !PHONE_REGEX.test(value)) {
        setPhoneError("Phone must be a valid 10-digit number (with optional +91 prefix)");
      } else {
        setPhoneError("");
      }
    }
    
    setError("");
    setSuccess("");
  };

  const handlePreferenceChange = (
    notificationType: NotificationType,
    channel: "email" | "sms" | "push",
    checked: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [notificationType]: {
        ...(prev[notificationType] || {
          id: "",
          userId: user?.userId || "",
          notificationType,
          email: false,
          sms: false,
          push: false,
          updatedAt: new Date().toISOString(),
        }),
        [channel]: checked,
      },
    }));
    setError("");
    setSuccess("");
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSaving(true);
    try {
      await preferenceService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
      });
      setSuccess("Profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      for (const [type, pref] of Object.entries(preferences)) {
        if (pref) {
          await preferenceService.updateNotificationPreferences(type as NotificationType, {
            email: pref.email,
            sms: pref.sms,
            push: pref.push,
          });
        }
      }
      setSuccess("Preferences updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
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

  const getPreference = (type: NotificationType) =>
    preferences[type] || {
      email: false,
      sms: false,
      push: false,
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and notification preferences</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Settings
          </div>
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "preferences"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </div>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (Cannot be changed)
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {formData.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email is used for login and cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleProfileChange}
                placeholder="Enter your phone number (10 digits or +91XXXXXXXXXX)"
                icon={<Phone className="w-4 h-4" />}
              />
              {formData.phone && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    {PHONE_REGEX.test(formData.phone) ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Valid phone number</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">{phoneError}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <Select
                name="city"
                value={formData.city}
                onChange={handleProfileChange}
                options={[
                  { value: "", label: "Select a city" },
                  ...cities.map((city) => ({ value: city, label: city })),
                ]}
              />
            </div>

            {/* Account Status */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Account Status</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.isActive ? "Your account is active" : "Your account is inactive"}
                  </p>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {formData.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => fetchData()}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                isLoading={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          {notificationTypes.map((type) => {
            const pref = getPreference(type);
            const typeLabel = type === "OFFERS" ? "Special Offers" : "Order Updates";

            return (
              <Card key={type}>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{typeLabel}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose how you want to receive {typeLabel.toLowerCase()}
                    </p>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    {/* Email */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email</p>
                          <p className="text-xs text-gray-500">Receive via email</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={pref.email}
                        onChange={(checked) => handlePreferenceChange(type, "email", checked)}
                      />
                    </div>

                    {/* SMS */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">SMS</p>
                          <p className="text-xs text-gray-500">Receive via text message</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={pref.sms}
                        onChange={(checked) => handlePreferenceChange(type, "sms", checked)}
                      />
                    </div>

                    {/* Push */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Push Notification</p>
                          <p className="text-xs text-gray-500">Receive in-app notifications</p>
                        </div>
                      </div>
                      <ToggleSwitch
                        checked={pref.push}
                        onChange={(checked) => handlePreferenceChange(type, "push", checked)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fetchData()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePreferences}
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
