import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';

// Helper function to sanitize input (prevent NoSQL injection)
const sanitizeString = (value) => {
  if (typeof value !== 'string') return '';
  // Remove any characters that could be used for NoSQL injection
  return value.replace(/[${}]/g, '');
};

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const classes = await Class.find().sort({ createdAt: -1 });
        res.status(200).json(classes);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
      break;

    case 'POST':
      try {
        const classItem = new Class({
          name: sanitizeString(req.body.name || ''),
          description: sanitizeString(req.body.description || ''),
          userId: sanitizeString(req.body.userId || '000000000000000000000000') // Default user ID for demo
        });

        const newClass = await classItem.save();
        res.status(201).json(newClass);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

