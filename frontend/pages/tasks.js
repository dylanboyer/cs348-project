import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Tasks() {
  const router = useRouter();
  const { classId, className } = router.query;

  const [tasks, setTasks] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    classId: '',
    estimatedTime: '',
    dueDate: '',
    completed: false,
    priority: 'medium'
  });

  // Filter state
  const [filters, setFilters] = useState({
    completed: '',
    priority: '',
    minTime: '',
    maxTime: '',
    startDate: '',
    endDate: ''
  });

  const [showReport, setShowReport] = useState(false);

  // Fetch all classes for the dropdown (dynamic loading as per requirement d)
  const fetchClasses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/classes');
      const data = await response.json();
      setAllClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch tasks with filters
  const fetchTasks = async () => {
    try {
      let url = 'http://localhost:5000/api/tasks?';
      
      if (classId) {
        url += `classId=${classId}&`;
      }
      
      if (filters.completed !== '') {
        url += `completed=${filters.completed}&`;
      }
      
      if (filters.priority) {
        url += `priority=${filters.priority}&`;
      }
      
      if (filters.minTime) {
        url += `minTime=${filters.minTime}&`;
      }
      
      if (filters.maxTime) {
        url += `maxTime=${filters.maxTime}&`;
      }
      
      if (filters.startDate) {
        url += `startDate=${filters.startDate}&`;
      }
      
      if (filters.endDate) {
        url += `endDate=${filters.endDate}&`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classId) {
      setFormData(prev => ({ ...prev, classId }));
    }
    fetchTasks();
  }, [classId, filters]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      completed: '',
      priority: '',
      minTime: '',
      maxTime: '',
      startDate: '',
      endDate: ''
    });
  };

  // Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setFormData({
        name: '',
        description: '',
        classId: classId || '',
        estimatedTime: '',
        dueDate: '',
        completed: false,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Start editing a task
  const handleEditClick = (task) => {
    setEditingId(task._id);
    setFormData({
      name: task.name,
      description: task.description,
      classId: task.classId._id || task.classId,
      estimatedTime: task.estimatedTime || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      completed: task.completed,
      priority: task.priority
    });
  };

  // Update a task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t._id === editingId ? updatedTask : t));
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        classId: classId || '',
        estimatedTime: '',
        dueDate: '',
        completed: false,
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(`http://localhost:5000/api/tasks/${id}`, {
          method: 'DELETE',
        });
        setTasks(tasks.filter(t => t._id !== id));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      classId: classId || '',
      estimatedTime: '',
      dueDate: '',
      completed: false,
      priority: 'medium'
    });
  };

  // Calculate statistics for report
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

  const stats = getStats();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/">
          <button style={{ padding: '5px 15px' }}>← Back to Courses</button>
        </Link>
      </div>

      <h1>Task Management {className && `- ${className}`}</h1>

      {/* Filter Section */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', backgroundColor: '#f9f9f9' }}>
        <h2>Filter Tasks</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div>
            <label>Completed Status: </label>
            <select 
              name="completed" 
              value={filters.completed} 
              onChange={handleFilterChange}
              style={{ padding: '5px', width: '100%' }}
            >
              <option value="">All</option>
              <option value="true">Completed</option>
              <option value="false">Incomplete</option>
            </select>
          </div>
          <div>
            <label>Priority: </label>
            <select 
              name="priority" 
              value={filters.priority} 
              onChange={handleFilterChange}
              style={{ padding: '5px', width: '100%' }}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label>Min Time (min): </label>
            <input
              type="number"
              name="minTime"
              value={filters.minTime}
              onChange={handleFilterChange}
              style={{ padding: '5px', width: '100%' }}
            />
          </div>
          <div>
            <label>Max Time (min): </label>
            <input
              type="number"
              name="maxTime"
              value={filters.maxTime}
              onChange={handleFilterChange}
              style={{ padding: '5px', width: '100%' }}
            />
          </div>
          <div>
            <label>Start Date: </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={{ padding: '5px', width: '100%' }}
            />
          </div>
          <div>
            <label>End Date: </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={{ padding: '5px', width: '100%' }}
            />
          </div>
        </div>
        <button 
          onClick={handleClearFilters} 
          style={{ padding: '5px 15px', marginTop: '10px' }}
        >
          Clear Filters
        </button>
        <button 
          onClick={() => setShowReport(!showReport)} 
          style={{ padding: '5px 15px', marginTop: '10px', marginLeft: '10px' }}
        >
          {showReport ? 'Hide Report' : 'Show Report'}
        </button>
      </div>

      {/* Report Section */}
      {showReport && (
        <div style={{ marginBottom: '30px', border: '2px solid #333', padding: '15px', backgroundColor: '#e8f4f8' }}>
          <h2>Task Statistics Report</h2>
          <p><strong>Total Tasks:</strong> {stats.totalTasks}</p>
          <p><strong>Completed Tasks:</strong> {stats.completedTasks}</p>
          <p><strong>Incomplete Tasks:</strong> {stats.incompleteTasks}</p>
          <p><strong>Total Estimated Time:</strong> {stats.totalEstimatedTime} minutes</p>
          <p><strong>Average Estimated Time:</strong> {stats.avgEstimatedTime} minutes</p>
          <p><em>Note: This report updates dynamically based on current filters and data.</em></p>
        </div>
      )}

      {/* Add/Edit Form */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>{editingId ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={editingId ? handleUpdateTask : handleAddTask}>
          <div>
            <label>Task Name: </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Description: </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{ marginLeft: '10px', padding: '5px', width: '300px', height: '60px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Course: </label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleInputChange}
              required
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="">Select a course</option>
              {allClasses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <em style={{ marginLeft: '10px', fontSize: '0.9em' }}>
              (Dynamically loaded from database)
            </em>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Estimated Time (minutes): </label>
            <input
              type="number"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleInputChange}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Due Date: </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Priority: </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleInputChange}
              />
              {' '}Completed
            </label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={{ padding: '5px 15px', marginRight: '10px' }}>
              {editingId ? 'Update Task' : 'Add Task'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '5px 15px' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tasks List */}
      <div>
        <h2>All Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p>No tasks found. Add one above or adjust filters!</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Task Name</th>
                <th>Course</th>
                <th>Description</th>
                <th>Est. Time (min)</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} style={{ backgroundColor: task.completed ? '#d4edda' : 'white' }}>
                  <td>{task.name}</td>
                  <td>{task.classId.name}</td>
                  <td>{task.description || 'N/A'}</td>
                  <td>{task.estimatedTime || 'N/A'}</td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{task.priority}</td>
                  <td>{task.completed ? '✓ Complete' : '○ Incomplete'}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(task)} 
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)} 
                      style={{ padding: '5px 10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

