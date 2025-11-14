import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllTasks from "./pages/AllTasks";
import AllProjects from "./pages/AllProjects";
import ProjectView from "./pages/ProjectView";
import TaskView from "./pages/TaskView";
import AddTask from "./pages/AddTask";
import AddProject from "./pages/AddProject";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import EditTask from "./pages/EditTask";
import EditProject from "./pages/EditProject";
import TaskSearch from "./pages/TaskSearch"; 
import ChangePassword from "./pages/ChangePassword";
import ProjectSearch from "./pages/ProjectSearch";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/tasks/new" element={<AddTask />} />
        <Route path="/tasks/search" element={<TaskSearch />} /> {/* ← new search route */}
        <Route path="/task/:id" element={<TaskView />} />
        <Route path="/project/:id" element={<ProjectView />} />
        <Route path="/tasks/edit/:id" element={<EditTask />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/new" element={<AddProject />} />
        <Route path="/projects/edit/:id" element={<EditProject />} />
        <Route path="/" element={<Login />} /> {/* default fallback */}
        <Route path="*" element={<Home />} />
        <Route path="/project/search" element={<ProjectSearch />} />
      </Routes>
    </Router>
  );
}

export default App;
