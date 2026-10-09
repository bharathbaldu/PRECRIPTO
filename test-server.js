import express from "express"
import cors from "cors"

const app = express()
const port = 4000

// middleware
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}))

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "API is working and fine 🚀", status: "success" })
})

// Test auth endpoint
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone } = req.body
  
  // Validate required fields
  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      message: "All fields are required",
      status: "error"
    })
  }
  
  res.json({ 
    message: "Account created successfully!", 
    status: "success",
    token: "test-jwt-token-" + Date.now(),
    user: {
      id: "user_" + Date.now(),
      name: name,
      email: email,
      phone: phone
    }
  })
})

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body
  
  // Validate required fields
  if (!identifier || !password) {
    return res.status(400).json({
      message: "Email/Phone and password are required",
      status: "error"
    })
  }
  
  // Simple validation (in real app, check against database)
  if (password.length < 6) {
    return res.status(400).json({
      message: "Invalid credentials",
      status: "error"
    })
  }
  
  res.json({ 
    message: "Login successful!", 
    status: "success",
    token: "test-jwt-token-" + Date.now(),
    user: {
      id: "user_123",
      name: "Test User",
      email: identifier.includes("@") ? identifier : "test@example.com",
      phone: identifier.includes("@") ? "1234567890" : identifier
    }
  })
})

// Profile update endpoint
app.put("/api/auth/profile", (req, res) => {
  const { name, phone, address, gender, dob } = req.body
  
  // In a real app, you would validate the token and update the database
  // For now, we'll just return success
  res.json({
    message: "Profile updated successfully!",
    status: "success",
    user: {
      id: "user_123",
      name: name || "Test User",
      email: "test@example.com",
      phone: phone || "1234567890",
      address: address || { line1: "", line2: "" },
      gender: gender || "",
      dob: dob || ""
    }
  })
})

// Get profile endpoint
app.get("/api/auth/profile", (req, res) => {
  // In a real app, you would validate the token and get user from database
  res.json({
    message: "Profile retrieved successfully",
    status: "success",
    user: {
      id: "user_123",
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      address: { line1: "123 Main St", line2: "Apt 4B" },
      gender: "Male",
      dob: "1990-01-01"
    }
  })
})

// Appointment booking endpoint
app.post("/api/appointments/book", (req, res) => {
  const { doctorId, doctorName, doctorSpeciality, doctorFees, appointmentDate, appointmentTime, patientName, patientEmail, patientPhone } = req.body
  
  // Validate required fields
  if (!doctorId || !appointmentDate || !appointmentTime || !patientName || !patientEmail) {
    return res.status(400).json({
      message: "Missing required appointment details",
      status: "error"
    })
  }
  
  // Generate appointment ID
  const appointmentId = "APT_" + Date.now()
  
  res.json({
    message: "Appointment booked successfully!",
    status: "success",
    appointment: {
      id: appointmentId,
      doctorId: doctorId,
      doctorName: doctorName,
      doctorSpeciality: doctorSpeciality,
      doctorFees: doctorFees,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      patientName: patientName,
      patientEmail: patientEmail,
      patientPhone: patientPhone,
      status: "confirmed",
      bookingDate: new Date().toISOString(),
      paymentStatus: "pending"
    }
  })
})

// Get user appointments endpoint
app.get("/api/appointments", (req, res) => {
  // In a real app, you would filter by user ID from token
  res.json({
    message: "Appointments retrieved successfully",
    status: "success",
    appointments: [
      {
        id: "APT_1234567890",
        doctorId: "doc_123",
        doctorName: "Dr. John Smith",
        doctorSpeciality: "Cardiologist",
        doctorFees: 500,
        appointmentDate: "2024-01-15",
        appointmentTime: "10:30 AM",
        patientName: "Test User",
        patientEmail: "test@example.com",
        patientPhone: "1234567890",
        status: "confirmed",
        bookingDate: "2024-01-10T10:00:00Z",
        paymentStatus: "paid"
      },
      {
        id: "APT_1234567891",
        doctorId: "doc_124",
        doctorName: "Dr. Sarah Johnson",
        doctorSpeciality: "Dermatologist",
        doctorFees: 300,
        appointmentDate: "2024-01-20",
        appointmentTime: "2:00 PM",
        patientName: "Test User",
        patientEmail: "test@example.com",
        patientPhone: "1234567890",
        status: "confirmed",
        bookingDate: "2024-01-12T14:30:00Z",
        paymentStatus: "pending"
      }
    ]
  })
})

// Cancel appointment endpoint
app.put("/api/appointments/:id/cancel", (req, res) => {
  const { id } = req.params
  
  res.json({
    message: "Appointment cancelled successfully",
    status: "success",
    appointmentId: id
  })
})

// Reschedule appointment endpoint
app.put("/api/appointments/:id/reschedule", (req, res) => {
  const { id } = req.params
  const { newDate, newTime } = req.body
  
  res.json({
    message: "Appointment rescheduled successfully",
    status: "success",
    appointment: {
      id: id,
      appointmentDate: newDate,
      appointmentTime: newTime,
      status: "rescheduled"
    }
  })
})

// Test chat endpoint
app.post("/api/chat/", (req, res) => {
  res.json({
    message: "Chat endpoint working",
    status: "success",
    data: {
      response: "This is a test response from the chatbot",
      medicationSuggestions: [
        { name: "Test Medicine", dosage: "1 tablet twice daily" }
      ]
    }
  })
})

app.listen(port, () => {
  console.log(`🚀 Test Server is running at http://localhost:${port}`)
  console.log("✅ No database required - basic API testing only")
})
