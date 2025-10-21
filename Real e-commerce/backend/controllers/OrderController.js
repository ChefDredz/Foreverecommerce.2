// backend/controllers/OrderController.js
import Order from "../models/OrderModel.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, paymentMethod, deliveryInfo } = req.body;
    const userId = req.userId;

    console.log("📥 Received order data:", {
      userId,
      productsCount: products?.length,
      totalAmount,
      paymentMethod,
      hasDeliveryInfo: !!deliveryInfo
    });

    if (!products || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Products are required. Please add items to your cart." 
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Total amount is required and must be greater than 0" 
      });
    }

    const invalidProducts = products.filter(p => !p.name || !p.price || !p.quantity);
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: "All products must have name, price, and quantity"
      });
    }

    const paymentStatus = paymentMethod === 'cod' ? 'Pending' : 'Pending'; // All start as Pending

    const newOrder = new Order({
      userId,
      customerName: deliveryInfo?.firstName && deliveryInfo?.lastName 
        ? `${deliveryInfo.firstName} ${deliveryInfo.lastName}`
        : "Customer",
      email: deliveryInfo?.email || "",
      phone: deliveryInfo?.phone || "",
      address: {
        street: deliveryInfo?.street || "",
        city: deliveryInfo?.city || "",
        state: deliveryInfo?.state || "",
        zipcode: deliveryInfo?.zipcode || "",
        country: deliveryInfo?.country || ""
      },
      items: products.map(p => ({
        productId: p.productId || p._id,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        size: p.size,
        image: p.image
      })),
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus,
      status: "Order Received"
    });

    await newOrder.save();
    console.log("✅ Order created successfully:", newOrder._id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

// Get all orders - NO ADMIN CHECK (You can add it back later)
export const getAllOrders = async (req, res) => {
  try {
    console.log("📋 Fetching all orders for admin...");
    
    const orders = await Order.find({}).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${orders.length} orders`);

    res.json({
      success: true,
      orders,
      totalOrders: orders.length
    });

  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// Get user's own orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
      error: error.message
    });
  }
};

// Update order status - NO ADMIN CHECK
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Order Received", "Cargo Packed", "Cargo on Route", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log(`✅ Order ${id} status updated to: ${status}`);

    res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

// Update payment status - NO ADMIN CHECK
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validPaymentStatuses = ["Paid", "Pending", "Failed"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(", ")}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    console.log(`✅ Order ${id} payment status updated to: ${paymentStatus}`);

    res.json({
      success: true,
      message: "Payment status updated successfully",
      order
    });

  } catch (error) {
    console.error("❌ Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Only allow cancellation if order hasn't been delivered
    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel delivered orders"
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    console.log(`✅ Order ${id} cancelled by user`);

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message
    });
  }
};

// Check if user has orders
export const checkUserHasOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await Order.countDocuments({ userId });

    res.json({
      success: true,
      hasOrders: count > 0,
      orderCount: count
    });

  } catch (error) {
    console.error("❌ Check orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check orders"
    });
  }
};