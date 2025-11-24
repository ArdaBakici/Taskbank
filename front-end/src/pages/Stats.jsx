import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../utils/auth";
import "../css/dashboard.css";
import DashboardHeader from "../components/DashboardHeader";

export default function Stats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      const startedAt = performance.now();
      console.log("[Stats] ▶ fetch", {
        url: '/stats',
      });
      try {
        const response = await authenticatedFetch('/stats');
        console.log("[Stats] ◀ response", {
          url: '/stats',
          status: response.status,
          ok: response.ok,
        });
        if (!response.ok) {
          throw new Error("Failed to load stats");
        }
        const data = await response.json();
        console.log("[Stats] ✔ parsed stats", {
          totals: {
            tasks: data.totalTasks,
            projects: data.totalProjects,
          },
          taskBuckets: data.tasksByStatus,
          projectBuckets: data.projectsByStatus,
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        console.error("[Stats] ✖ fetch failed", {
          url: '/stats',
          message: err.message,
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        console.log("[Stats] ■ cycle complete", {
          url: '/stats',
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const tasksByStatus = stats?.tasksByStatus ?? {};
    const projectsByStatus = stats?.projectsByStatus ?? {};

    const mostCommonTaskStatus = Object.entries(tasksByStatus).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    return {
      tasksTracked: stats?.totalTasks ?? 0,
      projectsTracked: stats?.totalProjects ?? 0,
      dominantTaskStatus: mostCommonTaskStatus || "N/A",
      tasksStatusBreakdown: Object.entries(tasksByStatus),
      projectsStatusBreakdown: Object.entries(projectsByStatus),
    };
  }, [stats]);

  return (
    <div className="dashboard-container">
      <DashboardHeader />

      <main className="stats-main">
        <h2>Statistics</h2>
        {isLoading && <p>Loading stats...</p>}
        {error && <p className="error-text">{error}</p>}
        {!isLoading && !error && (
          <>
            <div className="stats-metric">
              <span>Total Tasks:</span>
              <strong>{metrics.tasksTracked}</strong>
            </div>
            <div className="stats-metric">
              <span>Total Projects:</span>
              <strong>{metrics.projectsTracked}</strong>
            </div>
            <div className="stats-metric">
              <span>Dominant Task Status:</span>
              <strong>{metrics.dominantTaskStatus}</strong>
            </div>

            <h3>Task Status Breakdown</h3>
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

            <h3>Project Status Breakdown</h3>
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
