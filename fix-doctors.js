import mongoose from 'mongoose'
import doctorModel from './models/DoctorModel.js'
import connectDB from './config/database.js'

// Connect to database
await connectDB()

try {
  // Drop the doctors collection to start fresh
  await doctorModel.collection.drop()
  console.log('✅ Dropped doctors collection')
  
  console.log('\n✅ Database cleaned. Now run: node seedDoctors.js\n')
  process.exit(0)
} catch (error) {
  if (error.codeName === 'NamespaceNotFound') {
    console.log('ℹ️  Doctors collection does not exist yet')
  } else {
    console.error('❌ Error:', error.message)
  }
  process.exit(1)
}












