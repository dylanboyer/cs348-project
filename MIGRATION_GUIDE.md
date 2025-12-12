# Migration Guide: Express Backend → Next.js Monorepo

This document explains the refactoring from a separate Express backend + Next.js frontend to a unified Next.js monorepo structure.

## 📋 Summary of Changes

### Old Structure
```
backend/
  ├── server.js              # Express server
  ├── routes/               # Express routes
  ├── models/               # Mongoose models
  └── utils/                # Utilities

frontend/
  ├── pages/                # Next.js pages
  └── package.json
```

### New Structure
```
lib/
  ├── models/               # Mongoose models (shared)
  ├── utils/                # Utilities (shared)
  └── mongodb.js            # DB connection utility

pages/
  ├── api/                  # Next.js API routes (replaces Express)
  │   ├── classes/
  │   ├── tasks/
  │   └── bulk/
  ├── index.js              # Frontend pages
  └── tasks.js

next.config.js              # Next.js config
package.json                # Unified dependencies
```

## 🔄 What Changed

### 1. Backend API Routes → Next.js API Routes

**Before (Express):**
```javascript
// backend/routes/classes.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const classes = await Class.find();
  res.json(classes);
});

router.post('/', async (req, res) => {
  const newClass = await Class.create(req.body);
  res.status(201).json(newClass);
});

module.exports = router;
```

**After (Next.js API Route):**
```javascript
// pages/api/classes/index.js
import dbConnect from '../../../lib/mongodb';
import Class from '../../../lib/models/Class';

export default async function handler(req, res) {
  await dbConnect();
  
  if (req.method === 'GET') {
    const classes = await Class.find();
    res.status(200).json(classes);
  } else if (req.method === 'POST') {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } else {
    res.status(405).end();
  }
}
```

### 2. Models: require → mongoose.models pattern

**Before:**
```javascript
// backend/models/Class.js
module.exports = mongoose.model('Class', classSchema);
```

**After:**
```javascript
// lib/models/Class.js
module.exports = mongoose.models.Class || mongoose.model('Class', classSchema);
```

**Why?** Next.js hot-reloads in development, which would re-define models. The pattern prevents "model already defined" errors.

### 3. Database Connection

**Before (Express):**
```javascript
// backend/server.js
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected'))
  .catch(err => console.error(err));
```

**After (Next.js):**
```javascript
// lib/mongodb.js - Connection pooling with caching
let cached = global.mongoose;

async function dbConnect() {
  if (cached.conn) return cached.conn;
  // ... connection logic with caching
}
```

**Why?** Next.js serverless functions need connection pooling. The cached pattern reuses connections across API routes.

### 4. Frontend API Calls

**Before:**
```javascript
// frontend/pages/index.js
const response = await fetch('http://localhost:5000/api/classes');
```

**After:**
```javascript
// pages/index.js
const response = await fetch('/api/classes');
```

**Why?** API routes are now in the same app, so use relative paths. No more CORS issues!

### 5. Route Parameter Handling

**Before (Express):**
```javascript
// backend/routes/classes.js
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  // ...
});
```

**After (Next.js Dynamic Route):**
```javascript
// pages/api/classes/[id].js
export default async function handler(req, res) {
  const { id } = req.query;  // Note: req.query, not req.params
  // ...
}
```

### 6. Package Management

**Before:**
```json
// backend/package.json
{
  "dependencies": {
    "express": "latest",
    "cors": "latest",
    "mongoose": "latest"
  }
}

// frontend/package.json
{
  "dependencies": {
    "next": "latest",
    "react": "latest"
  }
}
```

**After:**
```json
// package.json (root)
{
  "dependencies": {
    "mongoose": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  }
}
```

**Removed:** `express`, `cors` (not needed with Next.js)

## 🗺️ File Mapping

### Models
- `backend/models/Class.js` → `lib/models/Class.js`
- `backend/models/Task.js` → `lib/models/Task.js`
- `backend/models/User.js` → `lib/models/User.js`

### Routes
- `backend/routes/classes.js` → 
  - `pages/api/classes/index.js` (GET all, POST new)
  - `pages/api/classes/[id].js` (GET one, PUT, DELETE)

- `backend/routes/tasks.js` →
  - `pages/api/tasks/index.js` (GET all, POST new)
  - `pages/api/tasks/[id].js` (GET one, PUT, DELETE)

- `backend/routes/bulkOperations.js` →
  - `pages/api/bulk/move-tasks.js`
  - `pages/api/bulk/delete-classes.js`
  - `pages/api/bulk/complete-all-tasks.js`
  - `pages/api/bulk/duplicate-class.js`

### Utilities
- `backend/utils/transactionHelper.js` → `lib/utils/transactionHelper.js`

### Frontend Pages
- `frontend/pages/index.js` → `pages/index.js`
- `frontend/pages/tasks.js` → `pages/tasks.js`

### Configuration
- `frontend/next.config.js` → `next.config.js`
- `backend/.env` + `frontend/.env` → `.env.local`

## ⚙️ Environment Variables

**Before:**
```
# backend/.env
MONGO_URI=...
PORT=5000
```

**After:**
```
# .env.local
MONGO_URI=...
```

**Note:** PORT not needed - Next.js uses port 3000 by default (configurable with `npm run dev -- -p 4000`)

## 🚀 Running the Application

### Before
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start          # Runs on port 5000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev        # Runs on port 3000
```

### After
```bash
# Single terminal
npm install
npm run dev        # Everything runs on port 3000
```

## 🔧 Key Benefits

### 1. **Simplified Development**
- One server instead of two
- No CORS configuration needed
- Single terminal window

### 2. **Better Code Organization**
- Shared code in `lib/`
- API routes co-located with frontend
- Clear separation of concerns

### 3. **Production Deployment**
- Single deployment target
- Optimized for serverless (Vercel, AWS Lambda)
- Automatic code splitting

### 4. **Performance**
- Built-in API route optimization
- No network overhead between services
- Shared connection pooling

### 5. **TypeScript Ready**
- Easy to add TypeScript later
- Type-safe API routes
- Shared types between frontend/backend

## 🧪 Testing

### Before
```bash
cd backend
node test-transactions.js
```

### After
```bash
node test-transactions.js
```

**Note:** Test file updated to use new paths (`lib/models/`, `lib/utils/`)

## 📦 Dependencies Changes

### Removed
- `express` - Replaced by Next.js API routes
- `cors` - Not needed in monorepo
- `dotenv` - Next.js loads `.env.local` automatically

### Kept
- `mongoose` - Same MongoDB ODM
- `next` - Framework
- `react` - UI library
- `react-dom` - React renderer

### Added
- None (all dependencies were already present)

## 🎯 Next Steps

### If You Want to Add More Features:

1. **New API Route:**
   - Create `pages/api/your-route.js`
   - Export default async function handler

2. **New Model:**
   - Create `lib/models/YourModel.js`
   - Use the pattern: `mongoose.models.YourModel || mongoose.model(...)`

3. **New Shared Utility:**
   - Create in `lib/utils/`
   - Import in API routes or pages

4. **New Page:**
   - Create in `pages/`
   - Automatically routed by Next.js

## ⚠️ Important Notes

### Hot Reload Behavior
In development, Next.js hot-reloads files. This means:
- Database connections are cached (via `global.mongoose`)
- Models use `mongoose.models.X || mongoose.model()` pattern
- API routes may re-execute on file save

### API Route Limitations
- Max execution time: 10s on Vercel Hobby plan
- No WebSocket support (use external service)
- No long-running processes (use background jobs)

### Request/Response Objects
- Not Express req/res objects
- Built on Node.js http.IncomingMessage and http.ServerResponse
- req.body is automatically parsed for POST/PUT
- No req.params (use req.query instead)

## 🆘 Troubleshooting

### "Cannot find module 'lib/models/Class'"
- Ensure you're using correct import path
- Check file exists in `lib/models/Class.js`

### "MongooseError: Model already defined"
- Use pattern: `mongoose.models.Class || mongoose.model('Class', schema)`

### API route returns 404
- Check file is in `pages/api/` directory
- Ensure file exports `default async function handler(req, res)`
- Verify Next.js dev server is running

### Database connection issues
- Check `.env.local` exists and has MONGO_URI
- Verify MongoDB Atlas IP whitelist
- Test connection string in MongoDB Compass

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Mongoose with Next.js](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose)

## ✅ Verification Checklist

After migration, verify:

- [ ] `npm install` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at http://localhost:3000
- [ ] Can create/edit/delete classes
- [ ] Can create/edit/delete tasks
- [ ] Can filter tasks
- [ ] Task statistics display correctly
- [ ] Class deletion removes tasks (transaction)
- [ ] No console errors in browser
- [ ] API routes respond correctly

---

**Migration completed successfully! 🎉**

Your project now follows standard Next.js conventions and is ready for modern deployment platforms.

