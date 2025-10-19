import React, { useContext, useState } from "react";
import { assets } from "../assets/frontend_assets/assets";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";
import { ShopContext } from "../context/ShopContext";
import NotificationBell from "./NotificationBell";
const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const { setShowSearch, getCartCount } = useContext(ShopContext);

  return (
    <div className="Navbar">
      <Link to={"/"}>
        <img src={assets.logo} className="w-36" alt="" />
      </Link>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1 ">
          <li>HOME</li>
          <hr className="w-2.5 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1 ">
          <li>COLLECTION</li>
          <hr className="w-2.5 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <li>ABOUT</li>
          <hr className="w-2.4 border-none h-[1.5px] bg-gray- hidden" />
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1 ">
          <li>CONTACT</li>
          <hr className="w-2.5 border-none h-[1.5px] bg-gray-700 hidden" />
        </NavLink>
      </ul>

      <div className="details-section">
        <NotificationBell/>
        
          <img onClick={() => setShowSearch(true)} src={assets.search_icon} className="search" alt="" />
        
        <div className="holder">
          <Link to={"/login1"}><img src={assets.profile_icon} className="profile" alt="" /></Link>
          <div className="hover-list">
            <div className="De-list">
              <p className="cursor-pointer hover:text-black">My Profile</p>
              <p className="cursor-pointer hover:text-black">Orders</p>
              <p className="cursor-pointer hover:text-black">Logout</p>
            </div>
          </div>
        </div>
        <Link to="/cart" className="link-cart">
          <img src={assets.cart_icon} alt="" />
          <p className="cart-log">{getCartCount()}</p>
        </Link>
        <img
          onClick={() => setVisible(true)}
          className="small-menu"
          src={assets.menu_icon}
          alt=""
        />
      </div>
      {/* Mobile Menu */}
      <div className={visible ? "mobile-menu ready" : "mobile-menu"}>
        <img
          onClick={() => setVisible(false)}
          className="close-icon"
          src={assets.dropdown_icon}
          alt=""
        />
        <ul className="flex flex-col gap-5 text-sm text-gray-700">
          <NavLink
            onClick={() => setVisible(false)}
            to="/"
            className="flex flex-col items-center gap-1 "
          >
            <li>HOME</li>
            <hr className="w-2.5 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/collection"
            className="flex flex-col items-center gap-1 "
          >
            <li>COLLECTION</li>
            <hr className="w-2.5 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/about"
            className="flex flex-col items-center gap-1"
          >
            <li>ABOUT</li>
            <hr className="w-2.4 border-none h-[1.5px] bg-gray-" />
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            to="/contact"
            className="flex flex-col items-center gap-1 "
          >
            <li>CONTACT</li>
            <hr className="w-2.5 border-none h-[1.5px] bg-gray-700" />
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
