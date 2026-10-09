# Quick Start - Doctor Login Fix

## The Problem
The login was failing because there were no doctors in the database, or the doctors weren't properly hashed.

## Solution

### Step 1: Seed the Database with Doctor Accounts

Open a terminal and run:

```bash
cd PRESCRIPTO/backend
node seedDoctors.js
```

This will create 10 doctor accounts with the following credentials:
- **Email**: Any of the emails below
- **Password**: `password123`

### Available Doctor Accounts:

1. `dr.davis@example.com` - General physician
2. `dr.larson@example.com` - Gynecologist
3. `dr.patel@example.com` - Dermatologist
4. `dr.wilson@example.com` - Pediatricians
5. `dr.chen@example.com` - Neurologist
6. `dr.sharma@example.com` - Gastroenterologist
7. `dr.kumar@example.com` - Cardiologist
8. `dr.singh@example.com` - Orthopedist
9. `dr.brown@example.com` - Psychiatrist
10. `dr.johnson@example.com` - Ophthalmologist

**All passwords: `password123`**

### Step 2: Start the Backend Server

```bash
cd PRESCRIPTO/backend
npm start
```

Backend should run on `http://localhost:4000`

### Step 3: Start the Doctor Portal Frontend

In a new terminal:

```bash
cd PRESCRIPTO/frontedoctor
npm run dev
```

Doctor portal should run on `http://localhost:5174`

### Step 4: Login

1. Open `http://localhost:5174/login`
2. Use any of the doctor emails above
3. Password: `password123`
4. Click Login

You should now see the doctor dashboard!

## Troubleshooting

### If login still fails:

1. **Check if backend is running:**
   ```bash
   curl http://localhost:4000/
   ```
   Should return: `{"message": "PRESCRIPTO API is working!"}`

2. **Check if doctors were created:**
   ```bash
   curl http://localhost:4000/api/doctors/
   ```
   Should return a list of doctors

3. **Test login via API:**
   ```bash
   curl -X POST http://localhost:4000/api/doctors/login \
     -H "Content-Type: application/json" \
     -d '{"email":"dr.davis@example.com","password":"password123"}'
   ```
   Should return: `{"token":"...", "doctor":{...}, "success":true}`

4. **Check browser console** (F12) for any JavaScript errors

5. **Check browser Network tab** to see if the login request is being made and what response is returned

## Manual Registration (Alternative)

If you prefer, you can also register a new doctor account:

```bash
curl -X POST http://localhost:4000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test Doctor",
    "email": "test@example.com",
    "password": "password123",
    "speciality": "General physician",
    "degree": "MBBS",
    "experience": "5 Years",
    "about": "Test doctor",
    "fees": 500,
    "address": {"line1": "123 Test St", "line2": "Suite 1"}
  }'
```

Then login with:
- Email: `test@example.com`
- Password: `password123`

## What Was Fixed

1. ✅ Updated `seedDoctors.js` to use proper password hashing
2. ✅ Fixed model reference to use `doctorModel` instead of `Doctor`
3. ✅ Removed fields that don't exist in the schema (phone, license)
4. ✅ All passwords are now properly hashed with bcrypt

## Next Steps

Once logged in, you can:
- View your dashboard with statistics
- See pending appointment requests
- Accept or reject appointments
- View patient details
- Track your patient statistics












