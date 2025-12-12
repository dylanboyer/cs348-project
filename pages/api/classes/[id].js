import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';
import Task from '../../../lib/models/Task';
const { executeInTransaction } = require('../../../lib/utils/transactionHelper');

// Helper function to sanitize input (prevent NoSQL injection)
const sanitizeString = (value) => {
  if (typeof value !== 'string') return '';
  // Remove any characters that could be used for NoSQL injection
  return value.replace(/[${}]/g, '');
};

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;
  const { id } = query;

  switch (method) {
    case 'GET':
      try {
        const classItem = await Class.findById(id);
        if (!classItem) {
          return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(classItem);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'PUT':
      try {
        const classItem = await Class.findById(id);
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
        res.status(200).json(updatedClass);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
      break;

    case 'DELETE':
      try {
        // First check if class exists (outside transaction for better error handling)
        const classItem = await Class.findById(id);
        if (!classItem) {
          return res.status(404).json({ message: 'Class not found' });
        }

        // Execute deletion within a transaction to ensure atomicity
        // Either BOTH class and tasks are deleted, or NEITHER are deleted
        await executeInTransaction(async (session) => {
          // Delete all tasks associated with this class
          const taskDeleteResult = await Task.deleteMany(
            { classId: id },
            { session }
          );
          
          // Delete the class itself
          await Class.findByIdAndDelete(id, { session });
          
          console.log(`Transaction completed: Deleted class ${id} and ${taskDeleteResult.deletedCount} associated tasks`);
        });
        
        res.status(200).json({ 
          message: 'Class and associated tasks deleted successfully',
          transactional: true
        });
      } catch (error) {
        console.error('Transaction failed:', error.message);
        res.status(500).json({ 
          message: 'Failed to delete class: ' + error.message,
          transactional: true 
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

