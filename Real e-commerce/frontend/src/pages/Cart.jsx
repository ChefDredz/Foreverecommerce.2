import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import CartTotal from '../components/CartTotal'
import './Cart.css'

const Cart = () => {

  const {products , currency, cartItems, updateQuantity, navigate} = useContext(ShopContext)

  const [cartData, setCartdata] = useState([])

  useEffect(() => {

    const tempData = []
    for(const items in cartItems){
      for(const item in cartItems[items]){
        if (cartItems[items][item] > 0) {
          tempData.push({
            _id: items,
            size:item,
            quantity:cartItems[items][item]
          })
        }
      }
    }
    setCartdata(tempData)

  },[cartItems])
  return (
    <div className='cart-container'>
      <div >
        <Title text1={'YOUR'} text2={'CART'}/>
      </div>

      <div>
        {
          cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id)

            return(
              <div key={index} className="cart-item-holder">
                <div className="cart-box">
                  <img className='cart-item-img' src={productData.image[0]} alt="" />
                  <div className="mini-cart-text-holder">
                    <p className="cart-text">{productData.name}</p>
                    <div className="cart-price">
                      <p id='cart-price'>{currency}{productData.price}</p>
                      <p id='cart-item-size'>{item.size}</p>
                    </div>
                  </div>
                </div>
                <input onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id,item.size, Number(e.target.value))} className='cart-input' type="number" min={1} defaultValue={item.quantity} />
                <img onClick={()=>updateQuantity(item._id,item.size, 0)} id='cart-bin-icon' src={assets.bin_icon} alt="" />

              </div>
            )
          })
        }
      </div>

      <div className="cart-total-section">
        <div className="cart-section-container">
          <CartTotal/>
          <button onClick={()=>navigate('/place-order') } id="check-out-btn">PROCEED TO CHECK OUT</button>
        </div>
      </div>



    </div>
  )
}

export default Cart