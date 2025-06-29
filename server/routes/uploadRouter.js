const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const router = express.Router();

const { v2: cloudinary } = require("cloudinary");

const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "請上傳圖片" });
  }

  const localPath = req.file.path;
  try {
    const result = await cloudinary.uploader.upload(localPath);

    fs.unlinkSync(localPath);

    res.json({ msg: "圖片上傳成功", url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary 上傳失敗：", error);
    res
      .status(500)
      .json({ error: "上傳 Cloudinary 失敗", details: error.message });
  }
});

// 舊的
// const uploadDir = path.join(__dirname, "../public/uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });

// const upload = multer({ storage });

// router.post("/upload", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "請上傳圖片" });
//   }

//   const imageUrl = `/uploads/${req.file.filename}`;
//   res.json({ msg: "圖片上傳成功", url: imageUrl });
// });

module.exports = router;
