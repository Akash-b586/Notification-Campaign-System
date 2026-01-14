import { Router } from "express";
import {
  createOrder,
  getOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller";
import { authorize } from "../middleware/authorize.middleware";
import { authenticateUser } from "../middleware/auth.middleware";

const router = Router();

// User routes
router.get("/my-orders", authenticateUser, (req: any, res: any) => {
  req.params.userId = req.user.userId;
  getUserOrders(req, res);
});

// Admin routes
router.post("/", authorize("ADMIN", "CREATOR","VIEWER","CUSTOMER"), createOrder);
router.get("/", authorize("ADMIN", "CREATOR"), getAllOrders);
router.get("/:orderId", authorize("ADMIN", "CREATOR"), getOrder);
router.patch("/:orderId/status", authorize("ADMIN", "CREATOR"), updateOrderStatus);
router.delete("/:orderId", authorize("ADMIN"), deleteOrder);

export default router;
