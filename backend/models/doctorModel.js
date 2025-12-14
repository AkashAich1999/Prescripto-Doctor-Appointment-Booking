import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    speciality: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    fees: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    slots_booked: {
        type: Object,
        default: {}
    }
}, { minimize: false, timestamps: true });

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;

{/* 
    NOTE: 2 Suggestions (Will apply/check it little later)
    
    1. address: {
         type: Object,     // No structure! Accepts ANY object
         required: true
       }
       
       address: {
         street: String,
         city: String
       },
    
    2.  date: { type: Number, required: true },   // Unclear purpose. Timestamp? Slot number? What does it represent ?
        date: { type: Date, default: Date.now },  // Clear purpose
*/}    

{/*
    How Mongoose stores models internally:
    When we write:
    mongoose.model("Doctor", doctorSchema);

    Mongoose internally stores the model like this:
    mongoose.models = {
  Doctor: Model,
};

    Important

The key name is exactly the model name you pass

It is case-sensitive


    mongoose.model("Doctor", ...)

    creates mongoose.models.Doctor
    NOT mongoose.models.doctor
*/}