const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Syllabus } = require('../db/client');  // ← FIXED: Use destructuring

// Get syllabus items
router.get('/', auth, async (req, res) => {
  try {
    const { department, year } = req.query;
    const query = {};
    if (department) query.department = department;
    if (year) query.year = parseInt(year);
    
    const items = await Syllabus.find(query);
    res.json(items.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add syllabus item
router.post('/add', auth, async (req, res) => {
  try {
    const { subject, semester, type, title, description, link, department, year } = req.body;
    
    const syllabusId = Date.now().toString() + Math.random().toString(36).substring(7);
    
    await Syllabus.insert({
      _id: syllabusId,
      subject,
      semester: parseInt(semester),
      type: type || 'syllabus',
      title,
      description: description || '',
      link: link || '',
      department,
      year: parseInt(year),
      uploadedBy: req.user.id,
      createdAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: 'Syllabus item added successfully',
      item: { _id: syllabusId, subject, semester, title }
    });
  } catch (err) {
    console.error('Add error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// Delete syllabus item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Syllabus.findOne({ _id: req.params.id });
    if (!item) {
      return res.status(404).json({ msg: 'Not found' });
    }
    
    await Syllabus.delete({ _id: req.params.id });
    res.json({ msg: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;