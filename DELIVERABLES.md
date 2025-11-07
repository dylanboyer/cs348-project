# Project Deliverables - Quick Reference

This document maps each requirement to where it's implemented in the codebase.

---

## a) Database Design (Tables, Primary Keys, Foreign Keys)

### Location: `DATABASE.md` (lines 1-100) and `backend/models/`

### Summary:

**Three Collections (Tables):**

1. **Users** (Primary Key: `_id`)
   - Fields: username, password, email, createdAt
   - File: `backend/models/User.js`

2. **Classes** (Primary Key: `_id`)
   - Fields: name, description, userId (FK), createdAt
   - Foreign Key: `userId` → Users._id
   - File: `backend/models/Class.js`

3. **Tasks** (Primary Key: `_id`)
   - Fields: name, description, classId (FK), estimatedTime, dueDate, completed, priority, createdAt
   - Foreign Key: `classId` → Classes._id
   - File: `backend/models/Task.js`

### Entity Relationships:
- User → Classes: **One-to-Many** (One user has many classes)
- Class → Tasks: **One-to-Many** (One class has many tasks)

### View Implementation:
- Schema definitions: `backend/models/*.js`
- Detailed documentation: `DATABASE.md` (section a)
- ER diagram: `DATABASE.md` (lines 60-90)

---

## b) Insert, Update, and Delete Operations

### Location: `backend/routes/classes.js` and `DATABASE.md` (lines 102-180)

### Demonstrated on: **Classes Table**

### 1. INSERT (Create)
**File:** `backend/routes/classes.js` (lines 16-31)

```javascript
// POST /api/classes
router.post('/', async (req, res) => {
  const classItem = new Class({
    name: req.body.name,
    description: req.body.description,
    userId: req.body.userId || '000000000000000000000000'
  });
  const newClass = await classItem.save();
  res.status(201).json(newClass);
});
```

**Frontend Usage:** `frontend/pages/index.js` (handleAddClass function, lines 36-52)

**How to Test:**
1. Go to http://localhost:3000
2. Fill in "Course Name" and "Description"
3. Click "Add Course"
4. New course appears in the table below

---

### 2. UPDATE
**File:** `backend/routes/classes.js` (lines 33-56)

```javascript
// PUT /api/classes/:id
router.put('/:id', async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  if (req.body.name != null) {
    classItem.name = req.body.name;
  }
  if (req.body.description != null) {
    classItem.description = req.body.description;
  }
  const updatedClass = await classItem.save();
  res.json(updatedClass);
});
```

**Frontend Usage:** `frontend/pages/index.js` (handleUpdateClass function, lines 64-81)

**How to Test:**
1. Click "Edit" button next to a course
2. Form populates with current values
3. Modify the fields
4. Click "Update Course"
5. Table updates with new values

---

### 3. DELETE
**File:** `backend/routes/classes.js` (lines 58-74)

```javascript
// DELETE /api/classes/:id
router.delete('/:id', async (req, res) => {
  const classItem = await Class.findById(req.params.id);
  // Cascade delete: Also delete all tasks associated with this class
  await Task.deleteMany({ classId: req.params.id });
  await Class.findByIdAndDelete(req.params.id);
  res.json({ message: 'Class and associated tasks deleted' });
});
```

**Frontend Usage:** `frontend/pages/index.js` (handleDeleteClass function, lines 83-95)

**How to Test:**
1. Click "Delete" button next to a course
2. Confirm the deletion dialog
3. Course and all its tasks are removed
4. Table updates immediately

**Documentation:** `DATABASE.md` (lines 102-180) contains MongoDB command equivalents

---

## c) Filter Data and Display Reports

### Location: `backend/routes/tasks.js` and `frontend/pages/tasks.js`

### Filtering Implementation

**Backend:** `backend/routes/tasks.js` (lines 6-58)

Supports filtering by:
- **classId** - Show tasks for specific course
- **completed** - true/false (completed vs incomplete)
- **priority** - low/medium/high
- **estimatedTime range** - minTime/maxTime (in minutes)
- **dueDate range** - startDate/endDate

**Example Query:**
```javascript
// Filter: incomplete tasks, high priority, 30-120 minutes
GET /api/tasks?completed=false&priority=high&minTime=30&maxTime=120
```

**Code Example from backend/routes/tasks.js:**

```javascript
const filter = {};

// Filter by estimated time range
if (req.query.minTime || req.query.maxTime) {
  filter.estimatedTime = {};
  if (req.query.minTime) {
    filter.estimatedTime.$gte = parseInt(req.query.minTime);
  }
  if (req.query.maxTime) {
    filter.estimatedTime.$lte = parseInt(req.query.maxTime);
  }
}

const tasks = await Task.find(filter).populate('classId', 'name');
```

---

### Report Display (Before/After Changes)

**Frontend:** `frontend/pages/tasks.js` (lines 220-250)

**Report Includes:**
- Total Tasks
- Completed Tasks
- Incomplete Tasks
- Total Estimated Time
- Average Estimated Time

**Implementation:**

```javascript
const getStats = () => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalEstimatedTime = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
  const avgEstimatedTime = totalTasks > 0 ? (totalEstimatedTime / totalTasks).toFixed(2) : 0;
  
  return {
    totalTasks,
    completedTasks,
    incompleteTasks: totalTasks - completedTasks,
    totalEstimatedTime,
    avgEstimatedTime
  };
};
```

**How to Test - See Report Before/After Changes:**

1. **Go to Tasks page:** Click "View Tasks" on any course
2. **Show initial report:** Click "Show Report" button
   ```
   Example Before:
   Total Tasks: 5
   Completed Tasks: 2
   Incomplete Tasks: 3
   Total Estimated Time: 450 minutes
   Average Estimated Time: 90 minutes
   ```

3. **Make a change:** Mark a task as completed (edit task, check "Completed", update)
4. **Report updates automatically:**
   ```
   Example After:
   Total Tasks: 5
   Completed Tasks: 3  ← Changed
   Incomplete Tasks: 2  ← Changed
   Total Estimated Time: 450 minutes
   Average Estimated Time: 90 minutes
   ```

5. **Filter and see report change:** 
   - Set filter: "Completed Status: Completed"
   - Report now shows only statistics for completed tasks
   - Clear filter to see all tasks again

**Documentation:** `DATABASE.md` (lines 182-260) contains detailed examples

---

## d) Dynamic User Interface Components

### Location: `frontend/pages/tasks.js` (lines 40-50, 350-366)

### Requirement:
UI components (dropdown/list) must be populated **dynamically from database**, NOT hard-coded.

### Implementation: Course Selection Dropdown

**Step 1: Fetch classes from database**

```javascript
// frontend/pages/tasks.js (lines 40-50)
const fetchClasses = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/classes');
    const data = await response.json();
    setAllClasses(data);  // Store in state
  } catch (error) {
    console.error('Error fetching classes:', error);
  }
};

useEffect(() => {
  fetchClasses();  // Load on component mount
}, []);
```

**Step 2: Backend API returns data**

```javascript
// backend/routes/classes.js (lines 6-15)
router.get('/', async (req, res) => {
  const classes = await Class.find().sort({ createdAt: -1 });
  res.json(classes);
});
```

**Step 3: Dynamically populate dropdown**

```javascript
// frontend/pages/tasks.js (lines 350-366)
<select
  name="classId"
  value={formData.classId}
  onChange={handleInputChange}
  required
>
  <option value="">Select a course</option>
  {allClasses.map(c => (
    <option key={c._id} value={c._id}>{c.name}</option>
  ))}
</select>
<em>(Dynamically loaded from database)</em>
```

### Why This Meets the Requirement:

✅ **Data source:** MongoDB database (not hard-coded)  
✅ **Dynamic loading:** Fetched via API call when page loads  
✅ **Real-time updates:** If you add a new course and refresh, it appears in the dropdown  
✅ **No hard-coded values:** All course names come from `Class.find()` query  

### How to Demonstrate:

1. **Show the code:** `frontend/pages/tasks.js` (fetchClasses function)
2. **Add a new course:** 
   - Go to home page
   - Add course "CS350 - Operating Systems"
   - Navigate to Tasks page
3. **Show dropdown:** 
   - Click "Course" dropdown in the form
   - "CS350 - Operating Systems" appears
   - This came from database, not code
4. **Show database query:**
   - Open `backend/routes/classes.js`
   - Show `Class.find()` query
5. **Check network tab:**
   - Open browser DevTools → Network
   - Refresh Tasks page
   - See GET request to `/api/classes`
   - Response contains array of course objects

**Documentation:** `DATABASE.md` (lines 262-340) has detailed explanation

---

## File Structure Summary

```
CS348-Project/
├── backend/
│   ├── models/
│   │   ├── User.js          ← Schema definition (Deliverable a)
│   │   ├── Class.js         ← Schema definition (Deliverable a)
│   │   └── Task.js          ← Schema definition (Deliverable a)
│   ├── routes/
│   │   ├── classes.js       ← CRUD operations (Deliverable b)
│   │   └── tasks.js         ← Filtering (Deliverable c)
│   └── server.js            ← Main backend file
├── frontend/
│   └── pages/
│       ├── index.js         ← Course management UI
│       └── tasks.js         ← Task management + filtering + reports (Deliverables c, d)
├── DATABASE.md              ← Comprehensive documentation (All deliverables)
├── DELIVERABLES.md          ← This file (Quick reference)
├── SETUP_MONGODB.md         ← MongoDB setup guide
└── README.md                ← Project overview and usage
```

---

## Quick Demo Checklist

Use this checklist to demonstrate each deliverable:

### ✅ Deliverable A: Database Design
- [ ] Show `backend/models/` directory
- [ ] Open `Class.js` - explain schema
- [ ] Open `Task.js` - explain foreign key (classId)
- [ ] Open `DATABASE.md` - show ER diagram

### ✅ Deliverable B: Insert, Update, Delete
- [ ] Open browser to http://localhost:3000
- [ ] **INSERT:** Add a new course
- [ ] **UPDATE:** Edit the course
- [ ] **DELETE:** Delete the course
- [ ] Show code in `backend/routes/classes.js`

### ✅ Deliverable C: Filtering & Reports
- [ ] Go to Tasks page
- [ ] Add 3-4 tasks with different properties
- [ ] Click "Show Report" (before state)
- [ ] Apply filters: set minTime=30, maxTime=120
- [ ] Show filtered results in report (after state)
- [ ] Show code in `backend/routes/tasks.js` (filtering logic)
- [ ] Show code in `frontend/pages/tasks.js` (report calculation)

### ✅ Deliverable D: Dynamic UI
- [ ] Open `frontend/pages/tasks.js` in editor
- [ ] Highlight `fetchClasses()` function
- [ ] Show dropdown render: `allClasses.map()`
- [ ] In browser: Open DevTools → Network tab
- [ ] Refresh Tasks page
- [ ] Show API call to `/api/classes` and response data
- [ ] Add a new course from home page
- [ ] Return to Tasks page, refresh
- [ ] Show new course appears in dropdown (dynamic!)

---

## Running the Demo

1. Ensure MongoDB is connected (see `SETUP_MONGODB.md`)
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm run dev`
4. Open http://localhost:3000
5. Follow the demo checklist above

---

## Questions?

- Full database documentation: `DATABASE.md`
- Setup help: `SETUP_MONGODB.md`
- Usage guide: `README.md`

