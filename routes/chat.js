const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Message } = require('../db/client');   // ✅ Turso model
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = './uploads/chat/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDFs are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// Upload file (image or PDF)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { room } = req.body;
    const file = req.file;
    let messageType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';
    const messageId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    await Message.insert({
      _id: messageId,
      sender: req.user.id,
      text: req.body.text || '',
      messageType,
      fileUrl: `/uploads/chat/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      room: room,
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      _id: messageId, 
      sender: req.user.id, 
      text: req.body.text, 
      messageType, 
      fileUrl: `/uploads/chat/${file.filename}`, 
      room,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// Get messages for a room (history)
router.get('/messages/:room', auth, async (req, res) => {
  try {
    const result = await Message.find({ room: req.params.room });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;