const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');

// Configure file upload
const storage = multer.diskStorage({
  destination: './uploads/chat/',
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
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { room } = req.body;
    const file = req.file;
    
    let messageType = 'image';
    if (file.mimetype === 'application/pdf') {
      messageType = 'pdf';
    }
    
    const message = new Message({
      sender: req.user.id,
      text: req.body.text || '',
      messageType: messageType,
      fileUrl: `/uploads/chat/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      room: room
    });
    
    await message.save();
    await message.populate('sender', 'name');
    res.json(message);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Get messages (existing)
router.get('/messages/:room', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .populate('sender', 'name')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;