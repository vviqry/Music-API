const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// ============================================================
// DATABASE SEMENTARA (In-Memory Array)
// ============================================================
// Array ini berfungsi sebagai pengganti database.
// Setiap kali server di-restart, data akan hilang.
// ============================================================
const musicList = [];
let idCounter = 1;

// ============================================================
// KONFIGURASI MULTER (diskStorage)
// ============================================================
// multer.diskStorage() memungkinkan kita mengontrol:
//   - destination: folder tujuan penyimpanan file yang diupload.
//   - filename: penamaan file yang disimpan di server.
//
// Di sini file akan disimpan ke folder ./public/music
// dengan format nama: timestamp-namafileoriginal.mp3
// Timestamp ditambahkan agar tidak terjadi duplikasi nama file.
// ============================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan folder tujuan upload
    cb(null, path.join(__dirname, "public", "music"));
  },
  filename: function (req, file, cb) {
    // Buat nama file unik: timestamp + nama asli file
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// ============================================================
// FILE FILTER — Validasi Tipe File (Hanya MP3)
// ============================================================
// fileFilter digunakan untuk memvalidasi tipe file sebelum
// disimpan. Jika file bukan MP3, upload akan ditolak dengan
// pesan error.
// ============================================================
const fileFilter = function (req, file, cb) {
  // Cek apakah mimetype file adalah audio/mpeg (MP3)
  if (file.mimetype === "audio/mpeg") {
    cb(null, true); // File diterima
  } else {
    cb(new Error("Hanya file MP3 yang diperbolehkan!"), false); // File ditolak
  }
};

// Inisialisasi multer dengan konfigurasi storage dan fileFilter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// ============================================================
// KONFIGURASI EXPRESS.STATIC
// ============================================================
// express.static() adalah middleware bawaan Express yang
// berfungsi untuk menyajikan (serve) file statis seperti
// gambar, CSS, JavaScript, dan file audio.
//
// Dengan konfigurasi di bawah, semua file yang ada di folder
// ./public bisa diakses langsung lewat browser.
//
// Contoh: file yang tersimpan di ./public/music/lagu.mp3
// bisa diakses melalui URL: http://localhost:3000/music/lagu.mp3
// ============================================================
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// ENDPOINT: POST /upload
// ============================================================
// Endpoint ini menerima file MP3 melalui form-data dengan
// field name "music". Setelah berhasil diupload, data musik
// (id, name, path) akan disimpan ke array musicList.
// ============================================================
app.post("/upload", upload.single("music"), (req, res) => {
  // Jika tidak ada file yang diupload
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "Tidak ada file yang diupload.",
    });
  }

  // Buat object data musik baru
  const newMusic = {
    id: idCounter++,
    name: req.file.originalname.replace(".mp3", ""), // Ambil nama tanpa ekstensi
    path: `http://localhost:${PORT}/music/${req.file.filename}`, // URL akses file
  };

  // Simpan ke array (database sementara)
  musicList.push(newMusic);

  // Kirim respons sukses
  res.status(201).json({
    status: "success",
    message: "File musik berhasil diupload!",
    data: newMusic,
  });
});

// ============================================================
// ENDPOINT: GET /list
// ============================================================
// Endpoint ini menampilkan seluruh daftar musik yang sudah
// diupload, dalam format JSON (array of objects).
// ============================================================
app.get("/list", (req, res) => {
  res.status(200).json({
    status: "success",
    data: musicList,
  });
});

// ============================================================
// ERROR HANDLER — Menangkap Error dari Multer
// ============================================================
// Middleware ini menangkap error yang dilempar oleh Multer,
// misalnya saat file yang diupload bukan MP3.
// ============================================================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error dari Multer (misal: file terlalu besar)
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }

  if (err) {
    // Error custom dari fileFilter (bukan MP3)
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
  console.log(`📂 Upload musik  : POST http://localhost:${PORT}/upload`);
  console.log(`📋 Daftar musik  : GET  http://localhost:${PORT}/list`);
  console.log(`🎧 Akses file    : http://localhost:${PORT}/music/<nama_file>.mp3`);
});
