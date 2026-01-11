import { Router } from "express";
import { getSummaryStats, getActivityStats, getCampaignDistribution, getRecentActivity } from "../controllers/stats.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// All stats routes require authorization (any system user role)
router.get("/summary", authorize("ADMIN", "CREATOR", "VIEWER"), getSummaryStats);
router.get("/activity", authorize("ADMIN", "CREATOR", "VIEWER"), getActivityStats);
router.get("/campaign-distribution", authorize("ADMIN", "CREATOR", "VIEWER"), getCampaignDistribution);
router.get("/recent-activity", authorize("ADMIN", "CREATOR", "VIEWER"), getRecentActivity);

export default router;
