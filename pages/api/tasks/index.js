import dbConnect from '../../../lib/mongodb';
import Task from '../../../lib/models/Task';

// Helper function to sanitize input (prevent NoSQL injection)
const sanitizeString = (value) => {
  if (typeof value !== 'string') return '';
  // Remove any characters that could be used for NoSQL injection
  return value.replace(/[${}]/g, '');
};

export default async function handler(req, res) {
  await dbConnect();

  const { method, query } = req;

  switch (method) {
    case 'GET':
      try {
        const filter = {};
        
        // Filter by classId (sanitize to prevent injection)
        if (query.classId) {
          filter.classId = sanitizeString(query.classId);
        }
        
        // Filter by completed status
        if (query.completed !== undefined) {
          filter.completed = query.completed === 'true';
        }
        
        // Filter by priority (sanitize to prevent injection)
        if (query.priority) {
          filter.priority = sanitizeString(query.priority);
        }
        
        // Filter by estimated time range
        if (query.minTime || query.maxTime) {
          filter.estimatedTime = {};
          if (query.minTime) {
            filter.estimatedTime.$gte = parseInt(query.minTime);
          }
          if (query.maxTime) {
            filter.estimatedTime.$lte = parseInt(query.maxTime);
          }
        }
        
        // Filter by due date range
        if (query.startDate || query.endDate) {
          filter.dueDate = {};
          if (query.startDate) {
            filter.dueDate.$gte = new Date(query.startDate);
          }
          if (query.endDate) {
            filter.dueDate.$lte = new Date(query.endDate);
          }
        }

        const tasks = await Task.find(filter).populate('classId', 'name').sort({ createdAt: -1 });
        res.status(200).json(tasks);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'POST':
      try {
        const task = new Task({
          name: sanitizeString(req.body.name || ''),
          description: sanitizeString(req.body.description || ''),
          classId: sanitizeString(req.body.classId || ''),
          estimatedTime: req.body.estimatedTime,
          dueDate: req.body.dueDate,
          completed: req.body.completed || false,
          priority: sanitizeString(req.body.priority || 'medium')
        });

        const newTask = await task.save();
        const populatedTask = await Task.findById(newTask._id).populate('classId', 'name');
        res.status(201).json(populatedTask);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

