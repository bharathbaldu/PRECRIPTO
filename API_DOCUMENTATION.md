# PRESCRIPTO Backend API Documentation

## Overview
This is the backend API for PRESCRIPTO, a comprehensive healthcare platform that provides doctor appointments, AI-powered medical assistance, and prescription management.

## Base URL
```
http://localhost:4000
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "emailVerified": true,
    "phoneVerified": true
  },
  "token": "jwt_token",
  "success": true,
  "message": "Account created successfully"
}
```

### Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "identifier": "john@example.com", // email or phone
  "password": "password123"
}
```

### Get User Profile
**GET** `/api/auth/profile` (Protected)

### Update User Profile
**PUT** `/api/auth/profile` (Protected)

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": {
    "line1": "123 Main St",
    "line2": "Apt 4B"
  },
  "gender": "Male",
  "dob": "1990-01-01"
}
```

### Change Password
**PUT** `/api/auth/change-password` (Protected)

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 🤖 AI Chatbot Endpoints

### Chat with AI
**POST** `/api/chat`

**Request Body:**
```json
{
  "question": "I have a fever, what should I do?"
}
```

**Response:**
```json
{
  "answer": "For a fever, you can take paracetamol...",
  "medicationSuggestion": {
    "medication": "Paracetamol (Acetaminophen)",
    "dosage": "Follow package instructions",
    "warning": "Consult doctor if fever persists for more than 3 days"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "model": "gemini-1.5-flash"
}
```

### Check AI Service Health
**GET** `/api/chat/health`

---

## 👨‍⚕️ Doctor Endpoints

### Register Doctor
**POST** `/api/doctors/register`

**Request Body:**
```json
{
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "password": "password123",
  "image": "https://example.com/image.jpg",
  "speciality": "Cardiology",
  "degree": "MD",
  "experience": "10 years",
  "about": "Experienced cardiologist...",
  "fees": 500,
  "address": {
    "line1": "Medical Center",
    "line2": "Suite 100"
  }
}
```

### Login Doctor
**POST** `/api/doctors/login`

### Get All Doctors
**GET** `/api/doctors`

**Query Parameters:**
- `speciality`: Filter by speciality
- `search`: Search by name, speciality, or degree
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Get Doctor by ID
**GET** `/api/doctors/:id`

### Get Doctors by Speciality
**GET** `/api/doctors/speciality/:speciality`

### Get Doctor's Available Slots
**GET** `/api/doctors/:id/slots?date=2024-01-01`

### Update Doctor Profile
**PUT** `/api/doctors/profile` (Protected)

---

## 📅 Appointment Endpoints

### Book Appointment
**POST** `/api/appointments/book` (Protected)

**Request Body:**
```json
{
  "doctorId": "doctor_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "10:00",
  "reason": "Regular checkup",
  "symptoms": "Mild headache",
  "notes": "Patient notes"
}
```

### Get User's Appointments
**GET** `/api/appointments/user` (Protected)

**Query Parameters:**
- `status`: Filter by status (pending, confirmed, completed, cancelled)
- `page`: Page number
- `limit`: Items per page

### Get Doctor's Appointments
**GET** `/api/appointments/doctor` (Protected)

### Get Appointment by ID
**GET** `/api/appointments/:appointmentId` (Protected)

### Update Appointment Status
**PUT** `/api/appointments/:appointmentId/status` (Protected)

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Appointment confirmed"
}
```

### Cancel Appointment
**PUT** `/api/appointments/:appointmentId/cancel` (Protected)

---

## 💊 Prescription Endpoints

### Create Prescription
**POST** `/api/prescriptions/create` (Protected - Doctor only)

**Request Body:**
```json
{
  "appointmentId": "appointment_id",
  "diagnosis": "Common cold",
  "symptoms": "Runny nose, cough",
  "medications": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instructions": "Take with food",
      "quantity": "10 tablets"
    }
  ],
  "instructions": "Rest and drink plenty of fluids",
  "followUpDate": "2024-01-20"
}
```

### Get Patient's Prescriptions
**GET** `/api/prescriptions/patient` (Protected)

### Get Doctor's Prescriptions
**GET** `/api/prescriptions/doctor` (Protected)

### Get Prescription by ID
**GET** `/api/prescriptions/:prescriptionId` (Protected)

### Get Prescription by Appointment
**GET** `/api/prescriptions/appointment/:appointmentId` (Protected)

### Update Prescription
**PUT** `/api/prescriptions/:prescriptionId` (Protected - Doctor only)

---

## 📊 Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "data": {}, // or array
  "success": true,
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "success": false,
  "errors": [] // optional validation errors
}
```

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/prescripto

# JWT
JWT_SECRET=your_jwt_secret_key

# Client URL
CLIENT_URL=http://localhost:5173

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Optional: Email Service
EMAIL_USER=your_email
EMAIL_PASS=your_password

# Optional: SMS Service
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start the server:
```bash
npm start
```

4. For development with auto-restart:
```bash
npm run server
```

---

## 📝 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Error handling without sensitive data exposure
- Rate limiting (can be added)

---

## 📈 Features Implemented

✅ **Authentication System**
- User registration and login
- JWT token management
- Profile management
- Password change functionality

✅ **AI Chatbot**
- Google Gemini AI integration
- Medical-focused responses
- Medication suggestions
- Health check endpoint

✅ **Doctor Management**
- Doctor registration and login
- Doctor profile management
- Speciality-based filtering
- Available slots management

✅ **Appointment System**
- Appointment booking
- Status management
- User and doctor appointment views
- Cancellation functionality

✅ **Prescription Management**
- Prescription creation
- Medication management
- Patient and doctor prescription views
- Follow-up scheduling

✅ **Error Handling**
- Comprehensive error middleware
- Validation error handling
- Database error handling
- JWT error handling











