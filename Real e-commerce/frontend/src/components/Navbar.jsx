import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/frontend_assets/assets';
import { Link, NavLink } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import { backendUrl } from '../config';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  // Check if user has orders
  useEffect(() => {
    const checkUserOrders = async () => {
      if (!isSignedIn) {
        setHasOrders(false);
        setOrdersCount(0);
        return;
      }

      try {
        const token = await getToken({ template: 'MilikiAPI' });
        const response = await fetch(`${backendUrl}/api/orders/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.orders && data.orders.length > 0) {
            setHasOrders(true);
            setOrdersCount(data.orders.length);
          } else {
            setHasOrders(false);
            setOrdersCount(0);
          }
        }
      } catch (error) {
        console.error('Error checking orders:', error);
        setHasOrders(false);
      }
    };

    checkUserOrders();
    
    // Check every 30 seconds for new orders
    const interval = setInterval(checkUserOrders, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return (
    <div className="navbar-container">
      <div className="flex items-center justify-between py-5 font-medium">
        <Link to="/">
          <img src={assets.logo} className="w-36" alt="Logo" />
        </Link>

        <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
          <NavLink to="/" className="flex flex-col items-center gap-1">
            <p>HOME</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
          <NavLink to="/collection" className="flex flex-col items-center gap-1">
            <p>COLLECTION</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
          <NavLink to="/about" className="flex flex-col items-center gap-1">
            <p>ABOUT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>
          <NavLink to="/contact" className="flex flex-col items-center gap-1">
            <p>CONTACT</p>
            <hr className="w-2/4 border-none h-[1.5px] bg-gray-700 hidden" />
          </NavLink>

          {/* Dynamic Orders Button - Only shows if user has orders */}
          {hasOrders && (
            <NavLink to="/Orders1" className="flex flex-col items-center gap-1 orders-nav-link">
              <div style={{ position: 'relative' }}>
                <p style={{ 
                  color: '#667eea', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📦 MY ORDERS
                </p>
                {ordersCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-12px',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.4)'
                  }}>
                    {ordersCount}
                  </span>
                )}
              </div>
              <hr className="w-2/4 border-none h-[1.5px] bg-blue-600 hidden" />
            </NavLink>
          )}
        </ul>

        <div className="flex items-center gap-6">
          <img
            onClick={() => setShowSearch(true)}
            src={assets.search_icon}
            className="w-5 cursor-pointer"
            alt="Search"
          />

          <div className="group relative">
            <SignedOut>
              <SignInButton mode="modal">
                <img className="w-5 cursor-pointer" src={assets.profile_icon} alt="Profile" />
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          <Link to="/cart" className="relative">
            <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {getCartCount()}
            </p>
          </Link>

          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer sm:hidden"
            alt="Menu"
          />
        </div>

        {/* Sidebar menu for small screen */}
        <div
          className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${
            visible ? 'w-full' : 'w-0'
          }`}
        >
          <div className="flex flex-col text-gray-600">
            <div
              onClick={() => setVisible(false)}
              className="flex items-center gap-4 p-3 cursor-pointer"
            >
              <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="Back" />
              <p>Back</p>
            </div>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/"
            >
              HOME
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/collection"
            >
              COLLECTION
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/about"
            >
              ABOUT
            </NavLink>
            <NavLink
              onClick={() => setVisible(false)}
              className="py-2 pl-6 border"
              to="/contact"
            >
              CONTACT
            </NavLink>

            {/* Mobile Orders Link */}
            {hasOrders && (
              <NavLink
                onClick={() => setVisible(false)}
                className="py-2 pl-6 border"
                to="/Orders1"
                style={{
                  background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)',
                  color: '#667eea',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📦 MY ORDERS</span>
                  {ordersCount > 0 && (
                    <span style={{
                      background: '#ff6b6b',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginRight: '12px'
                    }}>
                      {ordersCount}
                    </span>
                  )}
                </div>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          padding: 0 20px;
        }

        .orders-nav-link:hover p {
          color: #5568d3 !important;
        }

        .orders-nav-link.active hr {
          display: block !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .orders-nav-link span[style*="position: absolute"] {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Navbar;