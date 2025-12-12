# CS348 Project - Task Management System

A full-stack task management application built with Next.js and MongoDB, featuring ACID-compliant transactions.

## 🏗️ Project Structure

This is a **Next.js monorepo** with integrated API routes (no separate backend server needed):

```
cs348-project/
├── lib/                        # Shared backend logic
│   ├── models/                 # MongoDB models
│   │   ├── Class.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── utils/                  # Utility functions
│   │   └── transactionHelper.js
│   └── mongodb.js              # Database connection utility
├── pages/                      # Next.js pages and API routes
│   ├── api/                    # API endpoints
│   │   ├── classes/
│   │   │   ├── index.js        # GET /api/classes, POST /api/classes
│   │   │   └── [id].js         # GET/PUT/DELETE /api/classes/:id
│   │   ├── tasks/
│   │   │   ├── index.js        # GET /api/tasks, POST /api/tasks
│   │   │   └── [id].js         # GET/PUT/DELETE /api/tasks/:id
│   │   └── bulk/               # Bulk operations with transactions
│   │       ├── move-tasks.js
│   │       ├── delete-classes.js
│   │       ├── complete-all-tasks.js
│   │       └── duplicate-class.js
│   ├── index.js                # Home page - Course management
│   └── tasks.js                # Tasks page - Task management
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── .env.local                  # Environment variables (create this)
└── Documentation files         # Transaction docs, guides, etc.
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB replica set)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Create a `.env.local` file in the root directory:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Replace with your actual MongoDB connection string.

3. **Run the development server:**

```bash
npm run dev
```

4. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Features

### Course Management
- Create, read, update, and delete courses
- View all courses with creation dates
- Navigate to course tasks

### Task Management
- Create, read, update, and delete tasks
- Assign tasks to courses (with dynamic dropdown)
- Set priority (low, medium, high)
- Set estimated time and due dates
- Mark tasks as completed
- Filter tasks by:
  - Completion status
  - Priority
  - Estimated time range
  - Due date range
- View task statistics report

### ACID Transaction Support
- **Atomicity**: Class deletion with all tasks (all or nothing)
- **Consistency**: Referential integrity maintained
- **Isolation**: Snapshot isolation level
- **Durability**: Write concern majority

### Bulk Operations (Transactional)
- Move all tasks from one class to another
- Bulk delete multiple classes with their tasks
- Mark all tasks in a class as completed
- Duplicate a class with all its tasks

## 🔧 API Endpoints

### Classes

- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create a new class
- `GET /api/classes/:id` - Get a specific class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class and all its tasks (transactional)

### Tasks

- `GET /api/tasks` - Get all tasks (with optional filters)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Bulk Operations

- `POST /api/bulk/move-tasks` - Move tasks between classes
- `POST /api/bulk/delete-classes` - Bulk delete classes
- `POST /api/bulk/complete-all-tasks` - Complete all tasks in a class
- `POST /api/bulk/duplicate-class` - Duplicate a class with tasks

## 🗄️ Database Models

### Class Model
```javascript
{
  name: String (required),
  description: String,
  userId: ObjectId (ref: User),
  createdAt: Date
}
```

### Task Model
```javascript
{
  name: String (required),
  description: String,
  classId: ObjectId (ref: Class, indexed),
  estimatedTime: Number (minutes),
  dueDate: Date,
  completed: Boolean,
  priority: String (low/medium/high),
  createdAt: Date
}
```

### User Model
```javascript
{
  username: String (unique),
  password: String,
  email: String (unique),
  createdAt: Date
}
```

## 🔒 Transaction Implementation

This project uses MongoDB's multi-document ACID transactions with **Snapshot Isolation**:

### Configuration
```javascript
{
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  readPreference: 'primary'
}
```

### Example Usage
```javascript
const { executeInTransaction } = require('./lib/utils/transactionHelper');

await executeInTransaction(async (session) => {
  await Task.deleteMany({ classId: id }, { session });
  await Class.findByIdAndDelete(id, { session });
  // Either both succeed or both rollback
});
```

## 🧪 Testing Transactions

Run the transaction test suite:

```bash
node test-transactions.js
```

This will verify:
- ✅ Transaction support
- ✅ Atomicity (rollback on error)
- ✅ Isolation (concurrent transactions)
- ✅ Consistency (referential integrity)
- ✅ Durability (persistence after commit)

## 📚 Documentation

- **ACID_IMPLEMENTATION_SUMMARY.md** - Overview of ACID implementation
- **TRANSACTION_DOCUMENTATION.md** - Detailed transaction documentation
- **TRANSACTION_VISUAL_GUIDE.md** - Visual guide to transactions
- **DATABASE.md** - Database schema and design
- **SETUP_MONGODB.md** - MongoDB setup instructions

## 🛠️ Technology Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API Routes
- **Database**: MongoDB (Atlas with replica set)
- **ODM**: Mongoose
- **Styling**: Inline CSS (for simplicity)

## 🔐 Security Features

- Input sanitization to prevent NoSQL injection
- Environment variables for sensitive data
- MongoDB connection pooling
- Error handling and validation

## 📝 Key Differences from Traditional Setup

### Before (Separate Backend/Frontend)
```
backend/ (Express server on port 5000)
  ├── server.js
  ├── routes/
  └── models/

frontend/ (Next.js on port 3000)
  └── pages/
```

### After (Next.js Monorepo)
```
pages/ (Everything in one app)
  ├── api/          # Backend API routes
  └── index.js      # Frontend pages

lib/              # Shared backend code
  ├── models/
  └── utils/
```

### Benefits
- ✅ Single server (Next.js handles both frontend and API)
- ✅ No CORS issues
- ✅ Simplified deployment
- ✅ Better code organization
- ✅ Automatic API route optimization
- ✅ Built-in API route handling

## 🚢 Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Import project in Vercel
3. Add `MONGO_URI` environment variable
4. Deploy!

### Other Platforms

This can also be deployed to:
- AWS (using Next.js standalone build)
- Google Cloud Platform
- Azure
- DigitalOcean
- Heroku

## 🤝 Contributing

This is an educational project for CS348. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

This project is for educational purposes as part of CS348.

## 👥 Authors

CS348 Project Team

## 🙏 Acknowledgments

- Course instructors and TAs
- MongoDB documentation
- Next.js documentation
- React documentation
