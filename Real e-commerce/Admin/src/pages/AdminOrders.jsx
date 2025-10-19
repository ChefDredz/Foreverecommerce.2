import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const { getToken } = useAuth();

  const backendUrl = 'http://localhost:4000';

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "MilikiAPI" });

      const response = await fetch(`${backendUrl}/api/orders/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
        toast.success('Orders loaded successfully');
      } else {
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order cargo status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = await getToken({ template: "MilikiAPI" });

      const response = await fetch(`${backendUrl}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order status updated!');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update order status');
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const token = await getToken({ template: "MilikiAPI" });

      const response = await fetch(`${backendUrl}/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment status updated!');
        fetchOrders(); // Refresh orders
      } else {
        toast.error(data.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Update payment error:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    if (filterStatus !== 'All') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    if (filterPayment !== 'All') {
      filtered = filtered.filter(order => order.paymentStatus === filterPayment);
    }

    setFilteredOrders(filtered);
  }, [orders, filterStatus, filterPayment]);

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="admin-orders-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h2>All Orders</h2>
        <button onClick={fetchOrders} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Cargo Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Order Received">Order Received</option>
            <option value="Cargo Packed">Cargo Packed</option>
            <option value="Cargo on Route">On Route</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Status:</label>
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="orders-count">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
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
                <p>📱 {order.phone || "No phone"}</p>
              </div>

              {/* Order Items */}
              <div className="order-items">
                <h5>Items:</h5>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-meta">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="item-price">KSH {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className="order-total">
                <strong>Total: KSH {order.totalAmount.toLocaleString()}</strong>
              </div>

              {/* Payment Status */}
              <div className="status-section">
                <label>Payment Status:</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                  className={`payment-status-select ${order.paymentStatus.toLowerCase()}`}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
                <span className={`payment-badge ${order.paymentStatus.toLowerCase()}`}>
                  {order.paymentStatus}
                </span>
              </div>

              {/* Cargo Status Stepper */}
              <div className="status-section">
                <label>Cargo Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="cargo-status-select"
                >
                  <option value="Order Received">Order Received</option>
                  <option value="Cargo Packed">Cargo Packed</option>
                  <option value="Cargo on Route">Cargo on Route</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Visual Status Stepper */}
              <div className="visual-stepper">
                <div className={`step ${order.status === "Order Received" || order.status === "Cargo Packed" || order.status === "Cargo on Route" || order.status === "Delivered" ? "active" : ""}`}>
                  <div className="step-icon">📝</div>
                  <div className="step-label">Received</div>
                </div>
                <div className={`step ${order.status === "Cargo Packed" || order.status === "Cargo on Route" || order.status === "Delivered" ? "active" : ""}`}>
                  <div className="step-icon">📦</div>
                  <div className="step-label">Packed</div>
                </div>
                <div className={`step ${order.status === "Cargo on Route" || order.status === "Delivered" ? "active" : ""}`}>
                  <div className="step-icon">🚚</div>
                  <div className="step-label">On Route</div>
                </div>
                <div className={`step ${order.status === "Delivered" ? "active" : ""}`}>
                  <div className="step-icon">✅</div>
                  <div className="step-label">Delivered</div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="payment-method">
                <strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;