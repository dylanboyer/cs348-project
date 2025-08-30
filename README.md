# CS348 Project

This project is a boilerplate for a simple web application using the following tech stack:

- **Frontend**: React with Next.js
- **Backend**: Express.js with MongoDB

## Project Structure

```
CS348-Project/
├── frontend/       # Next.js frontend application
├── backend/        # Express.js backend application
```

## Setup Instructions

### Prerequisites

- Node.js installed on your system
- MongoDB instance running (local or cloud)

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
4. Open your browser and navigate to `http://localhost:3000`.

### Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `MONGO_URI` in `server.js` with your MongoDB connection string.
4. Start the backend server:
   ```bash
   npm start
   ```
5. The backend will be running on `http://localhost:5000`.

## Notes

- Replace `your_mongodb_connection_string_here` in `backend/server.js` with your actual MongoDB connection string.
- Ensure MongoDB is running before starting the backend server.
