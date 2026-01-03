import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

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

// API to Get Doctor Appointments for Doctor Panel.
export const appointmentsDoctor = async (req, res) => {
  try {
    // Get doctorId from authDoctor middleware
    const doctorId = req.doctorId;
    const appointments = await appointmentModel.find({ docId:doctorId });

    res.status(200).json({ success:true, appointments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

// API to Mark Appointment Completed for Doctor Panel.
export const appointmentComplete = async (req, res) => {
  try {
    const docId = req.doctorId;       // from authDoctor middleware
    const { appointmentId } = req.body;   // sent from frontend

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is Required", });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment Not Found", });
    }

    // Ensure Doctor owns this Appointment.
    if (appointmentData.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this appointment", });
    }

    // Mark appointment completed
    appointmentData.isCompleted = true;
    await appointmentData.save();

    return res.status(200).json({ success:true, message:"Appointment Marked as Completed", });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

// API to Cancel Appointment for Doctor Panel.
export const appointmentCancel = async (req, res) => {
  try {
    const docId = req.doctorId; // from authDoctor middleware
    const { appointmentId } = req.body; // sent from frontend

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "Appointment ID is Required" });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({ success: false, message: "Appointment Not Found" });
    }

    // Ensure Doctor Owns the Appointment
    if (appointmentData.docId.toString() !== docId) {
      return res.status(403).json({ success: false, message: "Not Authorized to Cancel This Appointment", });
    }

    // Prevent Re-Cancel
    if (appointmentData.isCancelled) {
      return res.status(400).json({ success: false, message: "Appointment Already Cancelled", });
    }

    // Cancel Appointment
    appointmentData.cancelled = true;
    await appointmentData.save();

    return res.status(200).json({ success: true, message: "Appointment Cancelled Successfully", });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};