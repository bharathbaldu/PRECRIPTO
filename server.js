import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/database.js'

// Import routes
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import doctorRoutes from './routes/doctorRoute.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import prescriptionRoutes from './routes/prescriptionRoutes.js'

// Import middleware
import { errorHandler, notFound } from './middlewares/errorHandler.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Connect to database
connectDB()

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.CLIENT_URL || 'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PRESCRIPTO API is working! 🚀',
    status: 'success',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/prescriptions', prescriptionRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PRESCRIPTO Server running on port ${PORT}`)
  console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('✅ Database connected successfully')
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`)
  // Close server & exit process
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`)
  process.exit(1)
})

export default app