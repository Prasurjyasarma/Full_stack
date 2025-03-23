import React, { useEffect, useState, useCallback } from "react";
import "./main_page.css";
import api from "../../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import { useNavigate } from "react-router-dom";

const TaskManager = () => {
  // State variables
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState("-priority");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "",
    status: "pending",
  });
  const [editingTask, setEditingTask] = useState(null); // Track the task being edited
  const [userFirstName, setUserFirstName] = useState("User");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false); // New state for modal visibility

  const navigate = useNavigate();

  // Fetch tasks from the server
  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get("/api/tasks/");
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
  }, []);

  // Fetch user details from the server
  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await api.get("/api/tasks/user_details/");
      if (response.status === 200 && response.data.first_name) {
        setUserFirstName(response.data.first_name);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  // Fetch tasks and user details on component mount
  useEffect(() => {
    fetchTasks();
    fetchUserDetails();
  }, [fetchTasks, fetchUserDetails]);

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
        const response = await api.post("/api/tasks/add/", newTaskData);

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

  // Handle editing a task - Now opens the modal
  const handleEditTask = (task) => {
    setEditingTask(task); // Set the task to be edited
    setShowEditModal(true); // Show the modal
  };

  // Handle input changes in the edit task form
  const handleEditInputChange = (e) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  // Handle updating a task
  const handleUpdateTask = async (e) => {
    e.preventDefault();

    try {
      const updatedTask = { ...editingTask };
      console.log("Updating task:", updatedTask);

      try {
        // Attempt to update task on the backend
        const response = await api.put(
          `/api/tasks/${editingTask.id}/`,
          updatedTask
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
      setShowEditModal(false); // Hide the modal
    } catch (error) {
      console.error("Error in update task process:", error);
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingTask(null);
    setShowEditModal(false); // Hide the modal
  };

  // Close modal when clicking outside of it
  const handleModalOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      handleCancelEdit();
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (id) => {
    try {
      try {
        // Attempt to delete task from the backend
        const response = await api.delete(`/api/tasks/${id}/`);
        if (response.status === 204) {
          setTasks(tasks.filter((task) => task.id !== id));
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

  // Handle search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter tasks by search term and then sort them
  const getFilteredAndSortedTasks = () => {
    // First filter by search term
    const filtered = searchTerm
      ? tasks.filter((task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : tasks;

    // Then sort the filtered tasks
    if (sortOrder === "-priority") {
      return [...filtered].sort((a, b) => b.priority - a.priority); // High to low priority
    } else {
      return [...filtered].sort((a, b) => a.priority - b.priority); // Low to high priority
    }
  };

  // Handle changes in the sort order
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
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
      <nav className="navbar" data-aos="fade-down">
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
      <form className="task-form" onSubmit={handleAddTask} data-aos="fade-in">
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

      {/* Sorting  */}
      <div className="controls-container" data-aos="fade-up">
        <form className="sort-form">
          <label htmlFor="sort">Sort by: </label>
          <select
            name="sort"
            id="sort"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="-priority">High to Low Priority</option>
            <option value="priority">Low to High Priority</option>
          </select>
        </form>
      </div>

      {/* Search Bar */}
      <div className="search-container" data-aos="fade-up">
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks by title..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button className="clear-search" onClick={handleClearSearch}>
            ✕
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="task-container" data-aos="fade-up">
        {/* Display search results or "no results" message */}
        {getFilteredAndSortedTasks().length === 0 ? (
          <div className="no-tasks">
            {searchTerm ? (
              <p>
                No tasks found matching "{searchTerm} 🥲". Try a different
                search term.
              </p>
            ) : (
              <p>No tasks found. Add a task to get started 😀!</p>
            )}
          </div>
        ) : (
          getFilteredAndSortedTasks().map((task) => (
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

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <div className="modal-overlay" onClick={handleModalOutsideClick}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Task</h2>
              <button className="modal-close" onClick={handleCancelEdit}>
                ×
              </button>
            </div>
            <form className="edit-form" onSubmit={handleUpdateTask}>
              <label htmlFor={`edit-title-${editingTask.id}`}>Task Title</label>
              <input
                type="text"
                name="title"
                id={`edit-title-${editingTask.id}`}
                className="form-control"
                placeholder="Enter a task"
                value={editingTask.title}
                onChange={handleEditInputChange}
                required
              />

              <label htmlFor={`edit-description-${editingTask.id}`}>
                Description
              </label>
              <textarea
                name="description"
                id={`edit-description-${editingTask.id}`}
                className="form-control"
                placeholder="Enter the description"
                value={editingTask.description || ""}
                onChange={handleEditInputChange}
              ></textarea>

              <label htmlFor={`edit-priority-${editingTask.id}`}>
                Priority (1-5)
              </label>
              <input
                type="number"
                name="priority"
                id={`edit-priority-${editingTask.id}`}
                className="form-control"
                min="1"
                max="5"
                placeholder="Enter your priority"
                value={editingTask.priority}
                onChange={handleEditInputChange}
                required
              />

              <label htmlFor={`edit-status-${editingTask.id}`}>Status</label>
              <select
                name="status"
                id={`edit-status-${editingTask.id}`}
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
                  className="btn-cancel"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
