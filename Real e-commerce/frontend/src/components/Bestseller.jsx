import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import "./BestSeller.css";

const ProductCard = ({ id, image, name, price }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/product/${id}`} className="product-card-link">
      <div
        className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-card-image-wrapper">
          <img
            src={image[0]}
            alt={name}
            className={`product-card-image ${isHovered ? 'hovered' : ''}`}
          />
          <div className={`product-card-overlay ${isHovered ? 'visible' : ''}`}>
            <div className="product-card-info">
              <h3 className="product-card-title">{name}</h3>
              <p className="product-card-price">${price}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ProductRow = ({ title, products }) => {
  return (
    <div className="product-row">
      <h2 className="product-row-title">{title}</h2>
      <div className="product-grid">
        {products.map((item) => (
          <ProductCard
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

const Bestseller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      // Best Sellers - first 6 products
      setBestSeller(products.slice(0, 6));
      
      // Trending - next 6 products (or duplicate if not enough)
      setTrending(products.slice(6, 12).length > 0 ? products.slice(6, 12) : products.slice(0, 6));
      
      // New Arrivals - next 6 products (or duplicate if not enough)
      setNewArrivals(products.slice(12, 18).length > 0 ? products.slice(12, 18) : products.slice(0, 6));
    }
  }, [products]);

  return (
    <div className="bestseller-container">
      <ProductRow title="Best Sellers" products={bestSeller} />
      <ProductRow title="Trending Now" products={trending} />
      <ProductRow title="New Arrivals" products={newArrivals} />
    </div>
  );
};

export default Bestseller;