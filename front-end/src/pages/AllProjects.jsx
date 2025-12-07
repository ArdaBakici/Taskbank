import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function AllProjects({
  embedded = false,
  limit,
  showFooter = true,
  renderActions, 
}) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortingMethod, setSortingMethod] = useState(embedded ? 'deadline' : 'id');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProjects() {
      try {
        // Construct API URL with query parameters
        const params = new URLSearchParams();
        
        // When embedded (like in Home), use limit and sorting_method
        if (embedded && limit) {
          params.append('num_of_projects', limit.toString());
        }
        
        // Always add sorting method
        params.append('sorting_method', sortingMethod);
        
        // Add status filter if set
        if (statusFilter) {
          params.append('status', statusFilter);
        }
        
        const url = `/projects?${params.toString()}`;
        const response = await authenticatedFetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          // The API returns projects in data.projects array
          setProjects(data.projects || []);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
        if (isMounted) {
          setError("Unable to load projects right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProjects();
    return () => {
      isMounted = false;
    };
  }, [embedded, limit, sortingMethod, statusFilter]);

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

  const handleSortChange = (method) => {
    setSortingMethod(method);
    setShowSortMenu(false);
    setLoading(true);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setShowFilterMenu(false);
    setLoading(true);
  };

  const clearFilter = () => {
    setStatusFilter(null);
    setShowFilterMenu(false);
    setLoading(true);
  };

  const sortOptions = [
    { value: 'id', label: 'ID' },
    { value: 'deadline', label: 'Deadline (Earliest)' },
    { value: 'deadline_desc', label: 'Deadline (Latest)' },
    { value: 'urgency_desc', label: 'Urgency (High to Low)' },
    { value: 'urgency_asc', label: 'Urgency (Low to High)' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  const listContent = (
    <>
      <div className="dashboard-title-actions">
        <h2>Projects</h2>

        <div className="dashboard-buttons">

          {/* Always show Create & Sort */}
          <div className="sort-dropdown-container">
            <button className="create-button" onClick={() => navigate("/projects/new")}>Create</button>
          </div>
          

          <div className="sort-dropdown-container">
            <button onClick={() => setShowSortMenu(!showSortMenu)}>
              Sort
            </button>

            {showSortMenu && (
              <div className="sort-dropdown-menu">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`sort-option ${sortingMethod === option.value ? "active" : ""}`}
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-dropdown-container">
            <button onClick={() => setShowFilterMenu(!showFilterMenu)}>
              Filter
            </button>

            {showFilterMenu && (
              <div className="sort-dropdown-menu">
                {statusFilter && (
                  <>
                    <div className="filter-category-label">Active Filter</div>
                    <div className="active-filter-item">
                      <span>Status: {statusFilter}</span>
                      <button
                        className="remove-filter-btn"
                        onClick={clearFilter}
                        title="Remove filter"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
                <div className="filter-category-label">Status</div>
                <button
                  className="sort-option"
                  onClick={() => handleFilterChange('Planning')}
                >
                  Planning
                </button>
                <button
                  className="sort-option"
                  onClick={() => handleFilterChange('In Progress')}
                >
                  In Progress
                </button>
                <button
                  className="sort-option"
                  onClick={() => handleFilterChange('On Hold')}
                >
                  On Hold
                </button>
                <button
                  className="sort-option"
                  onClick={() => handleFilterChange('Completed')}
                >
                  Completed
                </button>
                <button
                  className="sort-option"
                  onClick={() => handleFilterChange('Cancelled')}
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {/* Only show search icon when embedded */}
          {embedded && renderActions && renderActions(navigate)}

        </div>
      </div>

      {/* Display current sort and filter status */}
      {(sortingMethod !== 'id' || statusFilter) && (
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '6px', 
          marginBottom: '12px',
          fontSize: '0.9rem',
          color: '#4b5563'
        }}>
          {sortingMethod !== 'id' && (
            <div>
              <strong>Sorted by:</strong> {sortOptions.find(opt => opt.value === sortingMethod)?.label}
            </div>
          )}
          {statusFilter && (
            <div>
              <strong>Filtered by:</strong> Status: {statusFilter}
            </div>
          )}
        </div>
      )}


      <div className="project-list">
        {loading && <p>Loading projects...</p>}
        {error && <p>{error}</p>}
        {!loading &&
          !error &&
          projects.map((p) => (
            <button
              key={p._id}
              type="button"
              className="project-row project-row-button"
              onClick={() => navigate(`/project/${p._id}`)}
            >
              <div>{p.name}</div>
              <div>{renderTags(p.tags)}</div>
              <div>{formatDeadline(p.deadline)}</div>
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
            className="section-footer-button projects-return"
            onClick={() => navigate("/home")}
          >
            Return
          </button>
        )}
      </main>
    </div>
  );
}
