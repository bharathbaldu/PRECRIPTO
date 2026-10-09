import Prescription from '../models/Prescription.js'
import Appointment from '../models/Appointment.js'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'

// Create Prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      appointmentId,
      diagnosis,
      medications,
      instructions,
      followUp
    } = req.body
    
    const doctorId = req.doctor.id
    
    // Validate required fields
    if (!appointmentId || !diagnosis || !medications) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, diagnosis, and medications are required'
      })
    }
    
    // Check if appointment exists and belongs to doctor
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality')
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }
    
    if (appointment.doctor._id.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      })
    }
    
    // Allow prescription when appointment is confirmed or completed
    if (!['confirmed', 'completed'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment must be confirmed or completed before creating prescription'
      })
    }
    
    // Check if prescription already exists
    const existingPrescription = await Prescription.findOne({ appointment: appointmentId })
    if (existingPrescription) {
      return res.status(400).json({
        success: false,
        message: 'Prescription already exists for this appointment'
      })
    }
    
    // Normalize payload to match schema
    const diagnosisObj = typeof diagnosis === 'string'
      ? { primary: diagnosis }
      : {
          primary: diagnosis.primary,
          secondary: diagnosis.secondary || '',
          symptoms: Array.isArray(diagnosis.symptoms) ? diagnosis.symptoms : [],
          notes: diagnosis.notes || ''
        }

    const medsArray = Array.isArray(medications) ? medications : []
    const mappedMedications = medsArray.map((m) => ({
      name: m.name,
      dosage: m.dosage || 'as directed',
      frequency: m.frequency || 'as directed',
      duration: m.duration || 'as directed',
      instructions: m.instructions || '',
      quantity: m.quantity || '1'
    }))

    const instructionList = Array.isArray(instructions)
      ? instructions
      : (instructions ? [instructions] : [])

    const followUpObj = followUp && typeof followUp === 'object'
      ? {
          required: !!followUp.required,
          date: followUp.date || null,
          reason: followUp.reason || ''
        }
      : { required: false }
    
    // Create prescription
    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: doctorId,
      diagnosis: diagnosisObj,
      medications: mappedMedications,
      instructions: instructionList,
      followUp: followUpObj
    })
    
    // Update appointment with prescription reference
    appointment.prescription = prescription._id
    await appointment.save()
    
    // Populate prescription details
    await prescription.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name speciality' },
      { path: 'appointment', select: 'appointmentDate appointmentTime reason' }
    ])
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    })
    
  } catch (error) {
    console.error('Create prescription error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error creating prescription'
    })
  }
}

// Get Patient's Prescriptions
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id
    const { status, page = 1, limit = 10 } = req.query
    
    // Build query
    const query = { patient: patientId }
    if (status) {
      query.status = status
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('doctor', 'name speciality')
      .populate('appointment', 'appointmentDate appointmentTime reason')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    // Get total count
    const total = await Prescription.countDocuments(query)
    
    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      prescriptions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    })
    
  } catch (error) {
    console.error('Get patient prescriptions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving prescriptions'
    })
  }
}

// Get Doctor's Prescriptions
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const { status, page = 1, limit = 10 } = req.query
    
    // Build query
    const query = { doctor: doctorId }
    if (status) {
      query.status = status
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Get prescriptions
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email phone')
      .populate('appointment', 'appointmentDate appointmentTime reason')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    // Get total count
    const total = await Prescription.countDocuments(query)
    
    res.status(200).json({
      success: true,
      message: 'Prescriptions retrieved successfully',
      prescriptions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    })
    
  } catch (error) {
    console.error('Get doctor prescriptions error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving prescriptions'
    })
  }
}

// Get Prescription by ID
export const getPrescriptionById = async (req, res) => {
  try {
    const { prescriptionId } = req.params
    const userId = req.user.id
    
    const prescription = await Prescription.findById(prescriptionId)
      .populate('patient', 'name email phone address')
      .populate('doctor', 'name speciality image address')
      .populate('appointment', 'appointmentDate appointmentTime reason symptoms')
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }
    
    // Check if user has access to this prescription
    if (prescription.patient._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this prescription'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      prescription
    })
    
  } catch (error) {
    console.error('Get prescription by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving prescription'
    })
  }
}

// Get Prescription by Appointment
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const userId = req.user.id
    
    // Check if appointment exists and belongs to user
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }
    
    if (appointment.patient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      })
    }
    
    // Get prescription
    const prescription = await Prescription.findOne({ appointment: appointmentId })
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality image')
      .populate('appointment', 'appointmentDate appointmentTime reason')
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'No prescription found for this appointment'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Prescription retrieved successfully',
      prescription
    })
    
  } catch (error) {
    console.error('Get prescription by appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving prescription'
    })
  }
}

// Update Prescription
export const updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params
    const updateData = req.body
    const doctorId = req.doctor.id
    
    const prescription = await Prescription.findById(prescriptionId)
    
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      })
    }
    
    // Check if doctor has access to this prescription
    if (prescription.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this prescription'
      })
    }
    
    // Remove sensitive fields
    delete updateData._id
    delete updateData.createdAt
    delete updateData.updatedAt
    delete updateData.patient
    delete updateData.doctor
    delete updateData.appointment
    
    // Update prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name speciality' },
      { path: 'appointment', select: 'appointmentDate appointmentTime reason' }
    ])
    
    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      prescription: updatedPrescription
    })
    
  } catch (error) {
    console.error('Update prescription error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating prescription'
    })
  }
}

// Get Prescription History
export const getPrescriptionHistory = async (req, res) => {
  try {
    const patientId = req.user.id
    const { months = 12 } = req.query
    
    // Calculate date range
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - parseInt(months))
    
    // Get prescriptions within date range
    const prescriptions = await Prescription.find({
      patient: patientId,
      createdAt: { $gte: startDate }
    })
      .populate('doctor', 'name speciality')
      .populate('appointment', 'appointmentDate appointmentTime')
      .sort({ createdAt: -1 })
    
    // Group prescriptions by month
    const historyByMonth = prescriptions.reduce((acc, prescription) => {
      const month = prescription.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(prescription)
      return acc
    }, {})
    
    res.status(200).json({
      success: true,
      message: 'Prescription history retrieved successfully',
      history: historyByMonth,
      total: prescriptions.length
    })
    
  } catch (error) {
    console.error('Get prescription history error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving prescription history'
    })
  }
}