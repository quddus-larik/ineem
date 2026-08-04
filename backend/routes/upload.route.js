import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

let uploadedFile = null;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), "uploads");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage });

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Hello World!"
    });
});

router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    uploadedFile = req.file;
    res.status(201).json({
        message: "File uploaded successfully",
        file: req.file
    });
});

export const PdfRoute = router;
