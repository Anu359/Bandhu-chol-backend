const mongoose = require('mongoose');

const SyllabusSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  semester: { type: Number, required: true },
  type: { type: String, enum: ['syllabus', 'video', 'resource'], default: 'syllabus' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Syllabus', SyllabusSchema);