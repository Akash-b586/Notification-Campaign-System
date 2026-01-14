import { Router } from "express";
import { 
  createUser,
  getAllUsers,
} from "../controllers/user.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Only ADMIN can create staff members
router.post("/", authorize("ADMIN"), (req: any, res: any) => {
  // Set role to ADMIN or CREATOR based on request
  const { role } = req.body;
  if (role && (role === 'ADMIN' || role === 'CREATOR'|| role === 'VIEWER')) {
    createUser(req, res);
  } else {
    res.status(400).json({ message: "Staff must have ADMIN or CREATOR Or VIEWER role" });
  }
});

// Only ADMIN can view all staff members
router.get("/", authorize("ADMIN"), getAllUsers);

export default router;
