const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../db/client');
const { v4: uuidv4 } = require('uuid');  // Add this for unique IDs

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollNo, department, year, section } = req.body;
    
    // Check if user exists
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user ID
    const userId = uuidv4();
    
    // Insert user directly (no 'new' operator)
    await User.insert({
      _id: userId,
      name,
      email,
      password: hashedPassword,
      rollNo,
      department,
      year: parseInt(year),
      section
    });
    
    // Get the created user
    const user = await User.findOne({ _id: userId });
    
    // Create token
    const payload = { user: { id: user._id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { id: user._id, name, email, department, year, section, rollNo } 
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    
    // Create token
    const payload = { user: { id: user._id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email, department: user.department, year: user.year, section: user.section, rollNo: user.rollNo } 
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.json({ user: null });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.user.id });
    if (user) {
      delete user.password;
    }
    res.json({ user });
  } catch (err) {
    res.json({ user: null });
  }
});

module.exports = router;