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
const MONGO_URI = "mongodb+srv://dylan:informal1@taskr.gwizy5a.mongodb.net/?appName=taskr";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Import routes
const classRoutes = require('./routes/classes');
const taskRoutes = require('./routes/tasks');

// Routes
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.use('/api/classes', classRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
