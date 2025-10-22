// backend/routes/OrderRoute.js

import express from "express";
import adminAuth from "../middleware/requireAdmin.js";

const orderRouter = express.Router();

// ✅ Get all orders (Admin only)
orderRouter.get("/all", adminAuth, async (req, res) => {
  try {
    console.log("📦 Fetching all orders for admin");
    
    // TODO: Replace with actual order model when you have it
    // const orders = await orderModel.find({}).sort({ date: -1 });
    
    // For now, return empty array
    const orders = [];
    
    console.log(`✅ Found ${orders.length} orders`);
    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

// ✅ Get single order by ID (Admin only)
orderRouter.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching order:", id);
    
    // TODO: Replace with actual order model
    // const order = await orderModel.findById(id);
    
    res.json({
      success: true,
      order: null,
      message: "Order endpoint placeholder"
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
});

// ✅ Update order status (Admin only)
orderRouter.post("/status", adminAuth, async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log(`📝 Updating order ${orderId} status to: ${status}`);
    
    // TODO: Replace with actual order model
    // const order = await orderModel.findByIdAndUpdate(
    //   orderId,
    //   { status },
    //   { new: true }
    // );
    
    res.json({
      success: true,
      message: "Order status updated",
      order: null
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order"
    });
  }
});

// ✅ Health check
orderRouter.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Order routes are working",
    endpoints: {
      admin: [
        "GET /api/orders/all",
        "GET /api/orders/:id",
        "POST /api/orders/status"
      ]
    }
  });
});

export default orderRouter;