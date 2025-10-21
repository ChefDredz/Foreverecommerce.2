// backend/routes/OrderRoute.js
import express from "express";
import { verifyClerkToken } from "../middleware/verifyClerkToken.js";
import { 
  createOrder, 
  getAllOrders, 
  updateOrderStatus, 
  getUserOrders,
  updatePaymentStatus,
  cancelOrder
} from "../controllers/OrderController.js";

const router = express.Router();

// Create new order
router.post("/create", verifyClerkToken, createOrder);

// Get user's own orders
router.get("/user", verifyClerkToken, getUserOrders);

// Get all orders (admin)
router.get("/all", verifyClerkToken, getAllOrders);

// Cancel order (user)
router.put("/:id/cancel", verifyClerkToken, cancelOrder);

// Update order status (admin)
router.put("/:id/status", verifyClerkToken, updateOrderStatus);

// Update payment status (admin)
router.put("/:id/payment", verifyClerkToken, updatePaymentStatus);

export default router;