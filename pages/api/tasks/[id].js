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
  const { id } = query;

  switch (method) {
    case 'GET':
      try {
        const task = await Task.findById(id).populate('classId', 'name');
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'PUT':
      try {
        const task = await Task.findById(id);
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }

        if (req.body.name != null) {
          task.name = sanitizeString(req.body.name);
        }
        if (req.body.description != null) {
          task.description = sanitizeString(req.body.description);
        }
        if (req.body.classId != null) {
          task.classId = sanitizeString(req.body.classId);
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
          task.priority = sanitizeString(req.body.priority);
        }

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id).populate('classId', 'name');
        res.status(200).json(populatedTask);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
      break;

    case 'DELETE':
      try {
        const task = await Task.findById(id);
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }

        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Task deleted' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

