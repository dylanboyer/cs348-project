# Setup Checklist

Follow this checklist to get your refactored Next.js project up and running.

## ✅ Pre-Setup

- [x] Project refactored to Next.js monorepo structure
- [x] Dependencies installed
- [x] Old backend/frontend folders removed

## 🔧 Configuration Steps

### 1. Create Environment File

- [ ] Create `.env.local` file in project root
- [ ] Add your MongoDB connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Where to find your MONGO_URI:**
- Log into MongoDB Atlas
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your actual password

### 2. Verify Node.js Version

- [ ] Check Node.js version: `node --version`
- [ ] Should be v18.17.0 or higher
- [ ] If not, update Node.js from [nodejs.org](https://nodejs.org)

### 3. Test Connection

- [ ] Run: `npm run dev`
- [ ] Should see: "ready - started server on 0.0.0.0:3000"
- [ ] No MongoDB connection errors

## 🧪 Verification Tests

### Test 1: Homepage Loads

- [ ] Open browser to http://localhost:3000
- [ ] Page loads without errors
- [ ] See "Course Management" heading
- [ ] No console errors (check browser DevTools)

### Test 2: Create a Course

- [ ] Enter course name: "Test Course"
- [ ] Enter description: "Testing the app"
- [ ] Click "Add Course"
- [ ] Course appears in the table below
- [ ] ✅ Success if course is saved to database

### Test 3: Create a Task

- [ ] Click "View Tasks" on your test course
- [ ] Fill out task form:
  - Name: "Test Task"
  - Course: Select "Test Course"
  - Priority: Medium
- [ ] Click "Add Task"
- [ ] Task appears in the table
- [ ] ✅ Success if task is saved

### Test 4: Filter Tasks

- [ ] On tasks page, use filters:
  - Select "Incomplete" status
  - Click filter button
- [ ] Only incomplete tasks show
- [ ] ✅ Success if filtering works

### Test 5: Task Statistics

- [ ] Click "Show Report" button
- [ ] Statistics display:
  - Total Tasks
  - Completed Tasks
  - Estimated Time
- [ ] ✅ Success if numbers are correct

### Test 6: Transaction Test

- [ ] Click "Delete" on a course that has tasks
- [ ] Confirm deletion
- [ ] Course and ALL its tasks are deleted together
- [ ] ✅ Success if no orphaned tasks remain

### Test 7: API Routes Work

- [ ] Open http://localhost:3000/api/classes
- [ ] Should see JSON array of classes
- [ ] Open http://localhost:3000/api/tasks
- [ ] Should see JSON array of tasks
- [ ] ✅ Success if API returns data

### Test 8: Run Transaction Tests

- [ ] In terminal: `npm run test-transactions`
- [ ] All tests should pass:
  - ✅ Transaction Support Check
  - ✅ Atomicity Test
  - ✅ Isolation Test
  - ✅ Consistency Test
  - ✅ Durability Test
- [ ] ✅ Success if all 5 tests pass

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solutions:**
1. Check `.env.local` file exists
2. Verify MONGO_URI is correct
3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
4. Ensure cluster is running

### Issue: "Port 3000 already in use"

**Solutions:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue: "Module not found"

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: API routes return 404

**Solutions:**
1. Ensure files are in `pages/api/` directory
2. Restart dev server: `npm run dev`
3. Check file names match URL (e.g., `[id].js` for dynamic routes)

### Issue: Mongoose model errors

**Solutions:**
1. Check models use: `mongoose.models.X || mongoose.model('X', schema)`
2. Restart dev server to clear cache

## 📊 Success Indicators

Your setup is complete when:

✅ All tests above pass
✅ No errors in terminal
✅ No errors in browser console
✅ Can create/edit/delete courses
✅ Can create/edit/delete tasks
✅ Filters work correctly
✅ Transactions work (class deletion)
✅ API endpoints respond

## 🎯 Performance Check

- [ ] Page loads in < 2 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks (check dev tools)
- [ ] Smooth navigation between pages

## 🔐 Security Check

- [ ] `.env.local` is in `.gitignore`
- [ ] No credentials in code
- [ ] Input sanitization working (check API routes)

## 📱 Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)

## 🚀 Ready for Development

Once all checkboxes are checked:

✅ **Your Next.js project is ready!**

You can now:
- Add new features
- Deploy to production
- Continue development

## 📚 Next Steps

1. **Read Documentation:**
   - [ ] README.md
   - [ ] MIGRATION_GUIDE.md
   - [ ] REFACTORING_SUMMARY.md

2. **Explore Code:**
   - [ ] Check `pages/api/` for API routes
   - [ ] Review `lib/models/` for data models
   - [ ] Understand `lib/mongodb.js` connection

3. **Deploy (Optional):**
   - [ ] Push to GitHub
   - [ ] Connect to Vercel
   - [ ] Add environment variables
   - [ ] Deploy!

## 🆘 Still Having Issues?

1. Check all documentation files
2. Review error messages carefully
3. Verify MongoDB connection string
4. Ensure Node.js version is correct
5. Try reinstalling dependencies

## ✨ You're All Set!

Happy coding! 🎉

---

**Need help?** Review the documentation files or check the terminal/browser console for error details.

