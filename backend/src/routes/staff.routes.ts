import { Router } from "express";
import { systemUserSignup } from "../controllers/auth.controller";
import { getAllStaff } from "../controllers/staff.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Only ADMIN can create staff members (reusing systemUserSignup from auth)
router.post("/", authorize("ADMIN"), systemUserSignup);

// Only ADMIN can view all staff members
router.get("/", authorize("ADMIN"), getAllStaff);

export default router;
