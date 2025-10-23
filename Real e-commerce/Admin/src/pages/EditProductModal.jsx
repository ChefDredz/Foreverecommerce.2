import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/clerk-react";
import "./EditProductModal.css";

const EditProductModal = ({ product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    subCategory: product.subCategory,
    bestseller: product.bestseller,
    sizes: product.sizes,
  });

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [loading, setLoading] = useState(false);
  // ✅ FIX: Use the correct backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://foreverecommerce-2.onrender.com";
  const { getToken } = useAuth();

  console.log("🔗 Backend URL:", backendUrl); // Debug log

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle size selection
  const handleSizeToggle = (size) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setImages({ ...images, [name]: files[0] });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("✏️ Updating product:", formData.id);

      // Get Clerk token
      const token = await getToken({ template: "MilikiAPI" });
      
      if (!token) {
        toast.error("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const data = new FormData();
      data.append("id", formData.id);
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("subCategory", formData.subCategory);
      data.append("bestseller", formData.bestseller);
      data.append("sizes", JSON.stringify(formData.sizes));

      // Append images if new ones are selected
      if (images.image1) data.append("image1", images.image1);
      if (images.image2) data.append("image2", images.image2);
      if (images.image3) data.append("image3", images.image3);
      if (images.image4) data.append("image4", images.image4);

      console.log("📤 Sending update request...");

      const response = await axios.post(
        `${backendUrl}/api/product/update`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Update response:", response.data);

      if (response.data.success) {
        toast.success("Product updated successfully!");
        onUpdate(); // Refresh the product list
      } else {
        toast.error(response.data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("❌ Update error:", error);
      if (error.response?.status === 403) {
        toast.error("Not authorized. Please check your admin permissions.");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to update product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Product Name */}
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter product description"
            />
          </div>

          {/* Price */}
          <div className="form-group">
            <label>Price (KSH) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="Enter price"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          {/* Sub-Category */}
          <div className="form-group">
            <label>Sub-Category *</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Sub-Category</option>
              <option value="Topwear">Topwear</option>
              <option value="Bottomwear">Bottomwear</option>
              <option value="Winterwear">Winterwear</option>
            </select>
          </div>

          {/* Sizes */}
          <div className="form-group">
            <label>Available Sizes *</label>
            <div className="sizes-selector">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-btn ${
                    formData.sizes.includes(size) ? "selected" : ""
                  }`}
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Bestseller */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleChange}
              />
              Mark as Bestseller
            </label>
          </div>

          {/* Current Images */}
          <div className="form-group">
            <label>Current Images</label>
            <div className="current-images">
              {product.image.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product ${index + 1}`}
                  className="current-image"
                />
              ))}
            </div>
          </div>

          {/* Upload New Images */}
          <div className="form-group">
            <label>Upload New Images (Optional)</label>
            <div className="image-uploads">
              {["image1", "image2", "image3", "image4"].map((imgName, index) => (
                <div key={imgName} className="image-upload-item">
                  <label htmlFor={imgName}>Image {index + 1}</label>
                  <input
                    type="file"
                    id={imgName}
                    name={imgName}
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {images[imgName] && (
                    <span className="file-name">{images[imgName].name}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="help-text">
              Leave empty to keep existing images. Upload new images to replace them.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;