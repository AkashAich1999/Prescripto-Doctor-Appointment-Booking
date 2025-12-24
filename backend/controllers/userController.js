import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

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