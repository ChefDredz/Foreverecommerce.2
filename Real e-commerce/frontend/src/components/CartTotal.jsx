import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import './CartTotal.css'

const CartTotal = () => {

    const {currency, delivery_fee, getCartAmount} = useContext(ShopContext)





  return (
    <div className='carttotal-container'>
        <div className="title-box">
            <Title text1={'CART'} text2={'TOTAL'}/>
        </div>
        <div className="cart-total-mini">
            <div className="sub-total">
                <p>SubTotal</p>
                <p>{currency}{getCartAmount()}.00</p>
            </div>
            <hr />
            <div className="sub-total">
                <p>Shipping fee</p>
               <p>{currency}{delivery_fee}</p>

            </div>
            <div className="sub-total">
                <b>Total</b>
               <p>{currency}{getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}</p>

            </div>
        </div>
    </div>
  )
}

export default CartTotal