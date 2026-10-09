# 🏥 Patient Portal Login Guide

## ✅ Access Your Patient Portal

**URL:** http://localhost:5175

(Port 5175 because 5173 and 5174 were already in use)

## 📝 How to Login to Patient Portal

### Option 1: Register a New Account

1. **Go to:** http://localhost:5175
2. Click **"Login"** in the navigation
3. You'll see the login form
4. Click **"Don't have an account? Sign Up"**
5. Fill in the registration form:
   - **Full Name:** Your name
   - **Email:** your@email.com
   - **Phone Number:** +1234567890
   - **Password:** Must be strong:
     - At least 8 characters
     - One uppercase letter
     - One lowercase letter
     - One number
     - One special character

6. Click **"Create Account"**
7. You'll be automatically logged in!

### Option 2: Login with Existing Account

If you already have an account:

1. Go to: http://localhost:5175/login
2. Enter:
   - **Email or Phone:** your@email.com or your phone number
   - **Password:** your password
3. Click **"Login"**

## 🔐 Test Account (Register First)

The system doesn't have pre-seeded user accounts. You need to register first.

**Example Registration:**
```
Name: John Doe
Email: john@example.com
Phone: +1234567890
Password: Password123!
```

After registration, use:
- **Email:** john@example.com
- **Password:** Password123!

## 🎯 After Login

Once logged in, you can:

1. **Browse Doctors**
   - Homepage shows "Top Doctors To Book"
   - Click any doctor card

2. **Book an Appointment**
   - Select date (next 7 days)
   - Select time slot
   - Enter reason for appointment
   - Click "Book Appointment"

3. **View Your Appointments**
   - Go to "My Appointments" in navigation
   - See all your bookings
   - View status (pending/accepted/rejected)

4. **View Profile**
   - Click your name/profile icon
   - Go to "My Profile"
   - Edit your information

## 🐛 Troubleshooting

### "Network error"
- Check if backend is running on port 4000
- Check browser console (F12) for errors
- Verify API: http://localhost:4000/

### "Invalid credentials"
- Make sure you registered first
- Check if email/password is correct
- Try registering a new account

### "Password too weak"
- Password must meet all requirements:
  - 8+ characters
  - Uppercase letter
  - Lowercase letter
  - Number
  - Special character (!@#$%^&*)

### Can't see login page
- Make sure patient frontend is running on port 5175
- Check: http://localhost:5175
- If port 5175 not working, check which ports are in use

## 🚀 Quick Start Test

### Step 1: Register
```
Go to: http://localhost:5175/login
Click: "Sign Up"
Fill in:
  Name: Test User
  Email: test@example.com
  Phone: +1234567890
  Password: Test123!@#
```

### Step 2: Book Appointment
```
Browse doctors on homepage
Click any doctor
Select date: Tomorrow
Select time: 10:00 AM
Reason: "Regular checkup"
Click "Book Appointment"
```

### Step 3: Check Status
```
Go to "My Appointments"
See your appointment with status: "pending"
```

### Step 4: Login as Doctor
```
Go to: http://localhost:5174/login
Email: dr.davis@example.com
Password: password123
Appointments tab → See your appointment!
Accept or Reject
```

### Step 5: Back to Patient
```
Go to: http://localhost:5175/my-appointments
See updated status!
```

## 🎉 Success!

You should now be able to:
- ✅ Register as patient
- ✅ Login to patient portal
- ✅ Browse all doctors
- ✅ Book appointments
- ✅ See appointment status
- ✅ View doctor's response

**The system is fully connected!** 🎊












