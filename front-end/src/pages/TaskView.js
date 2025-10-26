import React, { useEffect, useState } from "react";
import "./TaskView.css";

function TaskView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  //Fetch tasks from an API or static data
  useEffect(() => {
    // Simulating fetching data
    const fetchTasks = async () => {
      setLoading(true);
      try {
        
        const mockData = [
          { id: 1, title: "Design homepage", status: "In Progress" },
          { id: 2, title: "Implement login", status: "Completed" },
          { id: 3, title: "Set up database", status: "Pending" },
        ];
        setTasks(mockData);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="task-view">
  <header className="taskview-header">
    <h1 className="taskview-title">Taskbank</h1>
    <img
      src="/logo192.png"
      alt="Taskbank logo"
      className="taskview-logo"
    />
  </header>

  <main className="taskview-content">
    <h2 className="taskview-subtitle">Task View</h2>
    <h3 className="task-name">Design Homepage</h3>
    <p className="task-desc">Create a modern, responsive homepage for the web app.</p>

    <div className="task-details">
      <p><strong>Deadline:</strong> 31 Oct 2025</p>
      <p><strong>Urgency:</strong> High</p>
      <p><strong>Project:</strong> Website Revamp</p>
    </div>

    <div className="task-buttons">
      <button className="btn-edit">Edit</button>
      <button className="btn-return">Return</button>
    </div>
  </main>
</div>


  );
}

export default TaskView;
