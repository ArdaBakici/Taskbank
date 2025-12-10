import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";
import CircularProgress from "../components/CircularProgress";
// Stats dashboard component displaying task and project analytics
export default function Stats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

 // Fetch statistics data on component mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await authenticatedFetch('/stats');
        if (!response.ok) {
          throw new Error("Failed to load stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Stats error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Process raw stats data into display-ready metrics
  const metrics = useMemo(() => {
    const tasksByStatus = stats?.tasksByStatus ?? {};

    // Find the most common task status
    const mostCommonTaskStatus = Object.entries(tasksByStatus).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      totalTasks: stats?.totalTasks ?? 0,
      totalProjects: stats?.totalProjects ?? 0,
      completedTasks: stats?.completedTasks ?? 0,
      activeTasks: stats?.activeTasks ?? 0,
      overdueTasks: stats?.overdueTasks ?? 0,
      completionRate: stats?.completionRate ?? 0,
      onTimeRate: stats?.onTimeRate ?? 0,
      avgTasksPerDay: stats?.avgTasksPerDay ?? 0,
      dominantTaskStatus: mostCommonTaskStatus || "N/A",
      tasksStatusBreakdown: Object.entries(tasksByStatus),
      projectsStatusBreakdown: Object.entries(stats?.projectsByStatus ?? {}),
    };
  }, [stats]);

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="stats-main">
        <h2>Statistics</h2>
        {/* Loading and error states */}
        {isLoading && <p>Loading stats...</p>}
        {error && <p className="error-text">{error}</p>}
        
        {!isLoading && !error && (
          <>
            {/* Overview Section */}
            <h3>Overview</h3>
            <div className="stats-metric">
              <span>Total Tasks:</span>
              <strong>{metrics.totalTasks}</strong>
            </div>
            <div className="stats-metric">
              <span>Total Projects:</span>
              <strong>{metrics.totalProjects}</strong>
            </div>
            <div className="stats-metric">
              <span>Active Tasks:</span>
              <strong>{metrics.activeTasks}</strong>
            </div>
            <div className="stats-metric">
              <span>Completed Tasks:</span>
              <strong>{metrics.completedTasks}</strong>
            </div>
            <div className="stats-metric">
              <span>Overdue Tasks:</span>
              <strong style={{ color: metrics.overdueTasks > 0 ? '#dc2626' : 'inherit' }}>
                {metrics.overdueTasks}
              </strong>
            </div>

            {/* Performance Metrics Section with Circular Progress */}
            <h3 style={{ marginTop: '2rem' }}>Performance Metrics</h3>
            
            {/* Circular progress indicators for key performance metrics */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              flexWrap: 'wrap',
              gap: '2rem',
              margin: '2rem 0'
            }}>
              <CircularProgress
                percentage={metrics.completionRate}
                size={140}
                strokeWidth={12}
                color="#4ade80"
                label="Completion"
                sublabel="Rate"
              />
              
              <CircularProgress
                percentage={metrics.onTimeRate}
                size={140}
                strokeWidth={12}
                color="#3b82f6"
                label="On-Time"
                sublabel="Completion"
              />
              {/* Average tasks per day metric */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#111827'
                }}>
                  {metrics.avgTasksPerDay}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginTop: '0.5rem'
                }}>
                  Tasks/Day
                </div>
              </div>
            </div>

            <div className="stats-metric">
              <span>Dominant Task Status:</span>
              <strong>{metrics.dominantTaskStatus}</strong>
            </div>

            {/* Task Status Breakdown */}
            <h3 style={{ marginTop: '2rem' }}>Task Status Breakdown</h3>
            <div className="stats-graph">
              {metrics.tasksStatusBreakdown.length === 0 && <p>No task data yet.</p>}
              {metrics.tasksStatusBreakdown.map(([status, count]) => (
                <div key={status} className="stats-bar-wrapper">
                  <div
                    className="stats-bar"
                    style={{ height: `${(count || 0) * 15}px` }}
                    title={`${status}: ${count}`}
                  >
                    <span className="stats-bar-count">{count} Tasks</span>

                  </div>
                  <p className="stats-bar-label">{status}</p>
          
                </div>
              ))}
            </div>

            {/* Project Status Breakdown */}
            <h3 style={{ marginTop: '2rem' }}>Project Status Breakdown</h3>
            <ul className="stats-list">
              {metrics.projectsStatusBreakdown.length === 0 && <li>No project data yet.</li>}
              {metrics.projectsStatusBreakdown.map(([status, count]) => (
                <li key={status}>
                  <strong>{status}:</strong> {count}
                </li>
              ))}
            </ul>
          </>
        )}

        <button
          className="section-footer-button stats-return"
          onClick={() => navigate("/home")}
        >
          Return
        </button>
      </main>
    </div>
  );
}


/* Fetches `${REACT_APP_API_BASE_URL || ""}/api/stats` so devs can point the React app at whatever backend they have running, replacing the mock metrics/graph with live aggregates without hand-editing the component, emits detailed console diagnostics (URL, status, totals, timings) each cycle for proactive debugging, and renders each status bucket with a count chip plus a labeled bar so the user can see which status each column represents. */
