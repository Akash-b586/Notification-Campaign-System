import { Router } from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/user.controller";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

router.get("/", authorize("ADMIN", "CREATOR"), getAllUsers);
router.get("/:userId", authorize("ADMIN", "CREATOR"), getUser);
router.post("/", authorize("ADMIN", "CREATOR"), createUser);
router.patch("/:userId", authorize("ADMIN", "CREATOR"), updateUser);
router.delete("/:userId", authorize("ADMIN"), deleteUser); // Only ADMIN can delete

export default router;
