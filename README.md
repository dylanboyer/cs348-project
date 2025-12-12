# Taskr (CS348 Project)

This is a full-stack to-do list application built with Next.js and MongoDB. It allows users to manage courses and their associated tasks with complete CRUD operations and advanced filtering capabilities.

## Tech Stack

- **Frontend**: React with Next.js
- **Backend**: Express.js with MongoDB (Mongoose ODM)
- **Database**: MongoDB

## Setup Instructions

### Prerequisites

- Node.js installed on your system
- MongoDB instance (local or cloud via MongoDB Atlas)

### MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" and get your connection string
4. It will look like: `mongodb+srv://username:password@cluster.mongodb.net/todoapp?retryWrites=true&w=majority`

### Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **IMPORTANT:** Update the MongoDB connection string in `.env`:
   - Open `backend/env.js`
   - Find line: `MONGO_URI = 'your_mongodb_connection_string_here';`
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

## Notes

- This was vibe coded for a school project (it was allowed!) so it's not polished work at all lol
- The UI is intentionally minimal (no styling)
- All data operations use the database (no mock/hard-coded data)
- The course dropdown in task forms demonstrates dynamic loading from the database
