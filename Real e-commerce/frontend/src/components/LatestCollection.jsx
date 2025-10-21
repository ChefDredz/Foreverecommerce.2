import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import Title from "./Title";
import "./Latestcollection.css";

const ProductCard = ({ id, image, name, price }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/product/${id}`} className="latest-product-card-link">
      <div
        className="latest-product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="latest-product-card-image-wrapper">
          <img
            src={image[0]}
            alt={name}
            className={`latest-product-card-image ${isHovered ? 'hovered' : ''}`}
          />
          <div className={`latest-product-card-overlay ${isHovered ? 'visible' : ''}`}>
            <div className="latest-product-card-info">
              <h3 className="latest-product-card-title">{name}</h3>
              <p className="latest-product-card-price">${price}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProduct] = useState([]);

  useEffect(() => {
    setLatestProduct(products.slice(0, 12));
  }, [products]);

  return (
    <div className="latest-collection-section">
      <div className="latest-collection-header">
        <Title text1={"LATEST"} text2={"COLLECTIONS"} />
      </div>

      <div className="latest-collection-container">
        <div className="latest-product-grid">
          {latestProducts.map((item, index) => (
            <ProductCard
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestCollection;