# MongoDB Setup Guide

You need to set up MongoDB before running this application. Choose **one** of the options below:

---

## Option 1: MongoDB Atlas (Cloud) - RECOMMENDED ✅

This is the easiest option - no local installation required!

### Steps:

1. **Create an account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Try Free" and create an account

2. **Create a free cluster:**
   - Choose "Shared" (FREE tier)
   - Select a cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region close to you
   - Click "Create Cluster" (takes 3-5 minutes)

3. **Create a database user:**
   - Click "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Whitelist your IP:**
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get your connection string:**
   - Click "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string (looks like this):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add your database name (e.g., `todoapp`) before the `?`:
     ```
     mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority
     ```

6. **Update your backend:**
   - Open `backend/server.js`
   - Find this line:
     ```javascript
     const MONGO_URI = 'your_mongodb_connection_string_here';
     ```
   - Replace it with your connection string:
     ```javascript
     const MONGO_URI = 'mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority';
     ```

7. **You're done!** Start your backend and it will connect to MongoDB Atlas.

---

## Option 2: Local MongoDB Installation

Install MongoDB on your local machine.

### Windows:

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and choose "Complete" installation
3. Check "Install MongoDB as a Service"
4. MongoDB will start automatically
5. Your connection string is: `mongodb://localhost:27017/todoapp`

### macOS:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Your connection string is: mongodb://localhost:27017/todoapp
```

### Linux (Ubuntu/Debian):

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Your connection string is: mongodb://localhost:27017/todoapp
```

### Update backend:

Open `backend/server.js` and update:

```javascript
const MONGO_URI = 'mongodb://localhost:27017/todoapp';
```

---

## Verifying Your Setup

After setting up MongoDB and updating `backend/server.js`:

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. You should see:
   ```
   Server running on port 5000
   MongoDB connected
   ```

3. If you see "MongoDB connected" - you're all set! ✅

## Common Issues

### "MongooseServerSelectionError: connect ECONNREFUSED"
- **Cause:** MongoDB is not running or connection string is wrong
- **Fix:** 
  - For Atlas: Check your connection string, username, password, and IP whitelist
  - For Local: Ensure MongoDB service is running

### "Authentication failed"
- **Cause:** Wrong username or password in Atlas
- **Fix:** Double-check your database user credentials

### "Network timeout"
- **Cause:** IP not whitelisted in Atlas
- **Fix:** Add your IP or allow access from anywhere in Atlas Network Access

---

## Next Steps

Once MongoDB is connected:

1. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Start creating courses and tasks!

---

## Need Help?

- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/
- MongoDB Community Docs: https://www.mongodb.com/docs/manual/
- Check that both backend (port 5000) and frontend (port 3000) are running

