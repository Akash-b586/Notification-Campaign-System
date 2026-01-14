import React, { useState, useEffect } from "react";
import { Mail, Bell, Smartphone, Check } from "lucide-react";
import { Button, Card, ToggleSwitch, LoadingSpinner } from "../../components/ui";
import { newsletterService, preferenceService } from "../../services/api";
import type { Newsletter, NewsletterSubscription } from "../../types";

export const UserNewsletterSubscriptions: React.FC = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    Record<string, NewsletterSubscription>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [newslettersData, subscriptionsData] = await Promise.all([
        newsletterService.list(),
        preferenceService.getNewsletterSubscriptions(),
      ]);
      setNewsletters(newslettersData.filter((n: Newsletter) => n.isActive));
      
      // Convert subscriptions array to object keyed by newsletterId
      const subsMap: Record<string, NewsletterSubscription> = {};
      subscriptionsData.forEach((sub: NewsletterSubscription) => {
        subsMap[sub.newsletterId] = sub;
      });
      setSubscriptions(subsMap);
    } catch (err: any) {
      setError(err.message || "Failed to load newsletters");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSubscription = async (
    newsletterId: string,
    channel: "email" | "sms" | "push"
  ) => {
    const subscription = subscriptions[newsletterId];
    const isCurrentlySubscribed = subscription && subscription[channel];

    setIsSaving(true);
    try {
      if (!subscription) {
        // First time subscribing - create subscription with this channel enabled
        const newSubscriptionData: Record<string, boolean> = {
          email: channel === "email",
          sms: channel === "sms",
          push: channel === "push",
        };
        await preferenceService.subscribeToNewsletter(
          newsletterId,
          newSubscriptionData
        );
      } else {
        // Update existing subscription
        await preferenceService.subscribeToNewsletter(newsletterId, {
          [channel]: !isCurrentlySubscribed,
        });
      }

      // Update local state
      const updatedSubscriptions = { ...subscriptions };
      if (!updatedSubscriptions[newsletterId]) {
        updatedSubscriptions[newsletterId] = {
          id: "",
          userId: "",
          newsletterId,
          email: channel === "email",
          sms: channel === "sms",
          push: channel === "push",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        updatedSubscriptions[newsletterId] = {
          ...updatedSubscriptions[newsletterId],
          [channel]: !isCurrentlySubscribed,
        };
      }
      setSubscriptions(updatedSubscriptions);

      setSuccessMessage("Subscription updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update subscription");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribe = async (newsletterId: string) => {
    setIsSaving(true);
    try {
      await preferenceService.unsubscribeFromNewsletter(newsletterId);
      const updatedSubscriptions = { ...subscriptions };
      delete updatedSubscriptions[newsletterId];
      setSubscriptions(updatedSubscriptions);
      setSuccessMessage("Unsubscribed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe");
    } finally {
      setIsSaving(false);
    }
  };

  const isSubscribed = (newsletterId: string) => {
    const sub = subscriptions[newsletterId];
    return sub && (sub.email || sub.sms || sub.push);
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscriptions</h1>
        <p className="text-gray-600 mt-1">
          Subscribe to newsletters and choose how you want to receive updates
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Newsletters Grid */}
      {newsletters.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">No active newsletters available at the moment.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {newsletters.map((newsletter) => {
            const subscription = subscriptions[newsletter.id];
            const isSubbed = isSubscribed(newsletter.id);

            return (
              <Card key={newsletter.id} className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {newsletter.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {newsletter.description || "Stay updated with our latest news"}
                    </p>
                  </div>
                  {isSubbed && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Subscribed
                      </span>
                    </div>
                  )}
                </div>

                {/* Channel Preferences */}
                <div className="space-y-3 mb-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Email</span>
                    </div>
                    <ToggleSwitch
                      checked={subscription?.email || false}
                      onChange={() =>
                        handleToggleSubscription(newsletter.id, "email")
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">SMS</span>
                    </div>
                    <ToggleSwitch
                      checked={subscription?.sms || false}
                      onChange={() =>
                        handleToggleSubscription(newsletter.id, "sms")
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Push Notification</span>
                    </div>
                    <ToggleSwitch
                      checked={subscription?.push || false}
                      onChange={() =>
                        handleToggleSubscription(newsletter.id, "push")
                      }
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {/* Unsubscribe Button */}
                {isSubbed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnsubscribe(newsletter.id)}
                    disabled={isSaving}
                    className="w-full text-red-600 hover:text-red-700"
                  >
                    Unsubscribe
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};