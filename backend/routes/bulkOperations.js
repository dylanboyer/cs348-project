const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Task = require('../models/Task');
const { executeInTransaction } = require('../utils/transactionHelper');

/**
 * Bulk Operations Router
 * 
 * Provides transaction-enabled bulk operations that require atomicity
 */

/**
 * Move all tasks from one class to another
 * This is a multi-document operation requiring a transaction
 */
router.post('/move-tasks', async (req, res) => {
  try {
    const { fromClassId, toClassId } = req.body;

    if (!fromClassId || !toClassId) {
      return res.status(400).json({ 
        message: 'Both fromClassId and toClassId are required' 
      });
    }

    // Verify both classes exist (outside transaction)
    const [fromClass, toClass] = await Promise.all([
      Class.findById(fromClassId),
      Class.findById(toClassId)
    ]);

    if (!fromClass) {
      return res.status(404).json({ message: 'Source class not found' });
    }
    if (!toClass) {
      return res.status(404).json({ message: 'Destination class not found' });
    }

    // Execute move within transaction
    const result = await executeInTransaction(async (session) => {
      // Update all tasks from source class to destination class
      const updateResult = await Task.updateMany(
        { classId: fromClassId },
        { $set: { classId: toClassId } },
        { session }
      );

      return {
        movedCount: updateResult.modifiedCount,
        fromClass: fromClass.name,
        toClass: toClass.name
      };
    });

    res.json({
      message: `Successfully moved ${result.movedCount} tasks`,
      ...result,
      transactional: true
    });
  } catch (err) {
    console.error('Move tasks transaction failed:', err.message);
    res.status(500).json({ 
      message: 'Failed to move tasks: ' + err.message,
      transactional: true
    });
  }
});

/**
 * Bulk delete multiple classes and all their tasks
 * This is a multi-document operation requiring a transaction
 */
router.post('/delete-classes', async (req, res) => {
  try {
    const { classIds } = req.body;

    if (!Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ 
        message: 'classIds must be a non-empty array' 
      });
    }

    // Execute bulk deletion within transaction
    const result = await executeInTransaction(async (session) => {
      // Delete all tasks for these classes
      const taskDeleteResult = await Task.deleteMany(
        { classId: { $in: classIds } },
        { session }
      );

      // Delete all the classes
      const classDeleteResult = await Class.deleteMany(
        { _id: { $in: classIds } },
        { session }
      );

      return {
        classesDeleted: classDeleteResult.deletedCount,
        tasksDeleted: taskDeleteResult.deletedCount
      };
    });

    res.json({
      message: 'Bulk deletion completed successfully',
      ...result,
      transactional: true
    });
  } catch (err) {
    console.error('Bulk delete transaction failed:', err.message);
    res.status(500).json({ 
      message: 'Failed to delete classes: ' + err.message,
      transactional: true
    });
  }
});

/**
 * Mark all tasks in a class as completed
 * While this could be done without a transaction, we use one to demonstrate
 * how to ensure consistency when updating multiple related documents
 */
router.post('/complete-all-tasks', async (req, res) => {
  try {
    const { classId } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    // Verify class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Execute within transaction for consistency
    const result = await executeInTransaction(async (session) => {
      const updateResult = await Task.updateMany(
        { classId: classId, completed: false },
        { $set: { completed: true } },
        { session }
      );

      return {
        className: classItem.name,
        tasksCompleted: updateResult.modifiedCount
      };
    });

    res.json({
      message: `Marked all tasks in "${result.className}" as completed`,
      ...result,
      transactional: true
    });
  } catch (err) {
    console.error('Complete tasks transaction failed:', err.message);
    res.status(500).json({ 
      message: 'Failed to complete tasks: ' + err.message,
      transactional: true
    });
  }
});

/**
 * Duplicate a class with all its tasks
 * This requires creating multiple documents atomically
 */
router.post('/duplicate-class', async (req, res) => {
  try {
    const { classId, newClassName } = req.body;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    // Get original class and its tasks (outside transaction)
    const [originalClass, originalTasks] = await Promise.all([
      Class.findById(classId),
      Task.find({ classId: classId })
    ]);

    if (!originalClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Execute duplication within transaction
    const result = await executeInTransaction(async (session) => {
      // Create new class
      const newClass = new Class({
        name: newClassName || `${originalClass.name} (Copy)`,
        description: originalClass.description,
        userId: originalClass.userId
      });
      await newClass.save({ session });

      // Create copies of all tasks
      const newTasks = originalTasks.map(task => ({
        name: task.name,
        description: task.description,
        classId: newClass._id,
        estimatedTime: task.estimatedTime,
        dueDate: task.dueDate,
        completed: false, // Reset completion status
        priority: task.priority
      }));

      if (newTasks.length > 0) {
        await Task.insertMany(newTasks, { session });
      }

      return {
        newClassId: newClass._id,
        newClassName: newClass.name,
        tasksCopied: newTasks.length
      };
    });

    res.json({
      message: 'Class duplicated successfully',
      ...result,
      transactional: true
    });
  } catch (err) {
    console.error('Duplicate class transaction failed:', err.message);
    res.status(500).json({ 
      message: 'Failed to duplicate class: ' + err.message,
      transactional: true
    });
  }
});

module.exports = router;
