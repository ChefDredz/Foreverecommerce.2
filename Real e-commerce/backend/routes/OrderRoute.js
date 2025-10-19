// backend/routes/OrderRoute.js
import express from "express";
import { verifyClerkToken } from "../middleware/verifyClerkToken.js";
import { 
  createOrder, 
  getAllOrders, 
  updateOrderStatus, 
  getUserOrders,
  updatePaymentStatus
} from "../controllers/OrderController.js";

const router = express.Router();

// Create new order (requires Clerk authentication)
router.post("/create", verifyClerkToken, createOrder);

// Get user's own orders
router.get("/user", verifyClerkToken, getUserOrders);

// Get all orders (admin only - role check happens in controller)
router.get("/all", verifyClerkToken, getAllOrders);

// Update order cargo status (admin only)
router.put("/:id/status", verifyClerkToken, updateOrderStatus);

// Update payment status (admin only)
router.put("/:id/payment", verifyClerkToken, updatePaymentStatus);

export default router;