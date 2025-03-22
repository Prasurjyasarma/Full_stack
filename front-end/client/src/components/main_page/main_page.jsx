import React, { useEffect, useState } from "react";
import "./main_page.css";
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import { useNavigate } from "react-router-dom";

// TaskManager Component: Manages tasks, including adding, editing, deleting, and sorting tasks.
const TaskManager = () => {
  // State variables
  const [tasks, setTasks] = useState([]); // Stores the list of tasks
  const [sortOrder, setSortOrder] = useState("-priority"); // Stores the current sorting order
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "",
    status: "pending",
  }); // Stores the new task being added
  const [editingTask, setEditingTask] = useState(null); // Stores the task being edited
  const [userFirstName, setUserFirstName] = useState("User"); // Stores the user's first name

  // Initialize useNavigate for navigation
  const navigate = useNavigate();

  // Get JWT token for authentication
  const getAuthHeader = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch tasks and user details on component mount
  useEffect(() => {
    fetchTasks();
    fetchUserDetails();
  }, []);

  // Fetch tasks from the server
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/tasks/", {
        headers: getAuthHeader(),
      });
      if (response.status === 200) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Fallback: Load sample data if server is down
      setTasks([
        {
          id: 1,
          title: "Sample Task",
          description: "Server is down sorry",
          priority: 3,
          status: "pending",
          updated_at: new Date().toISOString(),
        },
      ]);
    }
  };

  // Fetch user details from the server
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/tasks/user_details/",
        {
          headers: getAuthHeader(),
        }
      );
      if (response.status === 200 && response.data.first_name) {
        setUserFirstName(response.data.first_name); // Set the user's first name
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Handle input changes in the new task form
  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Handle adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      const newTaskData = { ...newTask };
      console.log("Sending task data:", newTaskData);

      try {
        // Attempt to add task to the backend
        const response = await axios.post(
          "http://127.0.0.1:8000/api/tasks/add/",
          newTaskData,
          {
            headers: getAuthHeader(),
          }
        );

        if (response.status === 201) {
          fetchTasks(); // Refresh tasks from server
        }
      } catch (error) {
        console.error("Error adding task to backend:", error);
        // Fallback: Add task locally if server is down
        const newId =
          tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
        setTasks([
          ...tasks,
          {
            ...newTaskData,
            id: newId,
            updated_at: new Date().toISOString(),
          },
        ]);
      }

      // Clear the form after adding the task
      setNewTask({
        title: "",
        description: "",
        priority: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Error in add task process:", error);
    }
  };

  // Handle input changes in the edit task form
  const handleEditInputChange = (e) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  // Handle deleting a task
  const handleDeleteTask = async (id) => {
    try {
      try {
        // Attempt to delete task from the backend
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/tasks/${id}/`,
          {
            headers: getAuthHeader(),
          }
        );
        if (response.status === 204) {
          setTasks(tasks.filter((task) => task.id !== id)); // Remove the task from the UI
        }
      } catch (error) {
        console.error("Error deleting task from backend:", error);
        // Fallback: Delete task locally if server is down
        setTasks(tasks.filter((task) => task.id !== id));
      }
    } catch (error) {
      console.error("Error in delete task process:", error);
    }
  };

  // Handle editing a task
  const handleEditTask = (task) => {
    setEditingTask(task); // Set the task to be edited
  };

  // Handle updating a task
  const handleUpdateTask = async (e) => {
    e.preventDefault();

    try {
      const updatedTask = {
        ...editingTask,
      };
      console.log("Updating task:", updatedTask);

      try {
        // Attempt to update task on the backend
        const response = await axios.put(
          `http://127.0.0.1:8000/api/tasks/${editingTask.id}/`,
          updatedTask,
          {
            headers: getAuthHeader(),
          }
        );

        if (response.status === 200) {
          fetchTasks(); // Refresh tasks from server
        }
      } catch (error) {
        console.error("Error updating task on backend:", error);
        // Fallback: Update task locally if server is down
        setTasks(
          tasks.map((task) =>
            task.id === editingTask.id
              ? { ...updatedTask, updated_at: new Date().toISOString() }
              : task
          )
        );
      }

      setEditingTask(null); // Clear the editing task
    } catch (error) {
      console.error("Error in update task process:", error);
    }
  };

  // Sort tasks based on the current sort order
  const sortTasks = () => {
    const sorted = [...tasks];
    if (sortOrder === "-priority") {
      return sorted.sort((a, b) => b.priority - a.priority); // High to low priority
    } else {
      return sorted.sort((a, b) => a.priority - b.priority); // Low to high priority
    }
  };

  // Handle changes in the sort order
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <a href="#" className="user-name">
            Hi, {userFirstName}
          </a>
          <a href="/history" className="history-link">
            History
          </a>
          <a href="/dashboard" className="history-link">
            Dashboard
          </a>
        </div>
        <div className="navbar-right">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <h1>Task Manager 📝</h1>

      {/* Task Form */}
      <form className="task-form" onSubmit={handleAddTask}>
        <label htmlFor="title">Task Title</label>
        <input
          type="text"
          name="title"
          id="title"
          className="form-control"
          placeholder="Enter a task"
          value={newTask.title}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          className="form-control"
          placeholder="Enter the description"
          value={newTask.description}
          onChange={handleInputChange}
          style={{ width: "100%" }}
        ></textarea>

        <label htmlFor="priority">Priority (1-5)</label>
        <input
          type="number"
          name="priority"
          id="priority"
          className="form-control"
          min="1"
          max="5"
          placeholder="Enter your priority"
          value={newTask.priority}
          onChange={handleInputChange}
          required
        />

        <label htmlFor="status">Status</label>
        <select
          name="status"
          id="status"
          className="form-control"
          value={newTask.status}
          onChange={handleInputChange}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <button type="submit" className="btn btn-primary">
          Add Task
        </button>
      </form>

      {/* Sorting and Delete All Controls */}
      <div className="controls-container">
        <form className="sort-form">
          <label htmlFor="sort">Sort by: </label>
          <select
            name="sort"
            id="sort"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="-priority">High to Low</option>
            <option value="priority">Low to High</option>
          </select>
        </form>
      </div>

      {/* Task List */}
      <div className="task-container">
        {/* Edit Task Form (Hidden by default) */}
        {editingTask && (
          <form className="task-form edit-form" onSubmit={handleUpdateTask}>
            <label htmlFor="edit-title">Task Title</label>
            <input
              type="text"
              name="title"
              id="edit-title"
              className="form-control"
              placeholder="Enter a task"
              value={editingTask.title}
              onChange={handleEditInputChange}
              required
            />

            <label htmlFor="edit-description">Description</label>
            <textarea
              name="description"
              id="edit-description"
              className="form-control"
              placeholder="Enter the description"
              value={editingTask.description || ""}
              onChange={handleEditInputChange}
            ></textarea>

            <label htmlFor="edit-priority">Priority (1-5)</label>
            <input
              type="number"
              name="priority"
              id="edit-priority"
              className="form-control"
              min="1"
              max="5"
              placeholder="Enter your priority"
              value={editingTask.priority}
              onChange={handleEditInputChange}
              required
            />

            <label htmlFor="edit-status">Status</label>
            <select
              name="status"
              id="edit-status"
              className="form-control"
              value={editingTask.status}
              onChange={handleEditInputChange}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div className="edit-buttons">
              <button type="submit" className="btn btn-primary">
                Update Task
              </button>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {sortTasks().length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found. Add a task to get started!</p>
          </div>
        ) : (
          sortTasks().map((task) => (
            <div
              key={task.id}
              className={`task-card priority-${task.priority}`}
            >
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditTask(task)}
                    title="Edit Task"
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteTask(task.id)}
                    title="Delete Task"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="task-status-container">
                <span className={`task-status ${task.status}`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
              <div className="task-body">
                <p className="task-description">
                  {task.description || "No description provided."}
                </p>
              </div>
              <div className="task-footer">
                <span className="task-priority">Priority: {task.priority}</span>
                <span className="task-date">
                  {new Date(task.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Built with ❤️ by Prasurjya Sarma</p>
          <div className="footer-links">
            <a
              href="https://www.linkedin.com/in/prasurjya-sarma/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Prasurjyasarma"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
            <a
              href="https://www.instagram.com/prasurjya_sarma/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TaskManager;
