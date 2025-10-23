// admin/src/pages/AdminOrders.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://foreverecommerce-2.onrender.com";

  // ✅ Fetch orders WITH authentication
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("📦 Fetching orders from:", `${backendUrl}/api/orders/all`);
      
      // ✅ Get Clerk token
      const token = await getToken({ template: "MilikiAPI" });
      
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      console.log("🔑 Token obtained for orders request");
      
      // ✅ Use GET request WITH auth token
      const response = await axios.get(`${backendUrl}/api/orders/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("✅ Orders response:", response.data);
      
      if (response.data.success) {
        setOrders(response.data.orders || []);
        toast.success(`Loaded ${response.data.orders?.length || 0} orders`);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      
      // Better error messages
      if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 404) {
        toast.error("Orders endpoint not found");
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = await getToken({ template: "MilikiAPI" });
      
      const response = await axios.post(
        `${backendUrl}/api/orders/status`,
        { orderId, status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Order status updated");
        fetchOrders(); // Refresh orders
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === "All" || order.status === statusFilter;
    const paymentMatch = paymentFilter === "All" || order.paymentStatus === paymentFilter;
    return statusMatch && paymentMatch;
  });

  // Get unique statuses for filter
  const statuses = ["All", ...new Set(orders.map(o => o.status))];
  const paymentStatuses = ["All", "Paid", "Pending", "Failed"];

  if (loading) {
    return (
      <div className="admin-orders-container">
        <div className="admin-orders-loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h2>📦 All Orders</h2>
        <button onClick={fetchOrders} className="refresh-btn">
          🔄 Refresh Orders
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Order Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Status:</label>
          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="orders-count">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <h3>📭 No orders yet</h3>
          <p>Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => {
            const getStatusStep = (status) => {
              const steps = ["Order Received", "Cargo Packed", "Cargo on Route", "Delivered"];
              return steps.indexOf(status) + 1;
            };

            const currentStep = getStatusStep(order.status);

            return (
              <div key={order._id} className="order-card">
                {/* Order Header */}
                <div className="order-card-header">
                  <div className="order-id">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="customer-info">
                  <h4>👤 {order.customerName || "Customer"}</h4>
                  <p>📧 {order.email || "No email"}</p>
                  <p>📞 {order.phone || "No phone"}</p>
                  <p>📍 {order.address?.city || "No address"}, {order.address?.country || ""}</p>
                </div>

                {/* Order Items */}
                <div className="order-items">
                  <h5>Items ({order.items?.length || 0}):</h5>
                  {order.items?.slice(0, 2).map((item, index) => (
                    <div key={index} className="order-item">
                      <img 
                        src={item.image || "/placeholder.png"} 
                        alt={item.name}
                      />
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-meta">
                          Qty: {item.quantity} | Size: {item.size || "N/A"}
                        </p>
                        <p className="item-price">
                          KSH {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 2 && (
                    <p style={{fontSize: "12px", color: "#6c757d", marginTop: "8px"}}>
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>

                {/* Order Total */}
                <div className="order-total">
                  <strong>💰 Total: KSH {order.totalAmount?.toLocaleString()}</strong>
                </div>

                {/* Payment Method */}
                <div className="payment-method">
                  Payment: {order.paymentMethod?.toUpperCase() || "COD"}
                </div>

                {/* Payment Status */}
                <div className="status-section">
                  <label>Payment Status:</label>
                  <div className={`payment-badge ${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus || "Pending"}
                  </div>
                </div>

                {/* Visual Stepper */}
                <div className="visual-stepper">
                  <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                    <div className="step-icon">🛒</div>
                    <div className="step-label">Received</div>
                  </div>
                  <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                    <div className="step-icon">📦</div>
                    <div className="step-label">Packed</div>
                  </div>
                  <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                    <div className="step-icon">🚚</div>
                    <div className="step-label">On Route</div>
                  </div>
                  <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
                    <div className="step-icon">✅</div>
                    <div className="step-label">Delivered</div>
                  </div>
                </div>

                {/* Cargo Status Selector */}
                <div className="status-section">
                  <label>Order Status:</label>
                  <select
                    className="cargo-status-select"
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="Order Received">Order Received</option>
                    <option value="Cargo Packed">Cargo Packed</option>
                    <option value="Cargo on Route">Cargo on Route</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;