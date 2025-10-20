import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './config/mongodb.js'
import userRoute from './routes/UserRoute.js'
import connectCloudinary from './config/cloudinary.js'
import productRouter from './routes/ProductRoute.js'
import orderRouter from './routes/OrderRoute.js';
import mpesaRouter from './routes/MpesaRoute.js'; // NEW
import notificationRouter from './routes/NotificationRoute.js'; // NEW



// App config 
const app = express()
const PORT = process.env.PORT || 4000
connectDB()
connectCloudinary()


// middlewares
app.use(cors())
app.use(express.json())

// api end-points

app.get('/', (req,res) => {
    res.send('API working')
})

// User API endpoints
app.use('/api/users', userRoute)

// product Api end point

app.use('/api/product', productRouter)

// order api endpoint 
app.use('/api/orders', orderRouter);

app.use('/api/mpesa', mpesaRouter); // NEW - M-Pesa routes
app.use('/api/notifications', notificationRouter); // NEW - Notification routes

app.listen(PORT , ()=> console.log(`Server started on PORT ${PORT}` ))