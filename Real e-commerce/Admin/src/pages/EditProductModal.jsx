import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react'; // Import Clerk hook
import './EditProductModal.css';

const EditProductModal = ({ product, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    bestseller: false
  });

  const [sizes, setSizes] = useState([]);
  const [images, setImages] = useState([null, null, null, null]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = 'http://localhost:4000';
  const token = localStorage.getItem('adminToken'); // Get admin token

  // Common categories and sizes (adjust based on your needs)
  const categories = ['Men', 'Women', 'Kids'];
  const subCategories = ['Topwear', 'Bottomwear', 'Winterwear'];
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        subCategory: product.subCategory,
        bestseller: product.bestseller
      });
      setSizes(product.sizes || []);
      setExistingImages(product.image || []);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeToggle = (size) => {
    setSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.subCategory) {
      toast.error('Please fill all required fields');
      return;
    }

    if (sizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append('id', product._id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subCategory', formData.subCategory);
      formDataToSend.append('bestseller', formData.bestseller);
      formDataToSend.append('sizes', JSON.stringify(sizes));

      // Add images if they were changed
      images.forEach((image, index) => {
        if (image) {
          formDataToSend.append(`image${index + 1}`, image);
        }
      });

      const response = await axios.post(`${backendUrl}/api/product/update`, formDataToSend, {
        headers: { token }
      });

      if (response.data.success) {
        toast.success('Product updated successfully');
        onUpdate(); // Refresh the product list
        onClose(); // Close the modal
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Sub-Category *</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Sub-Category</option>
                {subCategories.map(subCat => (
                  <option key={subCat} value={subCat}>{subCat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Price (KSH) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Sizes *</label>
            <div className="sizes-selection">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  className={`size-btn ${sizes.includes(size) ? 'active' : ''}`}
                  onClick={() => handleSizeToggle(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleInputChange}
              />
              Mark as Bestseller
            </label>
          </div>

          <div className="form-group">
            <label>Product Images (Optional - leave empty to keep existing images)</label>
            <div className="images-grid">
              {existingImages.map((img, index) => (
                <div key={index} className="image-upload-box">
                  <img src={img} alt={`Product ${index + 1}`} className="existing-image" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e)}
                    id={`image-${index}`}
                  />
                  <label htmlFor={`image-${index}`} className="upload-label">
                    Change Image {index + 1}
                  </label>
                </div>
              ))}
            </div>
            <p className="image-note">Upload new images only if you want to replace the existing ones</p>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;