const CSV_BASE_PATH = `${process.env.PUBLIC_URL || ""}/mock-data`;

const MOCKAROO_TASKS_URL = process.env.REACT_APP_MOCKAROO_TASKS_URL;
const MOCKAROO_PROJECTS_URL = process.env.REACT_APP_MOCKAROO_PROJECTS_URL;

let cachedTasks = null;
let cachedProjects = null;

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values.map((value) => value.replace(/^"|"$/g, ""));
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return [];
  }

  const headers = splitCsvLine(lines[0]);
  return lines
    .slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = splitCsvLine(line);
      return headers.reduce((acc, header, idx) => {
        acc[header] = values[idx] ?? "";
        return acc;
      }, {});
    });
}

function normalizeTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((item) => String(item).trim()).filter(Boolean);
  return String(raw)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function projectFromRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    tags: normalizeTags(row.tags),
    deadline: row.deadline,
    description: row.description,
    urgency: row.urgency,
    status: row.status,
  };
}

function taskFromRow(row) {
  return {
    id: Number(row.id),
    projectId: Number(row.projectId),
    title: row.title,
    name: row.title,
    tags: normalizeTags(row.tags),
    deadline: row.deadline,
    description: row.description,
    urgency: row.urgency,
    status: row.status,
    assignee: row.assignee,
  };
}

async function loadCsv(path) {
  const response = await fetch(`${CSV_BASE_PATH}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  const text = await response.text();
  return parseCsv(text);
}

export async function fetchProjects() {
  if (!cachedProjects) {
    try {
      const response = await fetch(MOCKAROO_PROJECTS_URL);
      if (!response.ok) {
        throw new Error("Failed to load projects from Mockaroo");
      }
      const rows = await response.json();
      cachedProjects = rows.map(projectFromRow);
    } catch (error) {
      console.warn("Falling back to local projects CSV", error);
      const rows = await loadCsv("projects.csv");
      cachedProjects = rows.map(projectFromRow);
    }
  }
  return cachedProjects;
}

export async function fetchTasks() {
  if (!cachedTasks) {
    try {
      const response = await fetch(MOCKAROO_TASKS_URL);
      if (!response.ok) {
        throw new Error("Failed to load tasks from Mockaroo");
      }
      const rows = await response.json();
      cachedTasks = rows.map(taskFromRow);
    } catch (error) {
      console.warn("Falling back to local tasks CSV", error);
      const rows = await loadCsv("tasks.csv");
      cachedTasks = rows.map(taskFromRow);
    }
  }
  return cachedTasks;
}

export async function fetchTaskById(id) {
  const tasks = await fetchTasks();
  return tasks.find((task) => String(task.id) === String(id));
}

export async function fetchProjectById(id) {
  const projects = await fetchProjects();
  return projects.find((project) => String(project.id) === String(id));
}

export async function fetchTasksByProject(projectId) {
  const tasks = await fetchTasks();
  return tasks.filter((task) => String(task.projectId) === String(projectId));
}
