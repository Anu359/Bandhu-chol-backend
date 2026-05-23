const mongoose = require('mongoose');

const PYQSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  fileUrl: { type: String, required: true },
  department: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PYQ', PYQSchema);