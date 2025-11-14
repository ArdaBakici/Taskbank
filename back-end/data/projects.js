const projects = [
  {
    id: 1,
    name: "Website Revamp",
    tags: ["UI", "Frontend"],
    deadline: "2025-11-30",
    description: "Revamp the public marketing site with a new layout and branding.",
    urgency: "High",
    status: "In Progress",
  },
  {
    id: 2,
    name: "Mobile App Launch",
    tags: ["Mobile", "Product"],
    deadline: "2025-12-15",
    description: "Prepare the MVP release of the Taskbank mobile experience.",
    urgency: "Medium",
    status: "Planning",
  },
  {
    id: 3,
    name: "Database Migration",
    tags: ["Backend", "DB"],
    deadline: "2026-01-05",
    description: "Migrate legacy customer data into the new cloud cluster.",
    urgency: "High",
    status: "Planning",
  },
  {
    id: 4,
    name: "Analytics Dashboard",
    tags: ["Frontend", "Data"],
    deadline: "2025-11-15",
    description: "Develop a real-time analytics dashboard for internal stakeholders.",
    urgency: "Medium",
    status: "In Progress",
  },
  {
    id: 5,
    name: "Customer Support Chatbot",
    tags: ["AI", "Backend"],
    deadline: "2026-01-10",
    description: "Integrate an NLP-powered chatbot to handle tier-1 customer queries.",
    urgency: "High",
    status: "Not Started",
  },
  {
    id: 6,
    name: "Security Audit",
    tags: ["Compliance", "DevOps"],
    deadline: "2025-12-28",
    description: "Conduct a full audit of API endpoints and infrastructure for vulnerabilities.",
    urgency: "Medium",
    status: "In Review",
  },
];

let nextProjectId = Math.max(...projects.map((project) => project.id)) + 1;

function getProjects() {
  return projects;
}

function findProjectById(id) {
  return projects.find((project) => project.id === id);
}

function addProject(payload) {
  const newProject = {
    id: nextProjectId,
    name: payload.name ?? "Untitled Project",
    ...payload,
  };
  projects.push(newProject);
  nextProjectId += 1;
  return newProject;
}

function updateProject(id, updates) {
  const project = findProjectById(id);
  if (!project) return null;
  Object.assign(project, updates);
  return project;
}

function deleteProject(id) {
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = projects.splice(index, 1);
  return removed;
}

module.exports = {
  getProjects,
  findProjectById,
  addProject,
  updateProject,
  deleteProject,
};
