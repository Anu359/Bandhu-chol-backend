const express = require('express');
// const mongoose = require('mongoose'); // COMMENTED OUT - Using Turso
const { initDatabase } = require('./db/init');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://*.vercel.app", "https://*.workers.dev"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
// Turso Database Connection
initDatabase()
  .then(() => console.log('✅ Turso Database Connected'))
  .catch(err => console.log('❌ Database Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/pyq', require('./routes/pyq'));
app.use('/api/map', require('./routes/map'));

// Socket.io
require('./socket/chatHandler')(io);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Bandhu Backend is Running!', status: 'online', timestamp: new Date().toISOString() });
});

// Health check for keep-alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`✅ Turso Database: Connected`);
  console.log(`✅ WebSocket: Ready for chat\n`);
});