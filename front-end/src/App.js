import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllTasks from "./pages/AllTasks";
import AllProjects from "./pages/AllProjects";
import TaskView from "./pages/TaskView";
import AddTask from "./pages/AddTask";
import AddProject from "./pages/AddProject";
import Home from "./pages/Home";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/tasks/new" element={<AddTask />} />
        <Route path="/task/:id" element={<TaskView />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/new" element={<AddProject />} />
        <Route path="*" element={<Home />} /> {/* default fallback */}
      </Routes>
    </Router>
  );
}

export default App;
