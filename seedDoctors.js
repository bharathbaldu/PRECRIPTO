import mongoose from 'mongoose'
import doctorModel from './models/DoctorModel.js'
import bcrypt from 'bcryptjs'
import connectDB from './config/database.js'

// Connect to database
await connectDB()

// Hash password helper
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

// Sample doctors data - Covering all departments
const doctors = [
  {
    name: 'Dr. Christopher Davis',
    email: 'dr.davis@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    speciality: 'General physician',
    degree: 'MBBS, MD',
    experience: '8 Years',
    about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 500,
    address: {
      line1: '17th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC001',
    available: true
  },
  {
    name: 'Dr. Emily Larson',
    email: 'dr.larson@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1594824476968-48aa8b67db9d?w=400&h=400&fit=crop',
    speciality: 'Gynecologist',
    degree: 'MBBS, DGO',
    experience: '10 Years',
    about: 'Dr. Larson specializes in women\'s health and provides comprehensive gynecological care including prenatal and postnatal care.',
    fees: 600,
    address: {
      line1: '27th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC002',
    available: true
  },
  {
    name: 'Dr. Sarah Patel',
    email: 'dr.patel@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    speciality: 'Dermatologist',
    degree: 'MBBS, MD Dermatology',
    experience: '7 Years',
    about: 'Dr. Patel specializes in skin care, dermatological treatments, and cosmetic dermatology.',
    fees: 700,
    address: {
      line1: '37th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC003',
    available: true
  },
  {
    name: 'Dr. James Wilson',
    email: 'dr.wilson@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1609342122563-a43ac4917ab0?w=400&h=400&fit=crop',
    speciality: 'Pediatricians',
    degree: 'MBBS, MD Pediatrics',
    experience: '12 Years',
    about: 'Dr. Wilson is an experienced pediatrician specializing in child healthcare from infancy to adolescence.',
    fees: 550,
    address: {
      line1: '47th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC004',
    available: true
  },
  {
    name: 'Dr. Michael Chen',
    email: 'dr.chen@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    speciality: 'Neurologist',
    degree: 'MBBS, MD Neurology',
    experience: '15 Years',
    about: 'Dr. Chen specializes in diagnosing and treating disorders of the nervous system including brain, spinal cord, and nerves.',
    fees: 800,
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC005',
    available: true
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'dr.sharma@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1559839734-5b48f5e38c35?w=400&h=400&fit=crop',
    speciality: 'Gastroenterologist',
    degree: 'MBBS, MD Gastroenterology',
    experience: '9 Years',
    about: 'Dr. Sharma specializes in digestive system disorders including diseases of the stomach, intestines, liver, and gallbladder.',
    fees: 650,
    address: {
      line1: '67th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC006',
    available: true
  },
  {
    name: 'Dr. David Kumar',
    email: 'dr.kumar@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1583407723467-4b1c0c5cb5a1?w=400&h=400&fit=crop',
    speciality: 'Cardiologist',
    degree: 'MBBS, MD Cardiology',
    experience: '14 Years',
    about: 'Dr. Kumar is a renowned cardiologist specializing in heart diseases, cardiovascular conditions, and preventive cardiology.',
    fees: 850,
    address: {
      line1: '77th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC007',
    available: true
  },
  {
    name: 'Dr. Robert Singh',
    email: 'dr.singh@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1612349317108-b5df5d4b6d5b?w=400&h=400&fit=crop',
    speciality: 'Orthopedist',
    degree: 'MBBS, MS Orthopedics',
    experience: '11 Years',
    about: 'Dr. Singh specializes in treating conditions related to bones, joints, muscles, and ligaments including fractures and sports injuries.',
    fees: 750,
    address: {
      line1: '87th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC008',
    available: true
  },
  {
    name: 'Dr. Jennifer Brown',
    email: 'dr.brown@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1594824476958-2ae5e8b19f9d?w=400&h=400&fit=crop',
    speciality: 'Psychiatrist',
    degree: 'MBBS, MD Psychiatry',
    experience: '13 Years',
    about: 'Dr. Brown specializes in mental health, providing diagnosis and treatment for depression, anxiety, and other psychological disorders.',
    fees: 700,
    address: {
      line1: '97th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC009',
    available: true
  },
  {
    name: 'Dr. Alex Johnson',
    email: 'dr.johnson@example.com',
    password: await hashPassword('password123'),
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    speciality: 'Ophthalmologist',
    degree: 'MBBS, MS Ophthalmology',
    experience: '8 Years',
    about: 'Dr. Johnson specializes in eye care, treating vision problems, cataracts, glaucoma, and performing eye surgeries.',
    fees: 600,
    address: {
      line1: '107th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    },
    license: 'LIC010',
    available: true
  }
]

// Remove phone and license fields that don't exist in DoctorModel
const cleanDoctors = doctors.map(({ phone, license, ...rest }) => rest)

try {
  // Clear existing doctors
  await doctorModel.deleteMany({})
  console.log('Cleared existing doctors')
  
  // Insert new doctors
  const createdDoctors = await doctorModel.insertMany(cleanDoctors)
  console.log(`Created ${createdDoctors.length} doctors`)
  
  // List created doctors
  createdDoctors.forEach(doctor => {
    console.log(`- ${doctor.name} (${doctor.speciality}) - ID: ${doctor._id}`)
  })
  
  console.log('✅ Doctors seeded successfully!')
  process.exit(0)
} catch (error) {
  console.error('❌ Error seeding doctors:', error)
  process.exit(1)
}
