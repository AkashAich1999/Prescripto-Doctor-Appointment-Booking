import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// API to Register User.
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    // Proper Input Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    // Email Validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid email" });
    }

    // Password Strength Check.
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // 2. Check Existing User.
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // 3. Hash Password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save User.
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword
    });

    // 5. Generate Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 6. Proper Success Response.
    return res.status(201).json({ success: true, token });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// API for User Login.
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success:false, message:"User does not Exists." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            res.status(200).json({ success:true, token });
        } else {
            res.status(401).json({ success:false, message: "Invalid Credentials" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// API to Get User Profile Data. 
export const getProfile = async (req, res) => {

  try {
    const userId = req.userId; // already attached by authUser middleware.
    const userData = await userModel.findById(userId).select("-password");

    res.status(200).json({ success:true, userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// API to Update User Profile Data.
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;  // from authUser middleware
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !address || !dob) {
      return res.status(400).json({ success:false, message:"Data Missing." });
    }

    // await userModel.findByIdAndUpdate(userId, { name, phone, address:JSON.parse(address), dob, gender });

    // Safely parse address
    let parsedAddress;
    try {
      parsedAddress = typeof address === "string" ? JSON.parse(address) : address;
    } catch {
      return res.status(400).json({ success: false, message: "Invalid Address Format" });
    }

    // Build update object
    const updateData = {
      name,
      phone,
      address: parsedAddress,
      dob,
    };

    // KEY FIX
    if (gender === "Male" || gender === "Female") {
      updateData.gender = gender;
    }

    if (imageFile) {
      // Upload Image to Cloudinary.
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type:"image" });
      updateData.image = imageUpload.secure_url;
    }

    await userModel.findByIdAndUpdate(userId, updateData, { new: true });  // { new: true } ensures MongoDB returns the updated document. user will contain the UPDATED document (after update).

    res.status(200).json({ success:true, message:"Profile Updated" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// API to Book Appointment.
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    // console.log("docId received:", docId);
    // console.log("docData found:", docData);
    
    if (!docData || !docData?.available) {
      return res.status(400).json({ success:false, message:"Doctor Not Available." });
    }

    let all_slots_booked = { ...docData.slots_booked };

    // Slot Availability Check
    if (all_slots_booked[slotDate]?.includes(slotTime)) {
      return res.status(400).json({ success: false, message: "Slot Not Available." });
    }

    if (!all_slots_booked[slotDate]) {
      all_slots_booked[slotDate] = [];
    }
    all_slots_booked[slotDate].push(slotTime);

    const userData = await userModel.findById(userId).select("-password");
    
    const docDataObj = docData.toObject();
    delete docDataObj.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: docDataObj,
      amount: docData.fees,
      slotTime,
      slotDate,
      date:Date.now()
    }

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // Save New Slots Data in docData.
    await doctorModel.findByIdAndUpdate(docId, { slots_booked: all_slots_booked });

    res.status(200).json({ success:true, message:"Appointment Booked" })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// API to Get User Appointments for Frontend (my-appointments) Page 
export const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });

    res.status(200).json({ success:true, appointments });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// API to Cancel Appointment
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    // 1. Find Appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment Not Found" });
    }

    // 2. Authorization Check (User can Cancel Only Own Appointment)
    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized Action" });
    }

    // 3. Prevent Double Cancellation
    if (appointment.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment Already Cancelled" });
    }

    // 4. Mark Appointment as Cancelled
    appointment.cancelled = true;
    await appointment.save();

    // 5. Remove Slot from doctor's slots_booked
    const doctor = await doctorModel.findById(appointment.docId);

    if (doctor && doctor.slots_booked) {
      const { slotDate, slotTime } = appointment;

      if (doctor.slots_booked[slotDate]) {
        doctor.slots_booked[slotDate] = doctor.slots_booked[slotDate].filter(time => time !== slotTime);

        // Remove date key if empty
        if (doctor.slots_booked[slotDate].length === 0) {
          delete doctor.slots_booked[slotDate];
        }

        // THIS LINE FIXES EVERYTHING
        doctor.markModified("slots_booked");
        await doctor.save();
      }
    }

    return res.status(200).json({ success: true, message: "Appointment Cancelled Successfully", updatedDoctor:doctor });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}


{/* 
  JSON.parse() converts a JSON-formatted string into a JavaScript object (or array, number, etc.).
  
  e.g.,
      const jsonString = '{"name":"Akash","age":25}';
      const obj = JSON.parse(jsonString);

      console.log(obj.name); // Akash
      console.log(obj.age);  // 25

  Before Parse: Data is just Text.
  After Parse: Data becomes a real JavaScript Object.
*/}

{/*

  Current Buggy Logic:

  const updateData = {
    name,
    phone,
    address: parsedAddress,
    dob,
    gender,   // ❌ overwrites with null
  };


  ❌ Wrong Validation
  if (!name || !phone || !address || !dob || !gender) {
    return res.status(400).json({ success:false, message:"Data Missing." });
  }

  ✅ Correct Validation
  if (!name || !phone || !address || !dob) {
    return res.status(400).json({ success: false, message: "Data Missing." });
  }


*/}


{/*
  CRITICAL DIFFERENCE: Reference vs Copy! 
  
  1. let all_slots_booked = docData.slots_booked;

     // SAME REFERENCE (Dangerous!)
     let all_slots_booked = docData.slots_booked;
     all_slots_booked[0] = "NEW";  // Changes ORIGINAL docData too!

     What happens:
     • all_slots_booked points to the SAME object in memory.
     • Mutating one = mutating both.
     • Side effects everywhere!

  2. const all_slots_booked = { ...docData.slots_booked };
     
     // INDEPENDENT COPY (Safe!)
     const all_slots_booked = { ...docData.slots_booked };
     all_slots_booked[0] = "NEW";  // Original docData UNCHANGED!
     
     What happens:
     • { ... } creates shallow copy (new object)
     • Changes to copy don't affect original 

*/}

{/*
    delete docData.slots_booked;  
    This means are mutating a mongoose document, which is wrong.  

    Why this is wrong:
    • docData is a mongoose document.
    • Mutating it directly is unsafe.

    const docDataObj = docData.toObject();
    delete docDataObj.slots_booked;
    
    Then use docDataObj, NOT docData.
*/}

/*
  In the following line: 
    if (appointment.userId.toString() !== req.userId)  
  Why we are using toString() ?

  In MongoDB (via Mongoose):
    appointment.userId
  is NOT a string.
  
  It is a MongoDB ObjectId:
    ObjectId("693c3241e1b4198dc06c7964")
  Type:
    typeof appointment.userId   // "object" 

  What is req.userId ?
  From your JWT middleware, you usually set:
    req.userId = decodedToken.id;
  That is a string:
    "693c3241e1b4198dc06c7964"
  Type:
    typeof req.userId   // "string"  
*/

/*
  doctor.markModified("slots_booked");

  Why it worked ?
  • slots_booked is a nested object
  • Mongoose does not detect direct mutations inside plain objects
  • Without markModified, doctor.save() silently does nothing
  • With it, Mongoose forces MongoDB to update the field
*/