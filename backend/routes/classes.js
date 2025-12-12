const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Task = require('../models/Task');
const { executeInTransaction } = require('../utils/transactionHelper');

// Helper function to sanitize input (prevent NoSQL injection)
const sanitizeString = (value) => {
  if (typeof value !== 'string') return '';
  // Remove any characters that could be used for NoSQL injection
  return value.replace(/[${}]/g, '');
};

// Get all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one class
router.get('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a class
router.post('/', async (req, res) => {
  const classItem = new Class({
    name: sanitizeString(req.body.name || ''),
    description: sanitizeString(req.body.description || ''),
    userId: sanitizeString(req.body.userId || '000000000000000000000000') // Default user ID for demo
  });

  try {
    const newClass = await classItem.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a class
router.put('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (req.body.name != null) {
      classItem.name = sanitizeString(req.body.name);
    }
    if (req.body.description != null) {
      classItem.description = sanitizeString(req.body.description);
    }

    const updatedClass = await classItem.save();
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a class (with ACID transaction support)
router.delete('/:id', async (req, res) => {
  try {
    // First check if class exists (outside transaction for better error handling)
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Execute deletion within a transaction to ensure atomicity
    // Either BOTH class and tasks are deleted, or NEITHER are deleted
    await executeInTransaction(async (session) => {
      // Delete all tasks associated with this class
      const taskDeleteResult = await Task.deleteMany(
        { classId: req.params.id },
        { session }
      );
      
      // Delete the class itself
      await Class.findByIdAndDelete(req.params.id, { session });
      
      console.log(`Transaction completed: Deleted class ${req.params.id} and ${taskDeleteResult.deletedCount} associated tasks`);
    });
    
    res.json({ 
      message: 'Class and associated tasks deleted successfully',
      transactional: true
    });
  } catch (err) {
    console.error('Transaction failed:', err.message);
    res.status(500).json({ 
      message: 'Failed to delete class: ' + err.message,
      transactional: true 
    });
  }
});

module.exports = router;

