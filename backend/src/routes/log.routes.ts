import { Router } from "express";
import { getNotificationLogs } from "../controllers/log.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.get("/", authorize(), getNotificationLogs);

export default router;
