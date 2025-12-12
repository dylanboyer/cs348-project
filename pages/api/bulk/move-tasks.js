import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';
import Task from '../../../lib/models/Task';
const { executeInTransaction } = require('../../../lib/utils/transactionHelper');

/**
 * Move all tasks from one class to another
 * This is a multi-document operation requiring a transaction
 */
export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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

    res.status(200).json({
      message: `Successfully moved ${result.movedCount} tasks`,
      ...result,
      transactional: true
    });
  } catch (error) {
    console.error('Move tasks transaction failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to move tasks: ' + error.message,
      transactional: true
    });
  }
}

