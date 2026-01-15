import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();

// Public route - anyone can view products
router.get("/", getAllProducts);
router.get("/:productId", getProduct);

// Admin only - manage products
router.post("/", authenticate, authorize("ADMIN", "CREATOR"), createProduct);
router.patch("/:productId", authenticate, authorize("ADMIN", "CREATOR"), updateProduct);
router.delete("/:productId", authenticate, authorize("ADMIN"), deleteProduct);

export default router;
