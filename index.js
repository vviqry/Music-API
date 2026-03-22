require("dotenv").config(); // Load environment variables dari .env
const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 1. KONEKSI KE MONGODB
// ============================================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Berhasil terhubung ke MongoDB Atlas"))
  .catch((err) => console.error("❌ Gagal terhubung ke MongoDB:", err));

// ============================================================
// 2. SCHEMA MONGODB (Mongoose Model)
// ============================================================
// Skema untuk menyimpan data musik di database
const musicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  path: { type: String, required: true }, // URL Cloudinary
  createdAt: { type: Date, default: Date.now }
});

const Music = mongoose.model("Music", musicSchema);

// ============================================================
// 3. KONFIGURASI CLOUDINARY
// ============================================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================================
// 4. KONFIGURASI MULTER STORAGE (Ke Cloudinary)
// ============================================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "music_api", // Nama folder di Cloudinary
    resource_type: "video", // MP3 masuk ke tipe "video" di Cloudinary
    allowed_formats: ["mp3", "mpeg"], // Validasi tipe file
  },
});

const upload = multer({ storage: storage });

// ============================================================
// 5. KONFIGURASI EXPRESS.STATIC
// ============================================================
// Tetap dipakai untuk melayani file frontend (index.html)
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// 6. ENDPOINT: POST /upload
// ============================================================
app.post("/upload", upload.single("music"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada file yang diupload. Pastikan field bernama 'music'.",
      });
    }

    // req.file.path sekarang berisi URL langung dari Cloudinary
    // req.file.filename berisi ID unik dari Cloudinary

    // Simpan data ke MongoDB
    const newMusic = new Music({
      name: req.file.originalname.replace(".mp3", ""), // Ambil nama file asli
      cloudinaryId: req.file.filename,
      path: req.file.path, // URL file MP3 di Cloudinary
    });

    await newMusic.save();

    res.status(201).json({
      status: "success",
      message: "File musik berhasil diupload ke Cloudinary dan disimpan ke DB!",
      data: {
        id: newMusic._id,
        name: newMusic.name,
        path: newMusic.path,
      },
    });
  } catch (error) {
    console.error("Error upload:", error);
    res.status(500).json({ status: "error", message: "Gagal menyimpan file." });
  }
});

// ============================================================
// 7. ENDPOINT: GET /list
// ============================================================
app.get("/list", async (req, res) => {
  try {
    // Ambil semua data musik dari MongoDB dan urutkan berdasarkan waktu paling baru
    const musicList = await Music.find().sort({ createdAt: -1 });

    // Format ulang agar sesuai dengan respons sebelumnya (menggunakan id alih-alih _id)
    const formattedData = musicList.map(music => ({
      id: music._id,
      name: music.name,
      path: music.path
    }));

    res.status(200).json({
      status: "success",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error get list:", error);
    res.status(500).json({ status: "error", message: "Gagal mengambil data." });
  }
});

// ============================================================
// 8. ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
  next();
});

// ============================================================
// JALANKAN SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`🎵 Server Music API berjalan di http://localhost:${PORT}`);
  console.log(`🚀 Mode: Database (MongoDB) & Cloud Storage (Cloudinary)`);
});
