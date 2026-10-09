import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'

// Authentication middleware
export const auth = async (req, res, next) => {
  try {
    let token
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      })
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      })
    }
    
    // Add user to request object
    req.user = { id: user._id, userType: 'patient' }
    next()
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    })
  }
}

// Doctor authentication middleware
export const doctorAuth = async (req, res, next) => {
  try {
    let token
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Get doctor from token
    const doctor = await Doctor.findById(decoded.id).select('-password')
    
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. Doctor not found.'
      })
    }
    
    // Check if doctor is active
    if (!doctor.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Doctor account is deactivated. Please contact support.'
      })
    }
    
    // Add doctor to request object
    req.doctor = { id: doctor._id, userType: 'doctor' }
    next()
    
  } catch (error) {
    console.error('Doctor auth middleware error:', error)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    })
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    
    if (token) {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password')
      
      if (user && user.isActive) {
        req.user = { id: user._id, userType: 'patient' }
      }
    }
    
    next()
    
  } catch (error) {
    // Continue without authentication if token is invalid
    next()
  }
}

// Admin authentication middleware
export const adminAuth = async (req, res, next) => {
  try {
    let token
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Check if user is admin (you can implement admin role in User model)
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      })
    }
    
    // For now, we'll check if email contains 'admin' - you can implement proper role system
    if (!user.email.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      })
    }
    
    // Add admin to request object
    req.admin = { id: user._id, userType: 'admin' }
    next()
    
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    })
  }
}