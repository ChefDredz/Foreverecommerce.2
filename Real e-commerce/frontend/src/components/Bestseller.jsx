import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import "./BestSeller.css";
import ProductItem from "./ProductItem";



const Bestseller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    // const bestProducts = products.filter((item) => item.bestSeller);
    setBestSeller(products.slice(0, 5));
  },[products]);
  return (
    <>
      <div className="bestseller">
        <Title text1={"BEST"} text2={"SELLER"} />
      </div>

      <div className="bestseller-collection-container">
        {bestSeller.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </>
  );
};

export default Bestseller;
