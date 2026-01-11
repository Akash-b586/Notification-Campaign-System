import { Router } from "express";
import {
  getPreferences,
  updatePreferences,
  getAllUsersWithPreferences,
  updateUserPreference
} from "../controllers/preference.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// User's own preferences
router.get("/preferences", getPreferences);
router.put("/preferences", updatePreferences);

// Admin routes to manage all users' preferences
router.get("/admin/preferences", authorize("ADMIN", "CREATOR"), getAllUsersWithPreferences);
router.patch("/admin/preferences/:userId", authorize("ADMIN", "CREATOR"), updateUserPreference);

export default router;
