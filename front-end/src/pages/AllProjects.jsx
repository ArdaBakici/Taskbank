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
    
    setShowSortMenu(false);
    if (method === sortingMethod) return;
    setSortingMethod(method);
    setLoading(true);
  };

  const sortOptions = [
    { value: 'id', label: 'ID (Default)' },
    { value: 'deadline', label: 'Deadline (Earliest)' },
    { value: 'deadline_desc', label: 'Deadline (Latest)' },
    { value: 'urgency_desc', label: 'Urgency (High to Low)' },
    { value: 'urgency_asc', label: 'Urgency (Low to High)' },
    { value: 'status', label: 'Status' },
    { value: 'name', label: 'Name (A-Z)' },
  ];

  const listContent = (
    <>
      <div className="dashboard-title-actions">
        <h2>Projects</h2>

        <div className="dashboard-buttons">

          {/* Always show Create & Sort */}
          <button onClick={() => navigate("/projects/new")}>Create</button>

          <div className="sort-dropdown-container">
            <button onClick={() => setShowSortMenu(!showSortMenu)}>
              Sort {sortingMethod !== 'id' &&
                `(${sortOptions.find(opt => opt.value === sortingMethod)?.label})`}
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

          {/* Only show search icon when embedded */}
          {embedded && renderActions && renderActions(navigate)}

        </div>
      </div>


      <div className="project-list">
        {loading && <p>Loading projects...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p>No projects found.</p>
        )}
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
              <div>{p.deadline ? p.deadline.slice(0, 10) : "No deadline"}</div>
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
