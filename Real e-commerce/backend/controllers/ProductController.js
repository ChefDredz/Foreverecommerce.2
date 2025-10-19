import{v2 as cloudinary} from 'cloudinary'
import "../config/cloudinary.js";

import productModel from '../models/ProductModel.js'

// function for add product 

const addProduct = async (req, res ) => {
    try {


        const {name , description, price,category,subCategory,sizes, bestseller} = req.body


        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3,image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) =>{
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'})
                return result.secure_url
            })

        )

        const productData = {
            name,
            description,
            category,
            price:Number(price),
            subCategory,
            bestseller: bestseller=== "true" ? true : false,
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()

        }

        const product = new productModel(productData)
        await product.save()


        res.status(201).json({success:true ,message: 'Product Added'})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message: error.message})
        
    }
    
}
// function for list product 

const listProduct = async (req, res ) => {
    try {


        const products = await productModel.find({})
        res.json({success:true, products})
        
    } catch (error) {
        console.log(error)
        res.json({success: false , message: error.message})
    }

}
// function for remove product 

const removeProduct = async (req, res ) => {

    try {

        await productModel.findByIdAndDelete(req.body.id)
    res.json({success:true ,message:'product removed'})
        
    } catch (error) {

        console.log(error)
        res.json({success: false , message: error.message})
        
    }


    

}
// function for single product 

const singleProduct = async (req, res ) => {

    try {

        const { productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success:true , product})
        
    } catch (error) {

        console.log(error)
        res.json({success: false , message: error.message})
        
    }

}

// Add this function to your ProductController.js file

// function for update product 
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body;

        // Find the existing product
        const existingProduct = await productModel.findById(id);
        if (!existingProduct) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Handle image updates if new images are provided
        let imagesUrl = existingProduct.image; // Keep existing images by default

        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files.image1 && req.files.image1[0];
            const image2 = req.files.image2 && req.files.image2[0];
            const image3 = req.files.image3 && req.files.image3[0];
            const image4 = req.files.image4 && req.files.image4[0];

            const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

            if (images.length > 0) {
                // Upload new images to cloudinary
                imagesUrl = await Promise.all(
                    images.map(async (item) => {
                        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                        return result.secure_url;
                    })
                );
            }
        }

        // Update product data
        const updateData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: typeof sizes === 'string' ? JSON.parse(sizes) : sizes,
            image: imagesUrl
        };

        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ success: true, message: 'Product Updated Successfully', product: updatedProduct });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Don't forget to export this function
// Update your export statement to include updateProduct:
// export { listProduct, removeProduct, singleProduct, addProduct, updateProduct }


export {listProduct, removeProduct, singleProduct, addProduct, updateProduct}