import React from 'react'
import { assets } from '../assets/frontend_assets/assets'
import './Hero.css'
const Hero = () => {
  return (
    <div className='hero-container'>
        <div className="left-hero">
            <h1 className='prata-regular'>Welcome to Our Store</h1>
            <p className='prata-regular'>Discover the best products at unbeatable prices. Shop now and experience the difference!</p>
            <button className='bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition'>Shop Now</button>
        </div>
        <div className="right-hero">
            <img src={assets.hero_img} alt="Hero" className='hero-img'/>
        </div>



    </div>
  )
}

export default Hero