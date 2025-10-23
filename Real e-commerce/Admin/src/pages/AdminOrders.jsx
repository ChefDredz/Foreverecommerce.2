// admin/src/pages/Orders.jsx (or wherever your orders component is)

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./AdminOrders.css"; // Make sure you have this CSS file

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://foreverecommerce-2.onrender.com";

  // ✅ Fetch orders WITHOUT authentication (for now)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("📦 Fetching orders from:", `${backendUrl}/api/orders/all`);
      
      // ✅ Use GET request without auth (for testing)
      const response = await axios.get(`${backendUrl}/api/orders/all`);
      
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
      if (error.response?.status === 404) {
        toast.error("Orders endpoint not found. Check backend.");
      } else if (error.response?.status === 403) {
        toast.error("Not authorized to view orders");
      } else {
        toast.error("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>All Orders</h2>
        <button onClick={fetchOrders} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <h3>No orders yet</h3>
          <p>Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-details">
                <h4>Order #{order._id}</h4>
                <p>Customer: {order.customerName}</p>
                <p>Total: KSH {order.total}</p>
                <p>Status: {order.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;