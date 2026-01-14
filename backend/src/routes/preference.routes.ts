import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  getAllNotificationPreferences,
  getNewsletterSubscriptions,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getAllUsersWithPreferences,
  updateUserNotificationPreference,
} from "../controllers/preference.controller";
import { authorize } from "../middleware/authorize.middleware";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// User profile
router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser, updateProfile);

// Notification preferences for specific type (OFFERS, ORDER_UPDATES)
router.get("/notification-preferences/:notificationType", authenticateUser, getNotificationPreferences);
router.put("/notification-preferences/:notificationType", authenticateUser, updateNotificationPreferences);
router.get("/notification-preferences", authenticateUser, getAllNotificationPreferences);

// Newsletter subscriptions
router.get("/newsletters", authenticateUser, getNewsletterSubscriptions);
router.post("/newsletters/:newsletterId/subscribe", authenticateUser, subscribeToNewsletter);
router.delete("/newsletters/:newsletterId/unsubscribe", authenticateUser, unsubscribeFromNewsletter);

// Admin routes
router.get("/admin/users-preferences", authorize("ADMIN", "CREATOR"), getAllUsersWithPreferences);
router.patch("/admin/users/:userId/notification-preferences/:notificationType", authorize("ADMIN", "CREATOR"), updateUserNotificationPreference);

export default router;
