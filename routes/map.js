const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// JU Campus Locations
const locations = [
  { id: 1, name: 'Main Building', category: 'academic', lat: 22.5000, lng: 88.3500, description: 'Administrative offices and main lecture halls' },
  { id: 2, name: 'PG Block', category: 'academic', lat: 22.5010, lng: 88.3510, description: 'Post Graduate classes and research labs' },
  { id: 3, name: 'Central Library', category: 'library', lat: 22.5005, lng: 88.3495, description: 'Main library with 24/7 study area' },
  { id: 4, name: 'PG Maliks', category: 'food', lat: 22.4995, lng: 88.3505, description: 'Popular food joint - best rolls and chai' },
  { id: 5, name: 'JU Canteen', category: 'food', lat: 22.5015, lng: 88.3490, description: 'Central canteen - budget friendly' },
  { id: 6, name: 'CSE Department', category: 'academic', lat: 22.5008, lng: 88.3520, description: 'Computer Science & Engineering' },
  { id: 7, name: 'IT Department', category: 'academic', lat: 22.5012, lng: 88.3515, description: 'Information Technology' },
  { id: 8, name: 'ECE Department', category: 'academic', lat: 22.4998, lng: 88.3508, description: 'Electronics & Communication' },
  { id: 9, name: 'Mechanical Dept', category: 'academic', lat: 22.5020, lng: 88.3525, description: 'Mechanical Engineering' },
  { id: 10, name: 'Salt Lake Stadium', category: 'sports', lat: 22.5080, lng: 88.3580, description: 'Sports complex and ground' }
];

// Get all locations
router.get('/locations', auth, async (req, res) => {
  res.json(locations);
});

// Get locations by category
router.get('/locations/:category', auth, async (req, res) => {
  const { category } = req.params;
  const filtered = locations.filter(loc => loc.category === category);
  res.json(filtered);
});

module.exports = router;