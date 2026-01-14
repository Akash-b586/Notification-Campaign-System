import { Router } from "express";
import {
  createNewsletter,
  getNewsletter,
  getAllNewsletters,
  updateNewsletter,
  deleteNewsletter,
  publishNewsletter,
  getNewsletterSubscribers,
  getNewsletterLogs,
} from "../controllers/newsletter.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Public/User routes
router.get("/", getAllNewsletters);

// Admin routes
router.post("/", authorize("ADMIN", "CREATOR"), createNewsletter);
router.get("/:newsletterId", getNewsletter);
router.patch("/:newsletterId", authorize("ADMIN", "CREATOR"), updateNewsletter);
router.delete("/:newsletterId", authorize("ADMIN"), deleteNewsletter);

// Newsletter publishing
router.post("/:newsletterId/publish", authorize("ADMIN", "CREATOR"), publishNewsletter);

// Newsletter subscribers and logs
router.get("/:newsletterId/subscribers", authorize("ADMIN", "CREATOR"), getNewsletterSubscribers);
router.get("/:newsletterId/logs", authorize("ADMIN", "CREATOR"), getNewsletterLogs);

export default router;
