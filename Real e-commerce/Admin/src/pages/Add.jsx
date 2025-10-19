import React, { useState } from "react";
import { assets } from "../assets/assets";
import "./Add.css";
import { useAuth } from "@clerk/clerk-react";
import { backendUrl } from "../App";

const Add = () => {
  const { getToken } = useAuth();
  

  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    sizes: "[]",
    bestseller: false,
  });

  // State for previewing and storing image files
  const [images, setImages] = useState([null, null, null, null]);

  // Handle file input changes
  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, bestseller: e.target.checked });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken({ template: "MilikiAPI" }); // 👈 Get Clerk JWT
      console.log(token)
      const fd = new FormData();

      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });

      // Append image files
      images.forEach((img, idx) => {
        if (img) fd.append(`image${idx + 1}`, img);
      });

      const response = await fetch(`${backendUrl}/api/product/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't manually set Content-Type for FormData
        },
        body: fd,
      });

      const result = await response.json();
      console.log(result);

      if (result.success) {
        alert("✅ Product added successfully!");
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          subCategory: "",
          sizes: "[]",
          bestseller: false,
        });
        setImages([null, null, null, null]);
      } else {
        alert("❌ Failed to add product: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error while uploading product.");
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <p>Upload Images</p>

      {/* Image Upload Section */}
      <div className="label-container">
        {[0, 1, 2, 3].map((index) => (
          <label htmlFor={`image${index + 1}`} key={index}>
            <img
              className="upload-img"
              src={
                images[index]
                  ? URL.createObjectURL(images[index])
                  : assets.upload_area
              }
              alt={`upload-${index + 1}`}
            />
            <input
              type="file"
              id={`image${index + 1}`}
              hidden
              onChange={(e) => handleImageChange(index, e.target.files[0])}
            />
          </label>
        ))}
      </div>

      {/* Product Fields */}
      <div className="add-form-fields">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price (KES)"
          value={formData.price}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="subCategory"
          placeholder="Sub-Category"
          value={formData.subCategory}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="sizes"
          placeholder='Sizes (e.g. ["S","M","L"])'
          value={formData.sizes}
          onChange={handleInputChange}
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={formData.bestseller}
            onChange={handleCheckboxChange}
          />
          Mark as Bestseller
        </label>
        <button type="submit" className="submit-btn">
          Add Product
        </button>
      </div>
    </form>
  );
};

export default Add;
