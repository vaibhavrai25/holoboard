const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const app = express();
app.get('/', (req, res) => {
  res.send('Holoboard Server is Running!');
});
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow big payloads for images

// --- DATABASE CONNECTION ---
// REPLACE THIS STRING WITH YOUR MONGODB URL
const MONGO_URI = "mongodb+srv://admin:holoboard123@cluster0.xlh3aor.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// --- SCHEMA ---
const BoardSchema = new mongoose.Schema({
  roomId: String,
  userId: String, // Clerk User ID
  name: String,
  data: Object, // The Shapes & Connectors
  createdAt: { type: Date, default: Date.now }
});
const Board = mongoose.model('Board', BoardSchema);

// --- API ROUTES ---

// 1. Save Board
app.post('/api/save', async (req, res) => {
  const { roomId, userId, name, data } = req.body;
  try {
    // Upsert: Update if exists, Create if new
    const savedBoard = await Board.findOneAndUpdate(
      { roomId },
      { userId, name, data, createdAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true, board: savedBoard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get User Boards
app.get('/api/boards/:userId', async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Load Specific Board
app.get('/api/board/:roomId', async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId });
    res.json(board || { data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WEBSOCKET HANDLER ---
wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

// Start Server
const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});