import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import CartTotal from '../components/CartTotal'
import './Cart.css'

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, loading } = useContext(ShopContext)
  const [cartData, setCartdata] = useState([])

  useEffect(() => {
    // ✅ Only process cart items if products are loaded
    if (!products || products.length === 0) {
      console.log("⏳ Waiting for products to load...");
      return;
    }

    const tempData = []
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size: item,
            quantity: cartItems[items][item]
          })
        }
      }
    }
    console.log("🛒 Cart data:", tempData);
    setCartdata(tempData)
  }, [cartItems, products]) // ✅ Added products as dependency

  // ✅ Show loading state while products are loading
  if (loading) {
    return (
      <div className='cart-container'>
        <Title text1={'YOUR'} text2={'CART'} />
        <p style={{ padding: "40px", textAlign: "center" }}>Loading cart...</p>
      </div>
    )
  }

  // ✅ Show empty cart message if no items
  if (!cartData || cartData.length === 0) {
    return (
      <div className='cart-container'>
        <Title text1={'YOUR'} text2={'CART'} />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "18px", marginBottom: "20px" }}>Your cart is empty</p>
          <button 
            onClick={() => navigate('/collection')}
            style={{
              padding: "12px 24px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='cart-container'>
      <div>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.map((item, index) => {
          // ✅ Find product with safety check
          const productData = products.find((product) => product._id === item._id)

          // ✅ Skip if product not found (might have been deleted)
          if (!productData) {
            console.warn(`⚠️ Product ${item._id} not found in products list`);
            return null;
          }

          // ✅ Additional safety checks for product data
          if (!productData.image || productData.image.length === 0) {
            console.warn(`⚠️ Product ${productData.name} has no images`);
            return null;
          }

          return (
            <div key={index} className="cart-item-holder">
              <div className="cart-box">
                <img 
                  className='cart-item-img' 
                  src={productData.image[0]} 
                  alt={productData.name || "Product"}
                  onError={(e) => {
                    e.target.src = "/placeholder.png"; // Fallback image
                  }}
                />
                <div className="mini-cart-text-holder">
                  <p className="cart-text">{productData.name || "Product"}</p>
                  <div className="cart-price">
                    <p id='cart-price'>
                      {currency}{productData.price ? productData.price.toLocaleString() : "0"}
                    </p>
                    <p id='cart-item-size'>{item.size}</p>
                  </div>
                </div>
              </div>
              <input 
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '0') {
                    return;
                  }
                  updateQuantity(item._id, item.size, Number(value));
                }} 
                className='cart-input' 
                type="number" 
                min={1} 
                defaultValue={item.quantity} 
              />
              <img 
                onClick={() => updateQuantity(item._id, item.size, 0)} 
                id='cart-bin-icon' 
                src={assets.bin_icon} 
                alt="Remove item"
                style={{ cursor: "pointer" }}
              />
            </div>
          )
        })}
      </div>

      <div className="cart-total-section">
        <div className="cart-section-container">
          <CartTotal />
          <button 
            onClick={() => navigate('/place-order')} 
            id="check-out-btn"
          >
            PROCEED TO CHECK OUT
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart