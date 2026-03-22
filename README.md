# 🎵 Music API

A simple RESTful Music API built with **Express.js** and **Multer** for uploading, listing, and playing MP3 files directly in the browser.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-File%20Upload-FF6F00)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## ✨ Features

- **Upload MP3** — Upload music files via `POST /upload` with Multer
- **List Music** — View all uploaded music via `GET /list` as JSON
- **Play in Browser** — Stream MP3 files directly through `express.static`
- **Built-in Frontend** — Simple dark-themed web UI for upload & playback
- **File Validation** — Only `.mp3` files are accepted (MIME type check)
- **Error Handling** — Graceful error responses for invalid uploads

---

## 📂 Project Structure

```
Music-API/
├── index.js              # Main API server
├── package.json          # Project metadata & dependencies
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── public/
    ├── index.html        # Frontend UI (auto-served)
    └── music/            # Uploaded MP3 storage
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/vviqry/Music-API.git
cd Music-API

# Install dependencies
npm install

# Create upload directory (if not exists)
mkdir public\music

# Start the server
node index.js
```

The server will start at **http://localhost:3000**

---

## 📡 API Endpoints

### `POST /upload`

Upload an MP3 file.

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `music`
- File type: `.mp3` only

**Success Response (201):**
```json
{
  "status": "success",
  "message": "File musik berhasil diupload!",
  "data": {
    "id": 1,
    "name": "Song Title",
    "path": "http://localhost:3000/music/1711093200000-Song Title.mp3"
  }
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Hanya file MP3 yang diperbolehkan!"
}
```

---

### `GET /list`

Retrieve all uploaded music.

**Success Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Song Title",
      "path": "http://localhost:3000/music/1711093200000-Song Title.mp3"
    }
  ]
}
```

---

### `GET /music/:filename`

Access uploaded MP3 files directly. Served via `express.static`.

Example: `http://localhost:3000/music/1711093200000-Song.mp3`

---

## 🖥️ Web Interface

Open **http://localhost:3000** in your browser to access the built-in frontend:

- Upload MP3 files with a single click
- View all uploaded music in a list
- Play music directly with the HTML5 audio player

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **Multer** | File upload middleware |

---

## 📝 Notes

- This project uses an **in-memory array** as a temporary database. All data is lost when the server restarts.
- Uses **CommonJS** module system (`require`).
- File naming includes a timestamp prefix to prevent duplicates.

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
