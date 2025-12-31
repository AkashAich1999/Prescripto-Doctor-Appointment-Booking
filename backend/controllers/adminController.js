import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js"

// API : Add New Doctor
export const addDoctor = async (req, res) => {
    try {
        // Step 1: Extract doctor details from request body.
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        // Step 2: Extract uploaded image file. (comes from Multer middleware)
        const imageFile = req.file;     // req.file comes from Multer middleware.
        
        // console.log({ name, email, password, speciality, degree, experience, about, fees, address }, imageFile);

        // Step 3: Validate required fields.
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.status(400).json({ success: false, message: "Missing required details" });
        }

        // Step 4: Validate image upload.
        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Doctor image is required" });
        }

        // Step 5: Validate email format.
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email" });
        }

        // Step 6: Validate password strength.
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // Step 7: Hash password using bcrypt.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Step 8: Upload image to Cloudinary.
        const imageUpload = await cloudinary.uploader.upload( imageFile.path, { resource_type: "image" } );
        // Step 9: Get secure image URL from Cloudinary.
        const imageUrl = imageUpload.secure_url
        
        // Step 10: Prepare doctor data object.
        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),   // address sent as JSON string
            date: Date.now()
        }

        // Step 11: Save doctor data to database.
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();
        
        // Step 12: Send success response.
        return res.status(201).json({ success: true, message: "Doctor added successfully" });

    } catch (error) {
        console.log(error);

        // Handle server errors.
        return res.status(500).json({ success: false, message: error.message });
    }
}

// API : Admin Login
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

         // Step 1: Check admin email
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Step 2: Compare entered password with hashed password
        const isPasswordMatch = await bcrypt.compare( password, process.env.ADMIN_PASSWORD_HASH );

        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Step 3: Generate JWT token
        const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "1d" });
            
        // Step 4: Send success response
        return res.status(200).json({ success: true, token });
        
    } catch (error) {
        console.log(error);

        // Handle server errors.
        return res.status(500).json({ success: false, message: "Server error" });
    }
}

// API to Get All Doctors from Database. (for Admin Panel)
export const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to fetch doctors" });
  }
};

// API to Get All Appointments List.
export const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({});
        return res.status(200).json({ success:true, appointments });
    } catch (error) {
       console.log(error);
       return res.status(500).json({ success: false, message: error.message }); 
    }
}

// API for Appointment Cancellation.
export const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // 1. Find Appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment Not Found" });
    }

    // 2. Prevent Double Cancellation
    if (appointment.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment Already Cancelled" });
    }

    // 3. Cancel Appointment.
    appointment.cancelled = true;
    await appointment.save();

    // 5. Remove Slot from Doctor's slots_booked
    const doctor = await doctorModel.findById(appointment.docId);

    if (doctor?.slots_booked) {
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

    return res.status(200).json({ success: true, message: "Appointment Cancelled Successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

// API to Get Dashboard Data for Admin Panel.
export const adminDashboard = async (req, res) => {

  try {
    const doctorsCount = await doctorModel.countDocuments();
    const usersCount = await userModel.countDocuments();
    const appointmentsCount = await appointmentModel.countDocuments();

    const latestAppointments = await appointmentModel.find({}).sort({ createdAt:-1 }).limit(5);
    
    const dashData = {
      doctors: doctorsCount,
      appointments: appointmentsCount,
      patients: usersCount,
      latestAppointments,  // latestAppointments: latestAppointments
    }

    return res.status(200).json({ success:true, dashData });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to Load Dashboard Data" });
  }
}

{/* 
    Q. What is req.file ?
    => req.file is an object that contains the information of a single uploaded file when using Multer’s upload.single() middleware.
    
       Example:

       app.post('/upload', upload.single('image'), (req, res) => {
          console.log(req.file); 
       });

       If a user uploads an image, req.file will contain details like :

       {
        "fieldname": "image",
        "originalname": "photo.png",
        "encoding": "7bit",
        "mimetype": "image/png",
        "destination": "./public",
        "filename": "photo.png",
        "path": "public/photo.png",
        "size": 19392
        } 
*/}

{/* 
    Step 8: Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(
        imageFile.path,
        { resource_type: "image" }
    ); 
    
    Q. What imageFile.path is:
     • imageFile comes from Multer (req.file)
     • Since Multer is configured with diskStorage, it saves the uploaded file temporarily on our server.
     • imageFile.path is the local file system path of that uploaded image
       Example: uploads/doctor-1723456789123.jpg

    Q. What cloudinary.uploader.upload() does:
     • Reads the file from the given path.
     • Uploads it to Cloudinary cloud storage.
     • Automatically:
       • Stores the image.
       • Optimizes it.
       • Assigns a public ID.
       • Makes it accessible via CDN.

    { resource_type: "image" } tells Cloudinary:
     • The uploaded file is an image.
     • Enables image-specific features like resizing, cropping, compression.

    Q. What imageUpload contains ?
     • imageUpload is an object returned by Cloudinary.
     • e.g.,
       {
        asset_id: "abc123",
        public_id: "doctors/xyz456",
        version: 1712345678,
        width: 800,
        height: 800,
        format: "jpg",
        resource_type: "image",
        secure_url: "https://res.cloudinary.com/.../image/upload/xyz.jpg"
       }
*/}

{/*
    Step 9: Extract secure image URL
    const imageUrl = imageUpload.secure_url;
    
    What secure_url is:
    • A HTTPS CDN URL 
    • Globally accessible
    • Optimized by Cloudinary
    • Safe for production usage

    Q. Why we store secure_url in DB ?
    We do NOT store images in MongoDB.

    Instead, we store:
     image: imageUrl

    Benefits:
    • Faster loading via CDN.
    • No heavy DB storage.
    • Easy image replacement.
    • Automatic optimization.
*/}

{/*
    Consider the following line: 
    const newDoctor = new doctorModel(doctorData);
    
    new doctorModel(doctorData);
    This does 3 things at once:
    1. Creates a NEW document instance (in memory):
       • This line does NOT save anything to the database yet.
       • It only creates a document object in RAM.
       • newDoctor   // exists only in memory

    2. Applies the Schema rules:
       • Validates fields based on schema.
       • If schema validation fails → error is thrown later on .save()

    3. Wraps Data with Mongoose document methods:
        • The object now has methods like:
          newDoctor.save()
          newDoctor.validate()
          newDoctor._id
       This is not a plain JS object anymore.   

    Note:
    “This line does not inserts data into DB”. [ .save() inserts data ]

    “This is not an ordinary object”. It’s a Mongoose document with methods.
*/}
{/*
    What happens NEXT (important)
    await newDoctor.save();

    .save() does:

    • Inserts the document into MongoDB
    • Automatically creates _id
    • Stores it in the doctors collection    
*/}