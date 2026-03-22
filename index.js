require("dotenv").config(); // Load environment variables dari .env
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parse JSON body
app.use(express.json());

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
const musicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cloudinaryId: { type: String, required: true },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
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
// 4. EXPRESS.STATIC — Serve frontend (index.html)
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// 5. ENDPOINT: GET /config
// ============================================================
// Mengirim cloud_name ke frontend agar bisa upload langsung
// ke Cloudinary dari browser (tanpa lewat server).
// ============================================================
app.get("/config", (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// ============================================================
// 6. ENDPOINT: GET /sign-upload
// ============================================================
// Membuat signature agar frontend bisa upload langsung ke
// Cloudinary dengan aman (signed upload). Ini menghindari
// batas 4.5MB dari Vercel serverless functions.
// ============================================================
app.get("/sign-upload", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "music_api",
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});

// ============================================================
// 7. ENDPOINT: POST /save
// ============================================================
// Setelah frontend berhasil upload ke Cloudinary, frontend
// mengirim metadata (nama, cloudinaryId, url) ke endpoint ini
// untuk disimpan ke MongoDB.
// ============================================================
app.post("/save", async (req, res) => {
  try {
    const { name, cloudinaryId, url } = req.body;

    if (!name || !cloudinaryId || !url) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak lengkap (name, cloudinaryId, url diperlukan).",
      });
    }

    const newMusic = new Music({
      name,
      cloudinaryId,
      path: url,
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
    console.error("Error save:", error);
    res.status(500).json({ status: "error", message: "Gagal menyimpan data." });
  }
});

// ============================================================
// 8. ENDPOINT: GET /list
// ============================================================
app.get("/list", async (req, res) => {
  try {
    const musicList = await Music.find().sort({ createdAt: -1 });

    const formattedData = musicList.map((music) => ({
      id: music._id,
      name: music.name,
      path: music.path,
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
// 9. ERROR HANDLER
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

// Export untuk Vercel Serverless
module.exports = app;
