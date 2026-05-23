const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Note } = require('../db/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = './uploads/';
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, PPT, TXT, and images are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

// UPLOAD FILE
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, department, year } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'File is required' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    const noteId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    // Insert WITHOUT fileType column
    await Note.insert({
      _id: noteId,
      title,
      description: description || '',
      fileUrl: fileUrl,
      subject,
      department,
      year: parseInt(year),
      uploadedBy: req.user.id,
      downloads: 0,
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'File uploaded successfully',
      note: { _id: noteId, title, fileUrl }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// ADD LINK
router.post('/link', auth, async (req, res) => {
  try {
    const { title, description, subject, department, year, link } = req.body;
    
    if (!link || link.trim() === '') {
      return res.status(400).json({ msg: 'Link is required' });
    }
    
    const noteId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    // Insert WITHOUT fileType column (use fileUrl for link)
    await Note.insert({
      _id: noteId,
      title,
      description: description || '',
      fileUrl: link,  // Store link in fileUrl
      subject,
      department,
      year: parseInt(year),
      uploadedBy: req.user.id,
      downloads: 0,
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Link added successfully',
      note: { _id: noteId, title, link }
    });
  } catch (err) {
    console.error('Link error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// GET all notes
router.get('/', auth, async (req, res) => {
  try {
    const { department, year } = req.query;
    let notesData;
    
    if (department && year) {
      notesData = await Note.find({ department, year: parseInt(year) });
    } else if (department) {
      notesData = await Note.find({ department });
    } else if (year) {
      notesData = await Note.find({ year: parseInt(year) });
    } else {
      notesData = await Note.find({});
    }
    
    const notes = notesData.rows.map(note => ({
      _id: note._id,
      title: note.title,
      description: note.description,
      fileUrl: note.fileUrl,
      isLink: note.fileUrl && (note.fileUrl.startsWith('http') || note.fileUrl.startsWith('https')),
      subject: note.subject,
      department: note.department,
      year: note.year,
      downloads: note.downloads || 0,
      createdAt: note.createdAt
    }));
    
    res.json(notes);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id });
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    res.json({
      _id: note._id,
      title: note.title,
      description: note.description,
      fileUrl: note.fileUrl,
      isLink: note.fileUrl && (note.fileUrl.startsWith('http') || note.fileUrl.startsWith('https')),
      subject: note.subject,
      department: note.department,
      year: note.year,
      downloads: note.downloads || 0,
      createdAt: note.createdAt
    });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id });
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // Delete physical file if it exists (not a link)
    if (note.fileUrl && !note.fileUrl.startsWith('http')) {
      const filePath = path.join(__dirname, '..', note.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await Note.delete({ _id: req.params.id });
    res.json({ msg: 'Note deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;