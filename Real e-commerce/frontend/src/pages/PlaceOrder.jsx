import React, { useContext, useState } from "react";
import { useUser, useAuth, RedirectToSignIn } from "@clerk/clerk-react";
import Title from "../components/Title";
import "./PlaceOrder.css";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/frontend_assets/assets";
import { ShopContext } from "../context/ShopContext";
import { backendUrl } from "../config";

const PlaceOrder = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { cartItems, getCartAmount, delivery_fee, products, navigate, currency } = useContext(ShopContext);

  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  // Delivery information state
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate delivery info
  const validateDeliveryInfo = () => {
    const required = ['firstName', 'lastName', 'email', 'street', 'city', 'phone'];
    for (let field of required) {
      if (!deliveryInfo[field] || deliveryInfo[field].trim() === '') {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  // Submit handler
  const handlePlaceOrder = async () => {
    try {
      // Validate delivery info
      if (!validateDeliveryInfo()) {
        return;
      }

      // Check if cart has items
      if (!cartItems || Object.keys(cartItems).length === 0) {
        alert("Your cart is empty!");
        return;
      }

      setLoading(true);
      const token = await getToken({ template: "MilikiAPI" });
      
      if (!token) {
        alert("⚠️ Could not get authentication token. Please sign in again.");
        setLoading(false);
        return;
      }

      // Format cart items to match your cart structure
      const formattedItems = [];
      
      for (const itemId in cartItems) {
        for (const size in cartItems[itemId]) {
          if (cartItems[itemId][size] > 0) {
            // Find product data from products array
            const productData = products.find(product => product._id === itemId);
            
            if (productData) {
              formattedItems.push({
                productId: itemId,
                name: productData.name,
                price: productData.price,
                quantity: cartItems[itemId][size],
                image: productData.image?.[0],
                size: size
              });
            }
          }
        }
      }

      console.log("📦 Formatted items:", formattedItems);

      // Calculate total amount
      const cartAmount = getCartAmount();
      const totalAmount = cartAmount + delivery_fee;

      console.log("💰 Cart Amount:", cartAmount);
      console.log("🚚 Delivery Fee:", delivery_fee);
      console.log("💵 Total Amount:", totalAmount);

      if (!totalAmount || totalAmount <= 0) {
        alert("⚠️ Cart total is invalid. Please add items to your cart.");
        setLoading(false);
        return;
      }

      const orderData = {
        products: formattedItems,
        totalAmount: totalAmount,
        paymentMethod: method,
        deliveryInfo: deliveryInfo
      };

      console.log("📤 Sending order data:", orderData);

      const res = await fetch(`${backendUrl}/api/orders/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      console.log("📦 Order response:", data);

      if (data.success) {
        alert("✅ Order placed successfully!");
        navigate("/Orders1");
      } else {
        alert("❌ Order placement failed: " + (data.message || "Unknown error"));
        console.error("❌ Server error details:", data);
      }
    } catch (error) {
      console.error("❌ Order placement error:", error);
      alert("⚠️ Something went wrong while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="place-holder-container">
      {/* LEFT SIDE – Delivery info */}
      <div className="delivery-info">
        <div className="title-box-delivery">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="row-deliver">
          <input 
            type="text" 
            name="firstName"
            placeholder="First Name" 
            value={deliveryInfo.firstName}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            name="lastName"
            placeholder="Last Name" 
            value={deliveryInfo.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <input 
          id="long-input" 
          type="email" 
          name="email"
          placeholder="E-mail" 
          value={deliveryInfo.email}
          onChange={handleInputChange}
          required
        />
        <input 
          id="long-input" 
          type="text" 
          name="street"
          placeholder="Street" 
          value={deliveryInfo.street}
          onChange={handleInputChange}
          required
        />
        <div className="row-deliver">
          <input 
            type="text" 
            name="city"
            placeholder="City" 
            value={deliveryInfo.city}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            name="state"
            placeholder="State" 
            value={deliveryInfo.state}
            onChange={handleInputChange}
          />
        </div>
        <div className="row-deliver">
          <input 
            type="text" 
            name="zipcode"
            placeholder="Zipcode" 
            value={deliveryInfo.zipcode}
            onChange={handleInputChange}
          />
          <input 
            type="text" 
            name="country"
            placeholder="Country" 
            value={deliveryInfo.country}
            onChange={handleInputChange}
          />
        </div>
        <input 
          id="long-input" 
          type="tel" 
          name="phone"
          placeholder="Phone Number" 
          value={deliveryInfo.phone}
          onChange={handleInputChange}
          required
        />
      </div>

      {/* RIGHT SIDE – Cart summary and payment */}
      <div className="rightside-cart-total">
        <div className="cart-total-container-placeorder">
          <CartTotal />
        </div>

        {/* PAYMENT METHODS */}
        <div className="payment-section">
          <Title text1={"PAYMENT"} text2={"METHOD"} />
          <div className="payment-container">
            <div
              onClick={() => setMethod("stripe")}
              className={`payment-box ${method === "stripe" ? "selected" : ""}`}
            >
              <img src={assets.stripe_logo} alt="Stripe" />
            </div>

            <div
              onClick={() => setMethod("m-pesa")}
              className={`payment-box ${method === "m-pesa" ? "selected" : ""}`}
            >
              <img src={assets.razorpay_logo} alt="M-Pesa" />
            </div>

            <div
              onClick={() => setMethod("cod")}
              className={`payment-box ${method === "cod" ? "selected" : ""}`}
            >
              <p>CASH ON DELIVERY</p>
            </div>
          </div>

          <button
            id="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;