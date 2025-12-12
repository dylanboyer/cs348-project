import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';
import Task from '../../../lib/models/Task';
const { executeInTransaction } = require('../../../lib/utils/transactionHelper');

/**
 * Bulk delete multiple classes and all their tasks
 * This is a multi-document operation requiring a transaction
 */
export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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

    res.status(200).json({
      message: 'Bulk deletion completed successfully',
      ...result,
      transactional: true
    });
  } catch (error) {
    console.error('Bulk delete transaction failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to delete classes: ' + error.message,
      transactional: true
    });
  }
}

