import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'
import connectDB from '../config/database.js'

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// Validate input helper
const validateInput = (data, requiredFields) => {
  const errors = []
  
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} is required`)
    }
  }
  
  return errors
}

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    
    // Validate required fields
    const validationErrors = validateInput(req.body, ['name', 'email', 'password', 'phone'])
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: validationErrors.join(', ')
      })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    })
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists'
      })
    }
    
    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim()
    })
    
    // Generate token
    const token = generateToken(user._id)
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
}

// Login User
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body
    
    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password are required'
      })
    }
    
    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() }
      ]
    }).select('+password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      })
    }
    
    // Compare password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }
    
    // Update last login
    user.lastLogin = new Date()
    await user.save()
    
    // Generate token
    const token = generateToken(user._id)
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        profilePhoto: user.profilePhoto,
        emergencyContact: user.emergencyContact,
        healthInfo: user.healthInfo,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
}

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        profilePhoto: user.profilePhoto,
        emergencyContact: user.emergencyContact,
        healthInfo: user.healthInfo,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile'
    })
  }
}

// Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password
    delete updateData.email
    delete updateData._id
    delete updateData.createdAt
    delete updateData.updatedAt
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        profilePhoto: user.profilePhoto,
        emergencyContact: user.emergencyContact,
        healthInfo: user.healthInfo,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    })
  }
}

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      })
    }
    
    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      })
    }
    
    // Get user with password
    const user = await User.findById(userId).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }
    
    // Update password
    user.password = newPassword
    await user.save()
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    })
  }
}

// Verify Token
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
    
  } catch (error) {
    console.error('Verify token error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error verifying token'
    })
  }
}