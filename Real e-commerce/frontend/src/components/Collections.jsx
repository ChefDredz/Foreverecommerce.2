import React, { useContext, useEffect, useState } from "react";
import "./Collection.css";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const Collections = () => {
  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] =useState("relevant");

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    setFilteredProducts(productsCopy);
  };

  const sorttProducts = () => {
    let fpCopy = filteredProducts.slice();
    // sorting logic here

    switch (sortType) {
      case "low-high":
        setFilteredProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilteredProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };
  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch]);

  useEffect(() => {
    sorttProducts();
  }, [sortType]);

  return (
    <div className="collection-container">
      {/* filter-options */}
      <div className="collection-filter">
        <p>FILTERS</p>
        {/* categoryfilter */}
        <div id="filter-box" className={`${showFilter ? "" : "hidden"}`}>
          <p className="filter-heading">CATEGORY</p>
          <div className="check-box">
            <p>
              <input type="checkbox" value={"Men"} onChange={toggleCategory} />
              Men{" "}
            </p>
          </div>
          <div className="check-box">
            <p>
              <input
                type="checkbox"
                value={"Women"}
                onChange={toggleCategory}
              />
              Women{" "}
            </p>
          </div>
          <div className="check-box">
            <p>
              <input type="checkbox" value={"Kids"} onChange={toggleCategory} />
              Kids{" "}
            </p>
          </div>
        </div>
        <div id="filter-box" className={`${showFilter ? "" : "hidden"}`}>
          <p className="filter-heading">TYPE</p>
          <div className="check-box">
            <p>
              <input
                type="checkbox"
                value={"Topwear"}
                onChange={toggleSubCategory}
              />
              Topwear{" "}
            </p>
          </div>
          <div className="check-box">
            <p>
              <input
                type="checkbox"
                value={"Bottomwear"}
                onChange={toggleSubCategory}
              />
              Bottomwear{" "}
            </p>
          </div>
          <div className="check-box">
            <p>
              <input
                type="checkbox"
                value={"Winterwear"}
                onChange={toggleSubCategory}
              />
              Winterwear{" "}
            </p>
          </div>
        </div>
      </div>

      {/* right-side */}
      <div className="collection-products">
        <div className="header">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          {/* product sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            name="sort"
            id="sort"
          >
            <option value="relevant">Featured</option>

            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
          </select>
        </div>
        {/* map through products and show product item */}
        <div className="products-list">
          {filteredProducts.map((item, index) => (
            <ProductItem
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

export default Collections;
