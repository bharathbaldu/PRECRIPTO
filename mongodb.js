import mongoose from "mongoose"

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected',()=>{console.log("✅ MongoDB Connected Successfully!")})
        mongoose.connection.on('error',(err)=>{console.log("❌ MongoDB Connection Error:", err.message)})
        mongoose.connection.on('disconnected',()=>{console.log("⚠️ MongoDB Disconnected")})
        
        await mongoose.connect(`${process.env.MONGODB_URL}/doctor`)
        console.log("🔗 MongoDB connection established")
    } catch (error) {
        console.log("❌ MongoDB connection failed:", error.message)
        console.log("⚠️ Server will continue without database connection")
    }
}
export default connectDB