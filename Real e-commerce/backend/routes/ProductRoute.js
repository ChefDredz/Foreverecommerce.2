import express from 'express'
import { listProduct, addProduct, removeProduct, singleProduct,updateProduct } from '../controllers/ProductController.js'
import upload from '../middleware/Multer.js'
import { requireAdmin } from "../middleware/requireAdmin.js";

const productRouter = express.Router()

productRouter.post('/add', upload.fields([{name: 'image1', maxCount:1},{name: 'image2', maxCount:1},{name: 'image3', maxCount:1},{name: 'image4', maxCount:1}]) ,requireAdmin, addProduct)
productRouter.post('/remove' ,requireAdmin, removeProduct)
productRouter.post('/single' , singleProduct)
productRouter.post('/list' , listProduct)

productRouter.get('/test', (req, res) => res.send('✅ Product router connected'));

// NEW ROUTE - Add this
productRouter.post('/update', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), updateProduct);


export default productRouter