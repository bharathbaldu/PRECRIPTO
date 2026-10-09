# Doctor Portal Implementation Guide

## ✅ What Has Been Implemented

### Backend Enhancements

1. **Appointment Model Updates**
   - Added `rejected` status to appointment enum
   - Added `doctorResponse` field with:
     - `accepted` (boolean)
     - `rejectionReason` (string)
     - `alternativeSuggestions` (string)
     - `respondedAt` (date)

2. **New API Endpoints** (in `/api/doctors/`)
   - `GET /dashboard/stats` - Get doctor statistics (patients and appointments)
   - `GET /appointments/all` - Get all doctor's appointments
   - `POST /appointments/:appointmentId/accept` - Accept an appointment
   - `POST /appointments/:appointmentId/reject` - Reject an appointment with reason
   - `GET /patients/:patientId/prescriptions` - Get patient's prescription history

3. **Updated Controllers**
   - `doctorControllers.js` now includes:
     - `getDoctorStats()` - Weekly/monthly/yearly patient statistics
     - `getDoctorAppointments()` - Fetch appointments with patient details
     - `acceptAppointment()` - Accept appointment requests
     - `rejectAppointment()` - Reject with reason and suggestions
     - `getPatientPrescriptionHistory()` - Get patient's past prescriptions

### Frontend - Doctor Portal

1. **Login Page** (`/login`)
   - Email/password authentication
   - Error handling
   - Redirects to dashboard on success

2. **Doctor Dashboard** (`/dashboard`)
   - **Overview Tab:**
     - Doctor profile information
     - Statistics cards showing:
       - Total patients (this year)
       - Patients this month
       - Patients this week
       - Pending appointments
   
   - **Appointments Tab:**
     - View all appointment requests (pending, accepted, completed, rejected)
     - Accept appointments with one click
     - Reject appointments with:
       - Pre-defined rejection reasons:
         - "Not available at this time"
         - "Outside of specialization"
         - "Consult a specialist"
         - "Emergency cases only"
         - "Other"
       - Alternative suggestions field
     - View appointment details including:
       - Patient information (name, email, phone)
       - Date and time
       - Reason for visit
       - Symptoms

## How to Use

### Starting the Doctor Portal

1. **Start the Backend:**
   ```bash
   cd PRESCRIPTO/backend
   npm install  # if not already done
   npm start
   # Server runs on http://localhost:4000
   ```

2. **Start the Doctor Frontend:**
   ```bash
   cd PRESCRIPTO/frontedoctor
   npm install  # if not already done
   npm run dev
   # Doctor portal runs on http://localhost:5174
   ```

3. **Access the Portal:**
   - Open http://localhost:5174/login
   - Login with a doctor account

### Doctor Login Credentials

You need to create a doctor account first. You can do this by:

**Option 1: Register via API**
```bash
POST http://localhost:4000/api/doctors/register
{
  "name": "Dr. John Doe",
  "email": "doctor@example.com",
  "password": "password123",
  "speciality": "General physician",
  "degree": "MBBS, MD",
  "experience": "10 years",
  "about": "Experienced physician",
  "fees": 500,
  "address": {
    "line1": "123 Medical Center",
    "line2": "Suite 456"
  }
}
```

**Option 2: Use existing seed data** (if you have seedDoctors.js)

### Features for Patients

When patients book appointments:
1. Appointments are created with `status: 'pending'`
2. Doctor sees pending requests in their dashboard
3. Doctor can:
   - **Accept** - Updates status to 'accepted'
   - **Reject** - Updates status to 'rejected' with reason

When doctor rejects:
- Rejection reason is stored
- Alternative suggestions are stored
- Patient can see these in their appointment history

### Statistics Tracking

The dashboard tracks:
- **Patient Statistics:**
  - Total unique patients (ever)
  - Patients this week
  - Patients this month
  - Patients this year

- **Appointment Statistics:**
  - Total appointments
  - Pending appointments
  - Completed appointments

### Files Created/Modified

**Backend:**
- `models/appointmentModel.js` - Updated with rejection fields
- `controllers/doctorControllers.js` - Added new controller functions
- `routes/doctorRoute.js` - Added new routes with doctorAuth middleware

**Frontend:**
- `pages/DoctorLogin.jsx` - Login page
- `pages/DoctorDashboard.jsx` - Main dashboard with tabs
- `context/DoctorContext.jsx` - Context for doctor auth
- `App.jsx` - Updated with routing

## What's Next (To Be Implemented)

1. **Prescription Management:**
   - View/edit past prescriptions for returning patients
   - Add new prescriptions
   - Prescription templates

2. **Patient History:**
   - View detailed patient visit history
   - See all past prescriptions for a patient
   - Medical notes

3. **Advanced Features:**
   - Notifications for new appointment requests
   - Calendar view
   - Appointment rescheduling
   - Doctor availability management

## Testing the System

### 1. Test Doctor Login
```bash
# Login as doctor
POST http://localhost:4000/api/doctors/login
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

### 2. Test Statistics
```bash
GET http://localhost:4000/api/doctors/dashboard/stats
Headers: Authorization: Bearer {token}
```

### 3. Test Appointments
```bash
GET http://localhost:4000/api/doctors/appointments/all
Headers: Authorization: Bearer {token}
```

### 4. Test Accept Appointment
```bash
POST http://localhost:4000/api/doctors/appointments/{appointmentId}/accept
Headers: Authorization: Bearer {token}
```

### 5. Test Reject Appointment
```bash
POST http://localhost:4000/api/doctors/appointments/{appointmentId}/reject
Headers: Authorization: Bearer {token}
Body: {
  "rejectionReason": "Not available at this time",
  "alternativeSuggestions": "Try Dr. Smith instead"
}
```

## Notes

- Doctor tokens are stored in `localStorage` as `doctorToken`
- Doctor data is stored in `localStorage` as `doctor`
- All protected routes require `Authorization: Bearer {token}` header
- The system uses `doctorAuth` middleware for doctor-specific routes
- Appointments are tracked with full patient details for context












