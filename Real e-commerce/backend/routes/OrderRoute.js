// backend/routes/OrderRoute.js

import express from "express";
import adminAuth from "../middleware/requireAdmin.js";
import Order from "../models/OrderModel.js";

const orderRouter = express.Router();

// ✅ Health check - MUST BE FIRST
orderRouter.get("/health", (req, res) => {
  console.log("✅ Orders health check");
  res.json({
    success: true,
    message: "Order routes are working! 🎉",
    endpoints: {
      admin: [
        "GET /api/orders/all",
        "GET /api/orders/:id",
        "POST /api/orders/status"
      ],
      client: [
        "POST /api/orders/create"
      ]
    }
  });
});

// ✅ CREATE ORDER - Client endpoint
orderRouter.post("/create", async (req, res) => {
  try {
    console.log("📦 Creating new order");
    console.log("📝 Order data received:", req.body);
    
    const { products, totalAmount, paymentMethod, deliveryInfo } = req.body;
    
    // Validate required fields
    if (!products || !totalAmount || !deliveryInfo) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: products, totalAmount, or deliveryInfo"
      });
    }

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products must be a non-empty array"
      });
    }

    // Format items for order model
    const formattedItems = products.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || "N/A",
      image: item.image || ""
    }));

    // Create new order in database
    const newOrder = new Order({
      userId: "guest_" + Date.now(), // TODO: Replace with actual user ID from auth
      customerName: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
      email: deliveryInfo.email,
      phone: deliveryInfo.phone,
      address: {
        street: deliveryInfo.street,
        city: deliveryInfo.city,
        state: deliveryInfo.state || "",
        zipcode: deliveryInfo.zipcode || "",
        country: deliveryInfo.country || ""
      },
      items: formattedItems,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "Pending" : "Pending",
      status: "Order Received"
    });

    // Save to database
    await newOrder.save();
    
    console.log("✅ Order saved to database:", newOrder._id);
    
    res.json({
      success: true,
      message: "Order placed successfully! We will process it shortly.",
      order: {
        orderId: newOrder._id,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
        paymentMethod: newOrder.paymentMethod,
        createdAt: newOrder.createdAt
      }
    });
    
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order. Please try again.",
      error: error.message
    });
  }
});

// ✅ Get all orders (Admin only)
orderRouter.get("/all", adminAuth, async (req, res) => {
  try {
    console.log("📦 Fetching all orders for admin");
    
    // Fetch all orders from database, sorted by newest first
    const orders = await Order.find({}).sort({ createdAt: -1 });
    
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
    
    // Find order by ID
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    console.log("✅ Order found:", order._id);
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message
    });
  }
});

// ✅ Update order status (Admin only)
orderRouter.post("/status", adminAuth, async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log(`📝 Updating order ${orderId} status to: ${status}`);
    
    // Validate status
    const validStatuses = ["Order Received", "Cargo Packed", "Cargo on Route", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    // Update order status in database
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // Return updated document
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    console.log("✅ Order status updated:", order.status);
    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message
    });
  }
});

// ✅ Get user's orders (Client - with user ID)
orderRouter.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📦 Fetching orders for user:", userId);
    
    // Fetch user's orders, sorted by newest first
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders for user`);
    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

export default orderRouter;