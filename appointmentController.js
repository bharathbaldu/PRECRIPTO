import Appointment from '../models/Appointment.js'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'

// Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms,
      notes
    } = req.body
    
    const patientId = req.user.id
    
    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, time, and reason are required'
      })
    }
    
    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId)
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      })
    }
    
    // Check if doctor is available
    if (!doctor.available) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for appointments'
      })
    }
    
    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    })
    
    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      })
    }
    
    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      symptoms: symptoms || '',
      notes: notes || '',
      fees: doctor.fees
    })
    
    // Populate appointment details
    await appointment.populate([
      { path: 'patient', select: 'name email phone' },
      { path: 'doctor', select: 'name speciality fees' }
    ])
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        patient: appointment.patient,
        doctor: appointment.doctor,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        reason: appointment.reason,
        symptoms: appointment.symptoms,
        notes: appointment.notes,
        fees: appointment.fees,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        createdAt: appointment.createdAt
      }
    })
    
  } catch (error) {
    console.error('Book appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error booking appointment'
    })
  }
}

// Get User's Appointments
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id
    const { status, page = 1, limit = 10 } = req.query
    
    // Build query
    const query = { patient: userId }
    if (status) {
      query.status = status
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Get appointments
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name speciality fees image')
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    // Get total count
    const total = await Appointment.countDocuments(query)
    
    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    })
    
  } catch (error) {
    console.error('Get user appointments error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointments'
    })
  }
}

// Get Doctor's Appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor.id
    const { status, date, page = 1, limit = 10 } = req.query
    
    // Build query
    const query = { doctor: doctorId }
    if (status) {
      query.status = status
    }
    if (date) {
      query.appointmentDate = new Date(date)
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    // Get appointments
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name speciality')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    // Get total count
    const total = await Appointment.countDocuments(query)
    
    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    })
    
  } catch (error) {
    console.error('Get doctor appointments error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointments'
    })
  }
}

// Get Appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const userId = req.user.id
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient', 'name email phone address')
      .populate('doctor', 'name speciality fees image address')
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }
    
    // Check if user has access to this appointment
    if (appointment.patient._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      appointment
    })
    
  } catch (error) {
    console.error('Get appointment by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error retrieving appointment'
    })
  }
}

// Update Appointment Status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const { status, notes } = req.body
    const doctorId = req.doctor.id
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }
    
    const appointment = await Appointment.findById(appointmentId)
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }
    
    // Check if doctor has access to this appointment
    if (appointment.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      })
    }
    
    // Update appointment
    appointment.status = status
    if (notes) {
      appointment.notes = notes
    }
    
    await appointment.save()
    
    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    })
    
  } catch (error) {
    console.error('Update appointment status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error updating appointment status'
    })
  }
}

// Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const { reason } = req.body
    const userId = req.user.id
    
    const appointment = await Appointment.findById(appointmentId)
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }
    
    // Check if user has access to this appointment
    if (appointment.patient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      })
    }
    
    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled. Please contact support.'
      })
    }
    
    // Cancel appointment
    appointment.status = 'cancelled'
    appointment.cancelledBy = 'patient'
    appointment.cancellationReason = reason || 'Cancelled by patient'
    appointment.cancelledAt = new Date()
    
    await appointment.save()
    
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    })
    
  } catch (error) {
    console.error('Cancel appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error cancelling appointment'
    })
  }
}

// Reschedule Appointment
export const rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const { newDate, newTime, reason } = req.body
    const userId = req.user.id
    
    // Validate required fields
    if (!newDate || !newTime) {
      return res.status(400).json({
        success: false,
        message: 'New date and time are required'
      })
    }
    
    const appointment = await Appointment.findById(appointmentId)
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      })
    }
    
    // Check if user has access to this appointment
    if (appointment.patient.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this appointment'
      })
    }
    
    // Check if appointment can be rescheduled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be rescheduled. Please contact support.'
      })
    }
    
    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: appointmentId }
    })
    
    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      })
    }
    
    // Create new appointment
    const newAppointment = await Appointment.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      reason: appointment.reason,
      symptoms: appointment.symptoms,
      notes: appointment.notes,
      fees: appointment.fees,
      rescheduledFrom: appointment._id
    })
    
    // Update original appointment
    appointment.status = 'rescheduled'
    appointment.rescheduledTo = newAppointment._id
    appointment.cancelledBy = 'patient'
    appointment.cancellationReason = reason || 'Rescheduled by patient'
    appointment.cancelledAt = new Date()
    
    await appointment.save()
    
    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: newAppointment
    })
    
  } catch (error) {
    console.error('Reschedule appointment error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error rescheduling appointment'
    })
  }
}