const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  classId: { // foreign key to Class collection
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true // INDEX: Critical for filtering tasks by class and cascade deletes
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 0
  },
  dueDate: {
    type: Date
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);

