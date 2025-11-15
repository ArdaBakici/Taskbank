const tasks = [
  {
    id: 101,
    projectId: 1,
    title: "Design homepage layout",
    name: "Design homepage layout",
    tags: ["UI", "Design"],
    deadline: "2025-11-15",
    description: "Produce desktop and mobile wireframes for the new homepage.",
    urgency: "High",
    status: "In Progress",
    assignee: "Alice Nguyen",
    context: "office",
    priority: "high", 
    order: 0
  },
  {
    id: 102,
    projectId: 1,
    title: "Implement navigation",
    name: "Implement navigation",
    tags: ["Frontend", "React"],
    deadline: "2025-11-06",
    description: "Build responsive header and sidebar components.",
    urgency: "Medium",
    status: "Not Started",
    assignee: "Jordan Ellis",
    context: "office",
    priority: "medium", 
    order: 0
  },
  {
    id: 201,
    projectId: 2,
    title: "Set up push notifications",
    name: "Set up push notifications",
    tags: ["Mobile", "Backend"],
    deadline: "2025-11-20",
    description: "Configure FCM and build notification preferences screen.",
    urgency: "Medium",
    status: "In Progress",
    assignee: "Priya Shah",
    context: "office",
    priority: "medium", 
    order: 0
  },
  {
    id: 202,
    projectId: 2,
    title: "Optimize image loading",
    name: "Optimize image loading",
    tags: ["Frontend", "Performance"],
    deadline: "2025-11-25",
    description: "Implement lazy loading and compression for product images to improve page speed.",
    urgency: "Medium",
    status: "Not Started",
    assignee: "Liam Chen",
    context: "office",
    priority: "medium", 
    order: 0
  },
  {
    id: 301,
    projectId: 3,
    title: "Integrate payment gateway",
    name: "Integrate payment gateway",
    tags: ["Backend", "Security"],
    deadline: "2025-12-05",
    description: "Set up Stripe API integration for checkout and ensure PCI compliance.",
    urgency: "High",
    status: "In Progress",
    assignee: "Sofia Ramirez",
    context: "office",
    priority: "high", 
    order: 0
  },
  {
    id: 302,
    projectId: 3,
    title: "Create onboarding tutorial",
    name: "Create onboarding tutorial",
    tags: ["UX", "Content"],
    deadline: "2025-12-10",
    description: "Develop an interactive in-app tutorial to guide new users through setup steps.",
    urgency: "Low",
    status: "Not Started",
    assignee: "Ethan Brooks",
    context: "office",
    priority: "low", 
    order: 0
  },
  {
  id: 9999,
  projectId: 2,
  title: "Fake completed test task",
  name: "Fake completed test task",
  tags: ["Test", "Automation"],
  deadline: "2025-12-31",
  description: "This is a test task inserted for automated unit testing.",
  urgency: "Medium",
  status: "Completed",
  assignee: "Test Runner",
  context: "office",
  priority: "medium",
  order: 0
},
];

let nextTaskId = Math.max(...tasks.map((task) => task.id)) + 1;

function getTasks() {
  return tasks;
}

function findTaskById(id) {
  return tasks.find((task) => task.id === id);
}

function addTask(payload) {
  const newTask = {
    id: nextTaskId,
    name: payload.title ?? payload.name,
    ...payload,
    title: payload.title ?? payload.name ?? "Untitled Task",
    // Ensure tags is always an array
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    // Default context if not provided
    context: payload.context || "other",
    order: typeof payload.order === "number" ? payload.order : 0,
  };
  tasks.push(newTask);
  nextTaskId += 1;
  return newTask;
}

function updateTask(id, updates) {
  const task = findTaskById(id);
  if (!task) return null;
  
  // Handle title/name updates
  if (updates.title || updates.name) {
    updates.title = updates.title ?? updates.name;
    updates.name = updates.title;
  }
  
  // Ensure tags is always an array if provided
  if (updates.tags && !Array.isArray(updates.tags)) {
    updates.tags = [];
  }
  
  Object.assign(task, updates);
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = tasks.splice(index, 1);
  return removed;
}

module.exports = {
  getTasks,
  findTaskById,
  addTask,
  updateTask,
  deleteTask,
};