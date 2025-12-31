import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found", });
    }

    await doctorModel.findByIdAndUpdate(docId, {
      available: !doctor.available,
    });

    res.status(200).json({ success: true, message: "Availability Changed" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(['-password', '-email']);
    res.status(200).json({ success:true, doctors });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

// API for Doctor Login
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate Input.
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // 2. Find Doctor.
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.status(401).json({ success:false, message:"Invalid Credentials" });
    }

    // 3. Compare Password.
    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({ success:false, message:"Invalid Credentials" });
    }

    // 4. Generate token.
    const token = jwt.sign(
      { id: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ success:true, token })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}