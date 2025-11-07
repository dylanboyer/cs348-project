# Taskr (CS348 Project)

This is a full-stack to-do list application built with Next.js and MongoDB. It allows users to manage courses and their associated tasks with complete CRUD operations and advanced filtering capabilities.

## Tech Stack

- **Frontend**: React with Next.js
- **Backend**: Express.js with MongoDB (Mongoose ODM)
- **Database**: MongoDB

## Features

### Course Management
- Create, read, update, and delete courses
- View all courses in a table format
- Each course can have multiple tasks

### Task Management
- Create, read, update, and delete tasks
- Associate tasks with courses
- Track task details:
  - Task name and description
  - Estimated completion time (in minutes)
  - Due date
  - Priority (low, medium, high)
  - Completion status

### Advanced Filtering
- Filter tasks by completion status
- Filter by priority level
- Filter by estimated time range (min/max)
- Filter by due date range
- Multiple filters can be applied simultaneously

### Dynamic Reports
- View real-time statistics:
  - Total tasks count
  - Completed vs incomplete tasks
  - Total estimated time
  - Average estimated time per task
- Reports update automatically based on filters and data changes

### Dynamic UI Components
- Course dropdown is populated dynamically from the database
- No hard-coded values - all data fetched from MongoDB

## Project Structure

```
CS348-Project/
├── frontend/           # Next.js frontend application
│   ├── pages/
│   │   ├── index.js   # Course management page
│   │   └── tasks.js   # Task management page with filtering
│   └── package.json
├── backend/            # Express.js backend application
│   ├── models/        # MongoDB schemas
│   │   ├── User.js
│   │   ├── Class.js
│   │   └── Task.js
│   ├── routes/        # API routes
│   │   ├── classes.js
│   │   └── tasks.js
│   ├── server.js
│   └── package.json
├── DATABASE.md         # Detailed database design documentation
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js installed on your system
- MongoDB instance (local or cloud via MongoDB Atlas)

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud - Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" and get your connection string
4. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/todoapp?retryWrites=true&w=majority`

**Option 2: Local MongoDB**

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/todoapp`

### Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **IMPORTANT:** Update the MongoDB connection string in `server.js`:
   - Open `backend/server.js`
   - Find line: `const MONGO_URI = 'your_mongodb_connection_string_here';`
   - Replace with your actual MongoDB connection string

4. Start the backend server:
   ```bash
   npm start
   ```

5. You should see: `Server running on port 5000` and `MongoDB connected`

### Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Managing Courses

1. **Add a Course:**
   - On the home page (`http://localhost:3000`)
   - Fill in the "Course Name" and optional "Description"
   - Click "Add Course"

2. **Edit a Course:**
   - Click "Edit" button next to the course
   - Modify the form fields
   - Click "Update Course"

3. **Delete a Course:**
   - Click "Delete" button next to the course
   - Confirm deletion (this will also delete all associated tasks)

4. **View Course Tasks:**
   - Click "View Tasks" button next to a course

### Managing Tasks

1. **Add a Task:**
   - Navigate to the Tasks page
   - Fill in task details:
     - Name (required)
     - Description
     - Course (select from dropdown - dynamically loaded)
     - Estimated time in minutes
     - Due date
     - Priority
     - Completion status
   - Click "Add Task"

2. **Filter Tasks:**
   - Use the filter section at the top of Tasks page
   - Available filters:
     - Completion status (All/Completed/Incomplete)
     - Priority (Low/Medium/High)
     - Estimated time range (min/max in minutes)
     - Due date range
   - Click "Clear Filters" to reset

3. **View Report:**
   - Click "Show Report" button
   - View statistics that update dynamically based on current filters
   - Report shows before and after any data changes

4. **Edit/Delete Tasks:**
   - Similar to course operations
   - Use Edit/Delete buttons in the task table

## Database Design

See `DATABASE.md` for comprehensive documentation including:
- Complete database schema with primary and foreign keys
- Insert, update, and delete operation examples
- Filtering and reporting demonstrations
- Dynamic UI component implementation details

## API Endpoints

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get one class
- `POST /api/classes` - Create a class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class (cascades to tasks)

### Tasks
- `GET /api/tasks?[filters]` - Get tasks with optional filters
- `GET /api/tasks/:id` - Get one task
- `POST /api/tasks` - Create a task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Project Deliverables

✅ **a) Database Design** - See `DATABASE.md` with complete schema, primary keys, and foreign keys

✅ **b) CRUD Operations** - Insert, update, and delete demonstrated on Classes table with code examples

✅ **c) Filtering & Reports** - Tasks can be filtered by multiple criteria with dynamic reports showing statistics before/after changes

✅ **d) Dynamic UI Components** - Course dropdown is populated dynamically from database (not hard-coded)

## Troubleshooting

**Cannot connect to MongoDB:**
- Verify your connection string is correct in `backend/server.js`
- For MongoDB Atlas: Check your IP is whitelisted
- For local MongoDB: Ensure MongoDB service is running

**Frontend cannot reach backend:**
- Ensure backend is running on port 5000
- Check CORS is enabled in backend (already configured)

**Tasks not showing:**
- Verify you have created at least one course first
- Check browser console for any error messages

## Notes

- The UI is intentionally minimal (no styling) as requested - focuses on functionality
- All data operations use the database (no mock/hard-coded data)
- Deleting a course will cascade delete all its tasks
- The course dropdown in task forms demonstrates dynamic loading from the database
