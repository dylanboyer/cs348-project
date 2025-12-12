import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [classes, setClasses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add a new class
  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const newClass = await response.json();
      setClasses([newClass, ...classes]);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error adding class:', error);
    }
  };

  // Start editing a class
  const handleEditClick = (classItem) => {
    setEditingId(classItem._id);
    setFormData({
      name: classItem.name,
      description: classItem.description
    });
  };

  // Update a class
  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/classes/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const updatedClass = await response.json();
      setClasses(classes.map(c => c._id === editingId ? updatedClass : c));
      setEditingId(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  // Delete a class
  const handleDeleteClass = async (id) => {
    if (confirm('Are you sure you want to delete this class and all its tasks?')) {
      try {
        await fetch(`/api/classes/${id}`, {
          method: 'DELETE',
        });
        setClasses(classes.filter(c => c._id !== id));
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Course Management</h1>
      
      {/* Add/Edit Form */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h2>{editingId ? 'Edit Course' : 'Add New Course'}</h2>
        <form onSubmit={editingId ? handleUpdateClass : handleAddClass}>
          <div>
            <label>Course Name: </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Description: </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={{ padding: '5px 15px', marginRight: '10px' }}>
              {editingId ? 'Update Course' : 'Add Course'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '5px 15px' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Classes List */}
      <div>
        <h2>All Courses ({classes.length})</h2>
        {classes.length === 0 ? (
          <p>No courses yet. Add one above!</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Description</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem._id}>
                  <td>{classItem.name}</td>
                  <td>{classItem.description || 'N/A'}</td>
                  <td>{new Date(classItem.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/tasks?classId=${classItem._id}&className=${encodeURIComponent(classItem.name)}`}>
                      <button style={{ padding: '5px 10px', marginRight: '5px' }}>View Tasks</button>
                    </Link>
                    <button 
                      onClick={() => handleEditClick(classItem)} 
                      style={{ padding: '5px 10px', marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClass(classItem._id)} 
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

