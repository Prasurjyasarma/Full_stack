import React, { useEffect, useState } from "react";
import "./main_page.css";
import axios from "axios";

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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false); // Tracks if AI description generation is in progress

  // API key and URL for AI description generation
  const API_KEY = "088876c3dd364dc8b9aeaf6e32c68b2a";
  const API_URL = "https://api.aimlapi.com/v1";

  //! Fetch tasks from the server on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/tasks/");
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

  //! Handles input changes in the new task form
  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  // Handles adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      const newTaskData = { ...newTask };
      console.log("Sending task data:", newTaskData);

      try {
        // Attempt to add task to the backend
        const response = await axios.post(
          "http://127.0.0.1:8000/api/tasks/add/",
          newTaskData
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

  // Handles input changes in the edit task form
  const handleEditInputChange = (e) => {
    setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
  };

  // Handles deleting a task
  const handleDeleteTask = async (id) => {
    try {
      try {
        // Attempt to delete task from the backend
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/tasks/${id}/`
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

  // Handles editing a task
  const handleEditTask = (task) => {
    setEditingTask(task); // Set the task to be edited
  };

  // Handles updating a task
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
    } catch (error) {
      console.error("Error in update task process:", error);
    }
  };

  // Sorts tasks based on the current sort order
  const sortTasks = () => {
    const sorted = [...tasks];
    if (sortOrder === "-priority") {
      return sorted.sort((a, b) => b.priority - a.priority); // High to low priority
    } else {
      return sorted.sort((a, b) => a.priority - b.priority); // Low to high priority
    }
  };

  // Handles changes in the sort order
  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Generates a description locally if the AI API fails
  const generateLocalDescription = (title) => {
    const templates = [
      `Complete all required steps for "${title}". This task requires attention to detail and following established procedures.`,
    ];

    // Use the API key as a seed for "randomness"
    const seed = API_KEY.split("").reduce(
      (sum, char) => sum + char.charCodeAt(0),
      0
    );
    const index = seed % templates.length;

    return templates[index]; // Return a template with the title inserted
  };

  // Generates an AI description using the AI API
  const generateAIDescription = async () => {
    if (!newTask.title) {
      alert("Please enter a task title first");
      return;
    }

    setIsGeneratingDescription(true);

    try {
      // Call the AI API to generate a description
      const response = await axios.post(
        `${API_URL}/generate-description`,
        {
          title: newTask.title,
          taskType: "general",
          maxLength: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.description) {
        setNewTask({ ...newTask, description: response.data.description });
      } else {
        // Fallback to local generation if API response is unexpected
        console.warn(
          "Unexpected API response format, using fallback:",
          response.data
        );
        const fallbackDescription = generateLocalDescription(newTask.title);
        setNewTask({ ...newTask, description: fallbackDescription });
      }
    } catch (error) {
      console.error("Error calling AI API:", error);

      // Try backend as a second fallback
      try {
        const backendResponse = await axios.post(
          "http://127.0.0.1:8000/api/tasks/generate/",
          { title: newTask.title }
        );

        if (
          backendResponse.status === 200 &&
          backendResponse.data.description
        ) {
          setNewTask({
            ...newTask,
            description: backendResponse.data.description,
          });
        } else {
          throw new Error("Invalid backend response");
        }
      } catch (backendError) {
        console.error("Backend fallback also failed:", backendError);

        // Use local generation as a final fallback
        const fallbackDescription = generateLocalDescription(newTask.title);
        setNewTask({ ...newTask, description: fallbackDescription });
      }
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Render the TaskManager component
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <a href="#" className="user-name">
            Hi, User
          </a>
          <a href="/history" className="history-link">
            History
          </a>
          <a href="/dashboard" className="history-link">
            Dashboard
          </a>
        </div>
        <div className="navbar-right">
          <a href="#" className="logout-btn">
            Lgout
          </a>
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
        <div className="description-container" style={{ position: "relative" }}>
          <textarea
            name="description"
            id="description"
            className="form-control"
            placeholder="Enter the description"
            value={newTask.description}
            onChange={handleInputChange}
            style={{ width: "100%" }}
          ></textarea>
          <button
            type="button"
            className="btn-ai"
            onClick={generateAIDescription}
            title="Generate AI Description"
            disabled={isGeneratingDescription || !newTask.title}
            style={{
              position: "absolute",
              right: "10px",
              top: "10px",
              opacity: isGeneratingDescription ? 0.5 : 1,
            }}
          >
            {isGeneratingDescription ? "⏳" : "✨"}
          </button>
        </div>

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
