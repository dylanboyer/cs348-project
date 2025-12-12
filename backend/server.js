const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Import routes
const classRoutes = require('./routes/classes');
const taskRoutes = require('./routes/tasks');
const bulkOperationsRoutes = require('./routes/bulkOperations');

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/classes', classRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bulk', bulkOperationsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
