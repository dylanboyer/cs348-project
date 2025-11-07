const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Task = require('../models/Task');

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
    name: req.body.name,
    description: req.body.description,
    userId: req.body.userId || '000000000000000000000000' // Default user ID for demo
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
      classItem.name = req.body.name;
    }
    if (req.body.description != null) {
      classItem.description = req.body.description;
    }

    const updatedClass = await classItem.save();
    res.json(updatedClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a class
router.delete('/:id', async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Also delete all tasks associated with this class
    await Task.deleteMany({ classId: req.params.id });
    
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class and associated tasks deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

