import React, { useEffect, useState } from "react";
import api from "../../api";
import "../main_page/main_page.css";

const TaskCardHistory = ({ onDelete }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch completed tasks from the server
  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks/completed/"); // Use the api instance
      if (response.status === 200) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle deleting a task
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/api/tasks/${id}/`); // Use the api instance

      if (response.status === 204) {
        // Remove the task from the local state
        setTasks(tasks.filter((task) => task.id !== id));

        // Call parent component's onDelete if provided
        if (onDelete) {
          onDelete(id);
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <>
      <h1>History</h1>
      <div className="task-container" data-aos="fade-up">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            <p>No tasks found. Add a task to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`task-card priority-${task.priority}`}
            >
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-actions">
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(task.id)} // Use the local handleDelete function
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
    </>
  );
};

export default TaskCardHistory;
