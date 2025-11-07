const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all tasks (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    
    // Filter by classId
    if (req.query.classId) {
      filter.classId = req.query.classId;
    }
    
    // Filter by completed status
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }
    
    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    
    // Filter by estimated time range
    if (req.query.minTime || req.query.maxTime) {
      filter.estimatedTime = {};
      if (req.query.minTime) {
        filter.estimatedTime.$gte = parseInt(req.query.minTime);
      }
      if (req.query.maxTime) {
        filter.estimatedTime.$lte = parseInt(req.query.maxTime);
      }
    }
    
    // Filter by due date range
    if (req.query.startDate || req.query.endDate) {
      filter.dueDate = {};
      if (req.query.startDate) {
        filter.dueDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.dueDate.$lte = new Date(req.query.endDate);
      }
    }

    const tasks = await Task.find(filter).populate('classId', 'name').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('classId', 'name');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a task
router.post('/', async (req, res) => {
  const task = new Task({
    name: req.body.name,
    description: req.body.description,
    classId: req.body.classId,
    estimatedTime: req.body.estimatedTime,
    dueDate: req.body.dueDate,
    completed: req.body.completed || false,
    priority: req.body.priority || 'medium'
  });

  try {
    const newTask = await task.save();
    const populatedTask = await Task.findById(newTask._id).populate('classId', 'name');
    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.name != null) {
      task.name = req.body.name;
    }
    if (req.body.description != null) {
      task.description = req.body.description;
    }
    if (req.body.classId != null) {
      task.classId = req.body.classId;
    }
    if (req.body.estimatedTime != null) {
      task.estimatedTime = req.body.estimatedTime;
    }
    if (req.body.dueDate != null) {
      task.dueDate = req.body.dueDate;
    }
    if (req.body.completed != null) {
      task.completed = req.body.completed;
    }
    if (req.body.priority != null) {
      task.priority = req.body.priority;
    }

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate('classId', 'name');
    res.json(populatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

