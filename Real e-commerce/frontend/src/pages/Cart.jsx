import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import CartTotal from '../components/CartTotal'
import './Cart.css'

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, loading } = useContext(ShopContext)
  const [cartData, setCartdata] = useState([])
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Wait for products to load
    if (!products || products.length === 0) {
      console.log("⏳ Waiting for products to load...");
      return;
    }

    try {
      const tempData = []
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            // Verify product exists before adding
            const productExists = products.find(p => p._id === items)
            if (productExists) {
              tempData.push({
                _id: items,
                size: item,
                quantity: cartItems[items][item]
              })
            } else {
              console.warn(`⚠️ Product ${items} not found, skipping`);
            }
          }
        }
      }
      console.log("🛒 Cart data:", tempData);
      setCartdata(tempData)
      setIsProcessing(false)
    } catch (error) {
      console.error("❌ Error processing cart:", error)
      setIsProcessing(false)
    }
  }, [cartItems, products])

  // Show loading state
  if (loading || isProcessing) {
    return (
      <div className='cart-container'>
        <div className="title-container">
          <Title text1={'YOUR'} text2={'CART'} />
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Show empty cart message
  if (!cartData || cartData.length === 0) {
    return (
      <div className='cart-container'>
        <div className="title-container">
          <Title text1={'YOUR'} text2={'CART'} />
        </div>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet</p>
          <button 
            onClick={() => navigate('/collection')}
            className="continue-shopping-btn"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='cart-container'>
      <div className="title-container">
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div className="cart-items-wrapper">
        {cartData.map((item, index) => {
          // Find product with safety check
          const productData = products.find((product) => product._id === item._id)

          // Skip if product not found
          if (!productData) {
            console.warn(`⚠️ Product ${item._id} not found in products list`);
            return null;
          }

          // Additional safety checks
          const productImage = productData.image?.[0] || '/placeholder.png'
          const productName = productData.name || 'Unknown Product'
          const productPrice = productData.price || 0

          return (
            <div key={index} className="cart-item-holder">
              <div className="cart-box">
                <img 
                  className='cart-item-img' 
                  src={productImage}
                  alt={productName}
                  onError={(e) => {
                    e.target.src = '/placeholder.png'
                  }}
                />
                <div className="mini-cart-text-holder">
                  <p className="cart-item-name">{productName}</p>
                  <div className="cart-price-size">
                    <p className='cart-price'>
                      {currency}{productPrice.toLocaleString()}
                    </p>
                    <p className='cart-size-badge'>Size: {item.size}</p>
                  </div>
                </div>
              </div>
              
              <div className="cart-quantity-control">
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.size, Math.max(1, item.quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input 
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0) {
                      updateQuantity(item._id, item.size, value);
                    }
                  }} 
                  className='cart-input' 
                  type="number" 
                  min={1} 
                  value={item.quantity}
                  readOnly
                />
                <button 
                  className="qty-btn"
                  onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="cart-item-total">
                <p className="item-total-label">Total</p>
                <p className="item-total-price">
                  {currency}{(productPrice * item.quantity).toLocaleString()}
                </p>
              </div>

              <button 
                onClick={() => updateQuantity(item._id, item.size, 0)} 
                className='cart-remove-btn'
                aria-label="Remove item"
                title="Remove from cart"
              >
                <img 
                  src={assets.bin_icon} 
                  alt="Remove"
                />
              </button>
            </div>
          )
        })}
      </div>

      <div className="cart-bottom-section">
        <div className="cart-total-section">
          <CartTotal />
          <button 
            onClick={() => navigate('/place-order')} 
            className="checkout-btn"
          >
            <span>PROCEED TO CHECKOUT</span>
            <span className="checkout-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart