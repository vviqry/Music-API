# 🎵 Music API (Vercel + Cloudinary + MongoDB)

A serverless RESTful Music API built with **Express.js** for managing MP3 files. It features a modern architecture where files are uploaded directly from the browser to **Cloudinary** (bypassing server limits) and metadata is stored in **MongoDB Atlas**, perfectly optimizing it for free deployment on **Vercel**.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5?logo=cloudinary&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)

---

## ✨ Features

- **Direct Cloud Upload** — MP3 files are uploaded directly from the browser to Cloudinary, bypassing Vercel's 4.5MB serverless body limit.
- **Persistent Database** — Music metadata (title, Cloudinary URL) is permanently saved in MongoDB Atlas.
- **Serverless Ready** — Fully configured to run as Vercel Serverless Functions (`vercel.json` included).
- **Built-in Frontend** — Simple dark-themed web UI for upload (with progress bar!) & playback.
- **Signed Uploads** — Secure uploading using Cloudinary Signature generation.

---

## 📂 Project Structure

```
Music-API/
├── index.js              # Main API server & Serverless Function
├── package.json          # Project metadata & dependencies
├── vercel.json           # Vercel deployment configuration
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
├── DOKUMENTASI.md        # Detailed Indonesian tutorial/workflow
├── README.md             # This file
└── public/
    └── index.html        # Frontend UI (auto-served)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) Account (Free)
- [Cloudinary](https://cloudinary.com/) Account (Free)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vviqry/Music-API.git
   cd Music-API
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`
   - Fill in your MongoDB URI and Cloudinary credentials:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster...
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the server:
   ```bash
   node index.js
   ```

The server will start at **http://localhost:3000**

---

## ☁️ Deployment to Vercel

1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) and import your repository.
3. In the "Environment Variables" section, add all 4 variables (`MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
4. Click **Deploy**.

> **Note:** Make sure you have whitelisted `0.0.0.0/0` in your MongoDB Atlas Network Access so Vercel can connect to the database.

---

## 📡 API Endpoints

### `GET /sign-upload`
Generates a secure signature so the frontend can upload files directly to Cloudinary.

**Response (200):**
```json
{
  "signature": "abcdef1234567890",
  "timestamp": 1711093200,
  "cloudName": "your_cloud_name",
  "apiKey": "your_api_key"
}
```

### `POST /save`
Saves the music metadata into MongoDB after a successful upload to Cloudinary.

**Request Body (JSON):**
```json
{
  "name": "Song Title",
  "cloudinaryId": "music_api/abcd123",
  "url": "https://res.cloudinary.com/.../SongTitle.mp3"
}
```

### `GET /list`
Retrieve all uploaded music from MongoDB.

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "65f...abc",
      "name": "Song Title",
      "path": "https://res.cloudinary.com/.../SongTitle.mp3"
    }
  ]
}
```

---

## 🛠️ Tech Stack Architecture

1. **Frontend (Browser):** Fetches signature from API ➔ Uploads MP3 directly to Cloudinary ➔ Sends metadata to API.
2. **Backend (Express/Vercel):** Generates Cloudinary signatures ➔ Saves/fetches metadata from MongoDB.
3. **Database (MongoDB):** Stores song names and Cloudinary URLs.
4. **Storage (Cloudinary):** Stores the actual heavy `.mp3` files.

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
