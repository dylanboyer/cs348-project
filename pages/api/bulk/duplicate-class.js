import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';
import Task from '../../../lib/models/Task';
const { executeInTransaction } = require('../../../lib/utils/transactionHelper');

/**
 * Duplicate a class with all its tasks
 * This requires creating multiple documents atomically
 */
export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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

    res.status(200).json({
      message: 'Class duplicated successfully',
      ...result,
      transactional: true
    });
  } catch (error) {
    console.error('Duplicate class transaction failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to duplicate class: ' + error.message,
      transactional: true
    });
  }
}

