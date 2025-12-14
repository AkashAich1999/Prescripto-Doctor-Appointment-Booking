import multer from "multer";

const storage = multer.diskStorage({
    // destination: (req, file, cb) => {   // cb means callback
    //     cb(null, "./public")
    // },
    filename: function(req, file, callback) {
        callback(null, file.originalname)
    }
});

const upload = multer({ storage });

export default upload;


// import multer from "multer";

// const storage = multer.memoryStorage();  // Buffer directly to Cloudinary

// const upload = multer({ 
//     storage,
//     limits: { fileSize: 5 * 1024 * 1024 }  // 5MB
// });

// export default upload;

{/*
    Multer is a Node.js middleware used with Express to handle file uploads 
    sent as multipart/form-data (like from HTML forms with <input type="file">). 
    It parses incoming requests that contain files, makes the file data available 
    on req.file / req.files, and can store them on disk or in memory.    

    Multer processes HTTP requests containing files (images, PDFs, videos) from HTML forms. 
    Normal body parsers like express.json() can't handle files - that's Multer's job.
*/}