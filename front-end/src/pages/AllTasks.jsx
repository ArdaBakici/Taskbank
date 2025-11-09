import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function AllTasks({
  embedded = false,
  limit,
  renderActions,
  showFooter = true,
}) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortingMethod, setSortingMethod] = useState(embedded ? 'deadline' : 'id');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        // Construct API URL with query parameters
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
        const params = new URLSearchParams();
        
        // When embedded (like in Home), use limit and sorting_method
        if (embedded && limit) {
          params.append('num_of_tasks', limit.toString());
        }
        
        // Always add sorting method
        params.append('sorting_method', sortingMethod);
        
        const url = `${apiUrl}/tasks?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          // The API returns tasks in data.tasks array
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error("Failed to load tasks", err);
        if (isMounted) {
          setError("Unable to load tasks right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [embedded, limit, sortingMethod]);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortMenu && !event.target.closest('.sort-dropdown-container')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const handleSortChange = (method) => {
    setSortingMethod(method);
    setShowSortMenu(false);
    setLoading(true);
  };

  const sortOptions = [
    { value: 'id', label: 'ID (Default)' },
    { value: 'deadline', label: 'Deadline (Earliest)' },
    { value: 'deadline_desc', label: 'Deadline (Latest)' },
    { value: 'urgency_desc', label: 'Urgency (High to Low)' },
    { value: 'urgency_asc', label: 'Urgency (Low to High)' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Name (A-Z)' },
    { value: 'assignee', label: 'Assignee' },
    { value: 'project', label: 'Project' },
  ];

  const listContent = (
    <>
      <div className="dashboard-title-actions">
        <h2>Tasks</h2>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/tasks/new")}>Create</button>
          <div className="sort-dropdown-container">
            <button onClick={() => setShowSortMenu(!showSortMenu)}>
              Sort {sortingMethod !== 'id' && `(${sortOptions.find(opt => opt.value === sortingMethod)?.label})`}
            </button>
            {showSortMenu && (
              <div className="sort-dropdown-menu">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`sort-option ${sortingMethod === option.value ? 'active' : ''}`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {renderActions && renderActions(navigate)}
        </div>
      </div>

      <div className="task-list">
        {loading && <p>Loading tasks...</p>}
        {error && <p>{error}</p>}
        {!loading &&
          !error &&
          tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              className="task-row task-row-button"
              onClick={() => navigate(`/task/${t.id}`)}
            >
              <div>{t.name}</div>
              <div>{renderTags(t.tags)}</div>
              <div>{t.deadline}</div>
            </button>
          ))}
      </div>
    </>
  );

  if (embedded) {
    return listContent;
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        {listContent}

        {showFooter && (
          <button
            className="section-footer-button tasks-return"
            onClick={() => navigate("/home")}
          >
            Return
          </button>
        )}
      </main>
    </div>
  );
}
