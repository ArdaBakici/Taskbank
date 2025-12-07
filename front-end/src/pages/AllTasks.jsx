import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCircle, FiCheckCircle, FiLoader, FiPauseCircle, FiAlertCircle, FiFileText } from "react-icons/fi";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

const getNextStatus= (currentStatus)=>{
    const statusCycle = {
    "Not Started": "In Progress",
    "In Progress": "Completed",
    "Completed": "In Progress",
    "On Hold": "In Progress",
  };
  return statusCycle[currentStatus] || "Not Started";
}
export default function AllTasks({

  embedded = false,

  limit,
  renderActions,
  showFooter = true,
  filterBy = null,
  filterValue = null,
  buttons_bitmap = 0b1111, // Default: all buttons shown (bit 0: Create, bit 1: Sort, bit 2: Filter, bit 3: Custom actions)
  hideFilterDisplay = false, // Hide the permanent filterBy/filterValue display
}) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortingMethod, setSortingMethod] = useState('smart');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [additionalFilters, setAdditionalFilters] = useState({});

  // Button visibility flags from bitmap
  const showCreateButton = (buttons_bitmap & 0b0001) !== 0; // bit 0
  const showSortButton = (buttons_bitmap & 0b0010) !== 0;   // bit 1
  const showFilterButton = (buttons_bitmap & 0b0100) !== 0; // bit 2
  const showCustomActions = (buttons_bitmap & 0b1000) !== 0; // bit 3

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      try {
        // Construct API URL with query parameters
        const params = new URLSearchParams();
        
        // When embedded (like in Home), use limit and sorting_method
        if (embedded && limit) {
          params.append('num_of_tasks', limit.toString());
        }
        
        // Always add sorting method
        params.append('sorting_method', sortingMethod);
        
        // Build filters object
        const filters = {};
        
        // Add permanent filter from props (unremovable)
        if (filterBy && filterValue) {
          filters[filterBy] = filterValue;
        }
        
        // Add additional filters from filter button (removable)
        Object.assign(filters, additionalFilters);
        
        // Add filters as JSON string if there are any
        if (Object.keys(filters).length > 0) {
          params.append('filters', JSON.stringify(filters));
        }
        
        const url = `/tasks?${params.toString()}`;
        const response = await authenticatedFetch(url);
        
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
  }, [embedded, limit, sortingMethod, filterBy, filterValue, additionalFilters]);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortMenu && !event.target.closest('.sort-dropdown-container')) {
        setShowSortMenu(false);
      }
      if (showFilterMenu && !event.target.closest('.filter-dropdown-container')) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu, showFilterMenu]);

  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—";
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline";
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      "In Progress": <FiLoader className="status-icon-inprogress" />,
      "Not Started": <FiCircle className="status-icon-notstarted" />,
      "Completed": <FiCheckCircle className="status-icon-completed" />,
      "On Hold": <FiPauseCircle className="status-icon-onhold" />,
    };
    return icons[status] || <FiFileText className="status-icon-default" />;
  };


  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    // This creates a date in your LOCAL timezone with that year-month-day
    return new Date(year, month - 1, day);
  };
  const isOverdue = (deadline, status) => {
    if (status === "Completed") return false;
    const today = new Date();
    const taskDeadline = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    taskDeadline.setHours(0, 0, 0, 0);
    return taskDeadline < today;
  };

   const isDueTomorrow = (deadline, status) => {
    if (status === "Completed" || !deadline) return false;

    const today = new Date();
    const d = parseLocalDate(deadline);

    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffDays = (d - today) / (1000 * 60 * 60 * 24);
    return diffDays === 1;
  };

  const handleStatusClick= async(e, taskId, currentStatus)=>{
    e.stopPropagation(); 
    const nextStatus= getNextStatus(currentStatus);
    try{
    const response = await authenticatedFetch(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    if(!response.ok){
      throw new Error("failed to update status")
    }
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === taskId ? { ...task, status: nextStatus } : task
      )
    );

    }
  catch (error){
    console.error("failed to update status", error);
  } }


  const handleSortChange = (method) => {
    
    setShowSortMenu(false);
    // If user clicked the same sort option, do nothing
    if (method === sortingMethod) return;
    setSortingMethod(method);
    setLoading(true);
  };

  const handleFilterChange = (filterByType, filterVal) => {
    setAdditionalFilters(prev => ({
      ...prev,
      [filterByType]: filterVal
    }));
    setShowFilterMenu(false);
    setLoading(true);
  };

  const removeFilter = (filterByType) => {
    setAdditionalFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterByType];
      return newFilters;
    });
    setLoading(true);
  };

  const clearAllFilters = () => {
    setAdditionalFilters({});
    setShowFilterMenu(false);
    setLoading(true);
  };

  let sortOptions = [
    { value: 'smart', label: 'Smart Sort (Default)' },
    { value: 'deadline', label: 'Deadline (Earliest)' },
    { value: 'deadline_desc', label: 'Deadline (Latest)' },
    { value: 'urgency_desc', label: 'Urgency (High to Low)' },
    { value: 'urgency_asc', label: 'Urgency (Low to High)' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Name' },
    { value: 'project', label: 'Project' },
    { value: 'id', label: 'ID' },
    // { value: 'order', label: 'Manual Order' },

  ];
  // Hide Manual Order only on Home page
  const isHomePageEmbedded = embedded && !filterBy && limit;

  if (!isHomePageEmbedded) {
  sortOptions.push({ value: 'order', label: 'Manual Order' });
  }
  const filterOptions = [
    { 
      category: 'Status',
      filterBy: 'status',
      values: [
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Not Started', label: 'Not Started' },
        { value: 'Completed', label: 'Completed' },
        { value: 'On Hold', label: 'On Hold' },
      ]
    },
    {
      category: 'Context',
      filterBy: 'context',
      values: [
        { value: 'office', label: 'Office' },
        { value: 'school', label: 'School' },
        { value: 'home', label: 'Home' },
        { value: 'daily-life', label: 'Daily Life' },
        { value: 'other', label: 'Other' },
      ]
    },
  ].filter(option => {
    // Filter out categories that match the permanent filter type or already active filters
    const permanentFilterType = filterBy?.toLowerCase();
    const isAlreadyFiltered = additionalFilters.hasOwnProperty(option.filterBy);
    return (!permanentFilterType || option.filterBy !== permanentFilterType) && !isAlreadyFiltered;
  });

  // Get display label for filter button
  const getFilterButtonLabel = () => {
    const filterCount = Object.keys(additionalFilters).length;
    if (filterCount === 0) return 'Filter';
    return `Filter (${filterCount} active)`;
  };

  const listContent = (
    <>
      <div className="dashboard-title-actions">
        <h2>Tasks</h2>
        <div className="dashboard-buttons">
          {showCreateButton && (
            <div className="sort-dropdown-container">
              <button className="create-button" onClick={() => navigate("/tasks/new")}>Create</button>
            </div>
          )}
          {showSortButton && (
            <div className="sort-dropdown-container">
              <button onClick={() => setShowSortMenu(!showSortMenu)}>
                Sort
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
          )}
          {showFilterButton && (
            <div className="filter-dropdown-container">
              <button onClick={() => setShowFilterMenu(!showFilterMenu)}>
                Filter
              </button>
              {showFilterMenu && (
                <div className="sort-dropdown-menu">
                  {!hideFilterDisplay && filterBy && filterValue && (
                    <div className="filter-permanent-notice">
                      Filtering by {filterBy}: {filterValue}
                    </div>
                  )}
                  {Object.keys(additionalFilters).length > 0 && (
                    <>
                      <div className="filter-category-label">
                        Active Filters
                      </div>
                      {Object.entries(additionalFilters).map(([key, value]) => (
                        <div key={key} className="active-filter-item">
                          <span>{key}: {value}</span>
                          <button
                            className="remove-filter-btn"
                            onClick={() => removeFilter(key)}
                            title="Remove filter"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        className="sort-option"
                        onClick={clearAllFilters}
                        style={{ borderBottom: '2px solid #e5e7eb', fontWeight: 'bold', color: '#dc2626' }}
                      >
                        Clear All Filters
                      </button>
                    </>
                  )}
                  {filterOptions.length === 0 ? (
                    <div className="filter-no-options">
                      No additional filters available
                    </div>
                  ) : (
                    filterOptions.map((category) => (
                      <React.Fragment key={category.category}>
                        <div className="filter-category-label">
                          {category.category}
                        </div>
                        {category.values.map((option) => (
                          <button
                            key={option.value}
                            className="sort-option"
                            onClick={() => handleFilterChange(category.filterBy, option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {showCustomActions && renderActions && renderActions(navigate)}
        </div>
      </div>

      {/* Display current sort and filter status */}
      {(sortingMethod !== 'smart' || Object.keys(additionalFilters).length > 0 || (!hideFilterDisplay && filterBy && filterValue)) && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '6px', 
          marginBottom: '12px',
          fontSize: '0.9rem',
          color: '#4b5563'
        }}>
          {sortingMethod !== 'smart' && (
            <div>
              <strong>Sorted by:</strong> {sortOptions.find(opt => opt.value === sortingMethod)?.label}
            </div>
          )}
          {(Object.keys(additionalFilters).length > 0 || (!hideFilterDisplay && filterBy && filterValue)) && (
            <div>
              <strong>Filtered by:</strong>{' '}
              {!hideFilterDisplay && filterBy && filterValue && `${filterBy}: ${filterValue}`}
              {!hideFilterDisplay && filterBy && filterValue && Object.keys(additionalFilters).length > 0 && ', '}
              {Object.entries(additionalFilters).map(([key, value], index) => (
                <span key={key}>
                  {key}: {value}
                  {index < Object.keys(additionalFilters).length - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

   <div className="task-list">
        {loading && <p>Loading tasks...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && tasks.length === 0 && <p>No tasks found.</p>}

        {!loading &&
          !error &&
          tasks.length > 0 &&
          tasks.map((t) => (
            <button
              key={t._id}
              type="button"
              className={`task-row task-row-button ${
                isOverdue(t.deadline, t.status)
                  ? "task-overdue"
                  : isDueTomorrow(t.deadline, t.status)
                  ? "task-due-soon"
                  : ""
              }`}
              onClick={() => navigate(`/task/${t._id}`)}
            >
              <div>
                <span className="task-status-icon"
                onClick={(e)=>{handleStatusClick(e, t._id, t.status)}}
                style= {{cursor: "pointer" }}>
                  {getStatusIcon(t.status)}
                </span>
                {t.name}
              </div>
              <div>{renderTags(t.tags)}</div>
              <div>{formatDeadline(t.deadline)}</div>
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
