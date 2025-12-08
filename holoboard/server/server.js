require('dotenv').config();   // <-- Load .env

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const WebSocket = require('ws');

const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

app.get('/', (req, res) => {
  res.send("Holoboard Server is Running!");
});

// Create HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// 1. DATABASE CONNECTION


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));


// 2. SCHEMA


const BoardSchema = new mongoose.Schema({
  roomId: String,
  userId: String,
  name: String,
  data: Object,
  createdAt: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', BoardSchema);


// 3. API ROUTES


// Save Board
app.post('/api/save', async (req, res) => {
  const { roomId, userId, name, data } = req.body;
  try {
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

// Get user boards
app.get('/api/boards/:userId', async (req, res) => {
  try {
    const boards = await Board.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Load specific board
app.get('/api/board/:roomId', async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId });
    // Return explicit structure so frontend doesn't crash on null
    res.json(board || { data: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete board (by DB ID)
// Note: Frontend must send _id, NOT roomId
app.delete('/api/boards/:id', async (req, res) => {
  try {
    const result = await Board.findByIdAndDelete(req.params.id);

    if (!result) return res.status(404).json({ error: "Board not found" });

    console.log(`🗑️ Deleted board: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. WEBSOCKET


wss.on("connection", (ws, req) => {
  // This library handles the room logic internally based on req.url
  setupWSConnection(ws, req);
});


// 5. START SERVER



const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});