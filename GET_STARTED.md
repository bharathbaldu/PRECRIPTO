# 🏥 PRESCRIPTO - Getting Started Guide

## 📋 Quick Start Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

---

## 🚀 Step 1: Backend Setup

```bash
# Navigate to backend directory
cd PRESCRIPTO/backend

# Install dependencies
npm install

# Create .env file with your configuration
# Copy from environment.txt and fill in your values

# Start the server
npm start
```

Backend will run on: **http://localhost:4000**

---

## 🎨 Step 2: Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd PRESCRIPTO/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 💾 Step 3: Database Setup

### Option A: Use Existing Seed Data
```bash
cd PRESCRIPTO/backend
node seedDoctors.js
```

This will create 10 doctors with unique images across all specialties.

### Option B: Create Your Own Data
1. Register accounts through the UI
2. Add doctors through admin panel (future feature)

---

## ✅ Step 4: Test the Application

1. Open browser: **http://localhost:5173**
2. Register/Login
3. Browse doctors
4. Book appointments
5. Test AI chatbot

---

## 🎯 Features You Can Test

### 🔐 Authentication
- Register new account
- Login with credentials
- View profile with health info

### 👨‍⚕️ Doctor Directory
- View all 10 doctors
- See different specialties
- View doctor details & images

### 📅 Appointments
- Book appointments
- View booking confirmation
- Manage appointments

### 🤖 AI Chatbot
- Ask about symptoms
- Get medication suggestions
- Health screening (mentions BP/diabetes recommends doctor)

### 📋 Profile Management
- Update personal info
- Add health metrics (BP, sugar, etc.)
- Upload profile photo

---

## 📁 Project Structure

```
PRESCRIPTO/
├── backend/               # Node.js API
│   ├── config/           # Database & Cloudinary config
│   ├── controllers/      # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth & error handling
│   └── server.js         # Main server file
│
├── frontend/              # React Application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context API
│   │   ├── assets/       # Images & icons
│   │   └── App.jsx       # Main App component
│   └── package.json
│
└── GET_STARTED.md         # This file
```

---

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/PRESCRIPTO

# JWT Secret
JWT_SECRET=your_secret_key_here

# JWT Expiry
JWT_EXPIRE=7d

# Server Port
PORT=4000

# Client URL
CLIENT_URL=http://localhost:5173

# Environment
NODE_ENV=development

# AI Chatbot (Optional)
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (Optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🐛 Troubleshooting

### Backend Not Starting
- Check if MongoDB is running
- Verify `.env` file exists with correct values
- Ensure port 4000 is not in use

### Frontend Not Starting
- Verify Node.js is installed
- Check if port 5173 is available
- Install dependencies: `npm install`

### Database Connection Error
- Start MongoDB service
- Check connection string in `.env`
- Verify MongoDB is installed

---

## 📞 Support

For issues or questions:
1. Check the error messages in console
2. Review the code comments
3. Verify all dependencies are installed

---

## 🎉 You're All Set!

Your PRESCRIPTO application is ready to use. Enjoy exploring all the features!

**Happy Coding! 🚀**













