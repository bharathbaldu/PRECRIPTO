import doctorModel from "../models/DoctorModel.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import validator from "validator"

const signDoctorToken = (doctorId) => jwt.sign({ id: doctorId, type: 'doctor' }, process.env.JWT_SECRET, { expiresIn: "7d" })

// Input validation helper for doctors
const validateDoctorInput = (data) => {
  const errors = []
  
  if (data.name && (!validator.isLength(data.name, { min: 2, max: 50 }))) {
    errors.push("Name must be between 2 and 50 characters")
  }
  
  if (data.email && !validator.isEmail(data.email)) {
    errors.push("Please provide a valid email address")
  }
  
  if (data.password && !validator.isLength(data.password, { min: 6 })) {
    errors.push("Password must be at least 6 characters long")
  }
  
  if (data.fees && (!validator.isNumeric(data.fees.toString()) || data.fees < 0)) {
    errors.push("Fees must be a positive number")
  }
  
  return errors
}

// Register new doctor
export const registerDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      image, 
      speciality, 
      degree, 
      experience, 
      about, 
      fees, 
      address 
    } = req.body
    
    // Validate required fields
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.status(400).json({ 
        message: "All fields are required",
        success: false
      })
    }

    // Validate input data
    const validationErrors = validateDoctorInput({ name, email, password, fees })
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: validationErrors.join(", "),
        success: false
      })
    }

    // Check if email already exists
    const existingDoctor = await doctorModel.findOne({ email })
    
    if (existingDoctor) {
      return res.status(400).json({ 
        message: "Email already in use",
        success: false
      })
    }

    // Hash password and create doctor
    const hashedPassword = await bcrypt.hash(password, 12)
    const doctor = await doctorModel.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password: hashedPassword,
      image: image || 'https://via.placeholder.com/150',
      speciality: speciality.trim(),
      degree: degree.trim(),
      experience: experience.trim(),
      about: about.trim(),
      fees: parseInt(fees),
      address: address,
      available: true,
      date: Date.now()
    })

    const token = signDoctorToken(doctor._id)
    
    console.log(`✅ New doctor registered: ${doctor.email}`)
    
    res.status(201).json({ 
      doctor: { 
        id: doctor._id, 
        name: doctor.name, 
        email: doctor.email,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        fees: doctor.fees,
        available: doctor.available
      }, 
      token,
      success: true,
      message: "Doctor account created successfully"
    })
  } catch (err) {
    console.error("❌ Doctor registration error:", err)
    
    // Handle specific MongoDB errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0]
      return res.status(400).json({ 
        message: `${field} already exists`,
        success: false
      })
    }
    
    res.status(500).json({ 
      message: "Doctor registration failed. Please try again.",
      success: false
    })
  }
}

// Doctor login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password required",
        success: false
      })
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address",
        success: false
      })
    }

    // Find doctor with password
    const doctor = await doctorModel.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password')
    
    if (!doctor) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        success: false
      })
    }

    const isValid = await bcrypt.compare(password, doctor.password)
    if (!isValid) {
      return res.status(401).json({ 
        message: "Invalid credentials",
        success: false
      })
    }

    const token = signDoctorToken(doctor._id)
    
    console.log(`✅ Doctor logged in: ${doctor.email}`)
    
    res.json({ 
      doctor: { 
        id: doctor._id, 
        name: doctor.name, 
        email: doctor.email,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: doctor.experience,
        fees: doctor.fees,
        available: doctor.available
      }, 
      token,
      success: true,
      message: "Login successful"
    })
  } catch (err) {
    console.error("❌ Doctor login error:", err)
    res.status(500).json({ 
      message: "Login failed. Please try again.",
      success: false
    })
  }
}

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const { speciality, search, page = 1, limit = 10 } = req.query
    
    // Build query
    let query = { available: true }
    
    if (speciality) {
      query.speciality = { $regex: speciality, $options: 'i' }
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { speciality: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const doctors = await doctorModel
      .find(query)
      .select('-password -slots_booked')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await doctorModel.countDocuments(query)
    
    res.json({
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalDoctors: total,
        hasNext: skip + doctors.length < total,
        hasPrev: parseInt(page) > 1
      },
      success: true
    })
  } catch (err) {
    console.error("❌ Get doctors error:", err)
    res.status(500).json({ 
      message: "Failed to fetch doctors",
      success: false
    })
  }
}

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params
    
    const doctor = await doctorModel.findById(id).select('-password -slots_booked')
    
    if (!doctor) {
      return res.status(404).json({ 
        message: "Doctor not found",
        success: false
      })
    }
    
    res.json({
      doctor,
      success: true
    })
  } catch (err) {
    console.error("❌ Get doctor error:", err)
    res.status(500).json({ 
      message: "Failed to fetch doctor",
      success: false
    })
  }
}

// Get doctors by speciality
export const getDoctorsBySpeciality = async (req, res) => {
  try {
    const { speciality } = req.params
    
    const doctors = await doctorModel
      .find({ 
        speciality: { $regex: speciality, $options: 'i' },
        available: true 
      })
      .select('-password -slots_booked')
      .sort({ fees: 1 })
    
    res.json({
      doctors,
      speciality,
      count: doctors.length,
      success: true
    })
  } catch (err) {
    console.error("❌ Get doctors by speciality error:", err)
    res.status(500).json({ 
      message: "Failed to fetch doctors",
      success: false
    })
  }
}

// Update doctor profile
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { 
      name, 
      speciality, 
      degree, 
      experience, 
      about, 
      fees, 
      address,
      available 
    } = req.body
    
    // Validate input data
    const validationErrors = validateDoctorInput({ name, fees })
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: validationErrors.join(", "),
        success: false
      })
    }

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (speciality) updateData.speciality = speciality.trim()
    if (degree) updateData.degree = degree.trim()
    if (experience) updateData.experience = experience.trim()
    if (about) updateData.about = about.trim()
    if (fees) updateData.fees = parseInt(fees)
    if (address) updateData.address = address
    if (typeof available === 'boolean') updateData.available = available

    const doctor = await doctorModel.findByIdAndUpdate(
      doctorId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password')

    console.log(`✅ Doctor profile updated: ${doctor.email}`)

    res.json({
      doctor,
      success: true,
      message: "Profile updated successfully"
    })
  } catch (err) {
    console.error("❌ Update doctor profile error:", err)
    res.status(500).json({ 
      message: "Failed to update profile",
      success: false
    })
  }
}

// Get doctor's available slots
export const getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query
    
    const doctor = await doctorModel.findById(id)
    
    if (!doctor) {
      return res.status(404).json({ 
        message: "Doctor not found",
        success: false
      })
    }
    
    // Generate available slots for the requested date
    const requestedDate = date ? new Date(date) : new Date()
    const slots = generateTimeSlots(requestedDate, doctor.slots_booked)
    
    res.json({
      doctorId: id,
      date: requestedDate.toISOString().split('T')[0],
      slots,
      success: true
    })
  } catch (err) {
    console.error("❌ Get doctor slots error:", err)
    res.status(500).json({ 
      message: "Failed to fetch slots",
      success: false
    })
  }
}

// Get doctor dashboard statistics
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const appointmentModel = (await import('../models/appointmentModel.js')).default
    
    // Calculate date ranges
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    
    // Get statistics
    const [totalPatients, weekPatients, monthPatients, yearPatients] = await Promise.all([
      appointmentModel.distinct('user', { doctor: doctorId, status: 'completed' }),
      appointmentModel.distinct('user', { 
        doctor: doctorId, 
        status: 'completed', 
        createdAt: { $gte: startOfWeek } 
      }),
      appointmentModel.distinct('user', { 
        doctor: doctorId, 
        status: 'completed', 
        createdAt: { $gte: startOfMonth } 
      }),
      appointmentModel.distinct('user', { 
        doctor: doctorId, 
        status: 'completed', 
        createdAt: { $gte: startOfYear } 
      })
    ])
    
    // Get appointment counts
    const totalAppointments = await appointmentModel.countDocuments({ doctor: doctorId })
    const pendingAppointments = await appointmentModel.countDocuments({ 
      doctor: doctorId, 
      status: 'pending' 
    })
    const completedAppointments = await appointmentModel.countDocuments({ 
      doctor: doctorId, 
      status: 'completed' 
    })
    
    res.json({
      success: true,
      stats: {
        patients: {
          total: totalPatients.length,
          thisWeek: weekPatients.length,
          thisMonth: monthPatients.length,
          thisYear: yearPatients.length
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          completed: completedAppointments
        }
      }
    })
  } catch (err) {
    console.error("❌ Get doctor stats error:", err)
    res.status(500).json({ 
      message: "Failed to fetch statistics",
      success: false
    })
  }
}

// Get doctor's appointments with patient details (uses unified Appointment model)
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const { status } = req.query
    const Appointment = (await import('../models/Appointment.js')).default
    
    // Build query
    const query = { doctor: doctorId }
    if (status) query.status = status
    
    // Get appointments with patient details
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(50)
    
    res.json({
      success: true,
      appointments
    })
  } catch (err) {
    console.error("❌ Get doctor appointments error:", err)
    res.status(500).json({ 
      message: "Failed to fetch appointments",
      success: false
    })
  }
}

// Accept appointment request
export const acceptAppointment = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const { appointmentId } = req.params
    const Appointment = (await import('../models/Appointment.js')).default
    
    const appointment = await Appointment.findById(appointmentId)
    
    if (!appointment) {
      return res.status(404).json({ 
        message: "Appointment not found",
        success: false
      })
    }
    
    if (appointment.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({ 
        message: "Unauthorized",
        success: false
      })
    }
    
    // Update appointment status
    appointment.status = 'confirmed'
    appointment.doctorResponse = {
      accepted: true,
      respondedAt: new Date()
    }
    
    await appointment.save()
    
    res.json({
      success: true,
      message: "Appointment confirmed",
      appointment
    })
  } catch (err) {
    console.error("❌ Accept appointment error:", err)
    res.status(500).json({ 
      message: "Failed to accept appointment",
      success: false
    })
  }
}

// Reject appointment request
export const rejectAppointment = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const { appointmentId } = req.params
    const { rejectionReason, alternativeSuggestions } = req.body
    const Appointment = (await import('../models/Appointment.js')).default
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        message: "Rejection reason is required",
        success: false
      })
    }
    
    const appointment = await Appointment.findById(appointmentId)
    
    if (!appointment) {
      return res.status(404).json({ 
        message: "Appointment not found",
        success: false
      })
    }
    
    if (appointment.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({ 
        message: "Unauthorized",
        success: false
      })
    }
    
    // Update appointment status
    appointment.status = 'cancelled'
    appointment.doctorResponse = {
      accepted: false,
      rejectionReason,
      alternativeSuggestions: alternativeSuggestions || '',
      respondedAt: new Date()
    }
    
    await appointment.save()
    
    res.json({
      success: true,
      message: "Appointment rejected",
      appointment
    })
  } catch (err) {
    console.error("❌ Reject appointment error:", err)
    res.status(500).json({ 
      message: "Failed to reject appointment",
      success: false
    })
  }
}

// Get patient's prescription history with this doctor
export const getPatientPrescriptionHistory = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const { patientId } = req.params
    const prescriptionModel = (await import('../models/prescriptionModel.js')).default
    
    const prescriptions = await prescriptionModel.find({
      doctor: doctorId,
      patient: patientId
    })
    .populate('appointment')
    .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      prescriptions
    })
  } catch (err) {
    console.error("❌ Get patient prescription history error:", err)
    res.status(500).json({ 
      message: "Failed to fetch prescription history",
      success: false
    })
  }
}

// Helper function to generate time slots
const generateTimeSlots = (date, bookedSlots = {}) => {
  const slots = []
  const startHour = 9 // 9 AM
  const endHour = 17 // 5 PM
  const slotDuration = 30 // 30 minutes
  
  const dateStr = date.toISOString().split('T')[0]
  const bookedForDate = bookedSlots[dateStr] || []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const slotDateTime = new Date(date)
      slotDateTime.setHours(hour, minute, 0, 0)
      
      // Skip past slots for today
      if (date.toDateString() === new Date().toDateString() && slotDateTime < new Date()) {
        continue
      }
      
      const isBooked = bookedForDate.includes(slotTime)
      
      slots.push({
        time: slotTime,
        datetime: slotDateTime.toISOString(),
        available: !isBooked,
        booked: isBooked
      })
    }
  }
  
  return slots
}











