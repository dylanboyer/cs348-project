import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';
import Task from '../../../lib/models/Task';
const { executeInTransaction } = require('../../../lib/utils/transactionHelper');

/**
 * Mark all tasks in a class as completed
 * While this could be done without a transaction, we use one to demonstrate
 * how to ensure consistency when updating multiple related documents
 */
export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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

    res.status(200).json({
      message: `Marked all tasks in "${result.className}" as completed`,
      ...result,
      transactional: true
    });
  } catch (error) {
    console.error('Complete tasks transaction failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to complete tasks: ' + error.message,
      transactional: true
    });
  }
}

