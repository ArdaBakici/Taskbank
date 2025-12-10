// React and routing imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

/**
 * ProjectSearch component - Search and filter projects by name or tags
 * Features real-time search with instant filtering as user types
 */
export default function ProjectSearch() {
  const navigate = useNavigate();
  
  // Component state management
  const [projects, setProjects] = useState([]); // Filtered projects matching search query
  const [query, setQuery] = useState(""); // Current search input
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error state for API failures

  // Real-time search effect - triggers whenever search query changes
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);

        // Fetch all projects from backend
        const response = await authenticatedFetch('/projects');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Client-side filtering - search by project name OR tags
        const filtered = data.projects.filter((p) => {
          // Case-insensitive search in project name
          const nameMatch = p.name.toLowerCase().includes(query.toLowerCase());
          // Case-insensitive search in tags (joined as single string)
          const tagsMatch =
            (p.tags || [])
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase());

          // Return true if either name or tags contain the search query
          return nameMatch || tagsMatch;
        });

        setProjects(filtered);
      } catch (err) {
        console.error("Failed to load projects", err);
        setError("Unable to load projects right now.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [query]); // Re-run search whenever query changes

  // Helper function to display tags in a readable format
  const renderTags = (tagList) => {
    if (!tagList || tagList.length === 0) return "—"; // Show dash for no tags
    return Array.isArray(tagList) ? tagList.join(", ") : tagList;
  };

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Handle both ISO format (2025-12-10T00:00:00.000Z) and simple format (2025-12-10)
      const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      const [year, month, day] = dateOnly.split("-").map(Number);
      // This creates a date in your LOCAL timezone with that year-month-day
      return new Date(year, month - 1, day);
    } catch (e) {
      return null;
    }
  };

  // Helper function to format deadline dates for display
  const formatDeadline = (deadline) => {
    if (!deadline) return "—"; // Show dash for no deadline
    try {
      const date = parseLocalDate(deadline);
      if (!date) return "—";
      // Format as "Dec 9, 2025" style
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date"; // Handle malformed dates gracefully
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main>
        <div className="dashboard-title-actions">
          <h2>Search Projects</h2>
        </div>

        {/* Search input - matches styling from TaskSearch for consistency */}
        <div className="form-group full-width">
          <input
            id="project-search"
            type="text"
            placeholder="Search by project name or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)} // Real-time search as user types
          />
        </div>

        {/* Results list - uses same CSS classes as task list for consistency */}
        <div className="task-list">
          {/* Loading state */}
          {loading && <p>Loading projects...</p>}
          {/* Error state */}
          {error && <p>{error}</p>}

          {/* Search results - each project is clickable */}
          {!loading &&
            !error &&
            projects.map((project) => (
              <button
                key={project._id}
                type="button"
                className="task-row task-row-button" // Reuse task styling for consistency
                onClick={() => navigate(`/project/${project._id}`)} // Navigate to project details
              >
                <div>{project.name}</div>
                <div>{renderTags(project.tags)}</div>
                <div>{formatDeadline(project.deadline)}</div>
              </button>
            ))}

          {/* No results message */}
          {!loading && !error && projects.length === 0 && (
            <p>No projects found.</p>
          )}
        </div>

        {/* Return to home button */}
        <button
          className="section-footer-button tasks-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}
