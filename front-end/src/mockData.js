export const projects = [
  {
    id: 1,
    name: "Website Revamp",
    tags: "UI, Frontend",
    deadline: "2025-11-30",
    description: "Revamp the company website with new design and features.",
    urgency: "High",
  },
  {
    id: 2,
    name: "Mobile App Launch",
    tags: "Mobile, Product",
    deadline: "2025-12-15",
    description: "Prepare the MVP launch for the Taskbank mobile app.",
    urgency: "Medium",
  },
  {
    id: 3,
    name: "Database Migration",
    tags: "DB, Backend",
    deadline: "2025-12-01",
    description: "Migrate legacy data to the new scalable infrastructure.",
    urgency: "High",
  },
];

export const tasks = [
  {
    id: 1,
    title: "Design homepage",
    name: "Design homepage",
    tags: "UI, Frontend",
    deadline: "2025-10-31",
    description: "Create a modern, responsive homepage for the web app.",
    urgency: "High",
    status: "In Progress",
    projectId: 1,
  },
  {
    id: 2,
    title: "Implement login",
    name: "Implement login",
    tags: "Backend, Auth",
    deadline: "2025-11-05",
    description: "Build secure authentication flow and integrate with API.",
    urgency: "Medium",
    status: "Not Started",
    projectId: 1,
  },
  {
    id: 3,
    title: "Set up database",
    name: "Set up database",
    tags: "DB, Backend",
    deadline: "2025-11-10",
    description: "Provision production database and configure backups.",
    urgency: "High",
    status: "In Progress",
    projectId: 3,
  },
  {
    id: 4,
    title: "Draft marketing copy",
    name: "Draft marketing copy",
    tags: "Marketing",
    deadline: "2025-11-02",
    description: "Write the first draft of the landing page marketing copy.",
    urgency: "Low",
    status: "In Review",
    projectId: 2,
  },
  {
    id: 5,
    title: "QA test suite",
    name: "QA test suite",
    tags: "QA, Testing",
    deadline: "2025-11-12",
    description: "Add integration tests for the critical user flows.",
    urgency: "Medium",
    status: "Not Started",
    projectId: 2,
  },
  {
    id: 6,
    title: "Finalize rollout plan",
    name: "Finalize rollout plan",
    tags: "Operations",
    deadline: "2025-11-18",
    description: "Coordinate rollout schedule and communication plan.",
    urgency: "Low",
    status: "Not Started",
    projectId: 2,
  },
];

export function getTaskById(taskId) {
  return tasks.find((task) => String(task.id) === String(taskId));
}

export function getProjectById(projectId) {
  return projects.find((project) => String(project.id) === String(projectId));
}

export function getTasksByProject(projectId) {
  return tasks.filter((task) => String(task.projectId) === String(projectId));
}
