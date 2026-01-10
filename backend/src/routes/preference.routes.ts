import { Router } from "express";
import {
  getPreferences,
  updatePreferences
} from "../controllers/preference.controller";

const router = Router();

router.get("/me/preferences", getPreferences);
router.put("/me/preferences", updatePreferences);

export default router;
