import express from "express";
import cors from "cors";
import "dotenv/config"
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

const app = express();
const port = process.env.PORT || 4000;

connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.get("/", (_req, res) => {
    res.send("API Working !");
});

connectDB().then(() => (
    app.listen(port, () => {
        console.log("Server Started on PORT:", port);
    })
));