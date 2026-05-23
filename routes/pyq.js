const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PYQ } = require('../db/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = './uploads/pyqs/';
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: './uploads/pyqs/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Get PYQs
router.get('/', auth, async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    if (department) query.department = department;
    
    const pyqs = await PYQ.find(query);
    res.json(pyqs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Upload PYQ
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { subject, semester, year, department } = req.body;
    
    const pyqId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    await PYQ.insert({
      _id: pyqId,
      subject,
      semester: parseInt(semester),
      year: parseInt(year),
      department,
      fileUrl: `/uploads/pyqs/${req.file.filename}`,
      uploadedBy: req.user.id,
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'PYQ uploaded successfully',
      pyq: { _id: pyqId, subject, semester, year }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// Delete PYQ
router.delete('/:id', auth, async (req, res) => {
  try {
    const pyq = await PYQ.findOne({ _id: req.params.id });
    if (!pyq) {
      return res.status(404).json({ msg: 'Not found' });
    }
    
    await PYQ.delete({ _id: req.params.id });
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;