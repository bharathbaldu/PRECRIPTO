import { v2 as cloudinary} from 'cloudinary'

const connectcloudinary = async() =>{
    try {
        cloudinary.config({
            cloud_name :process.env.COULDNAIRY_NAME,
            api_key :process.env.COULDNAIRY_API_KEY,
            api_secret :process.env.COULDNAIRY_SECRET_KEY
        })
        console.log("✅ Cloudinary configured successfully")
    } catch (error) {
        console.log("❌ Cloudinary configuration failed:", error.message)
        console.log("⚠️ Image upload features will not be available")
    }
}

export default connectcloudinary