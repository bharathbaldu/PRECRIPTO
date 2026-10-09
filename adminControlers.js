import doctorModel from "../models/DoctorModel.js"
import bcrypt from "bcryptjs"

const adddoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body

        // Check if doctor already exists
        const existingDoctor = await doctorModel.findOne({ email })
        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor already exists", success: false })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new doctor
        const newDoctor = await doctorModel.create({
            name,
            email,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address,
            image: req.file ? req.file.path : null
        })

        res.status(201).json({
            message: "Doctor added successfully",
            success: true,
            doctor: newDoctor
        })

    } catch (error) {
        console.error("❌ Add doctor error:", error)
        res.status(500).json({ message: "Failed to add doctor", success: false })
    }
}

export { adddoctor }