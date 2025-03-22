import React, { useEffect, useState } from "react";
import axios from "axios";
import "../main_page/main_page.css"; // Ensure this CSS file exists

const TaskCardHistory = ({ onDelete }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/tasks/completed/"
      );
      if (response.status === 200) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return (
    <>
      <h1>History</h1>
      <div className="task-container">
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
                    onClick={() => onDelete(task.id)}
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
