import express from "express"
import upload from "../middlewares/multer.js";
import { addDoctor, loginAdmin } from "../controllers/adminController.js";
import authAdmin from "../middlewares/authAdmin.js";

const adminRouter = express.Router();
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.post("/login", loginAdmin);

export default adminRouter;

{/* 
    upload.single('image') = "Process 1 image file from form field 'image' and put it in req.file"    
*/}