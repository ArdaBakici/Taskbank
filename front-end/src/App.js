import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllTasks from "./pages/AllTasks";
import AllProjects from "./pages/AllProjects";
import TaskView from "./pages/TaskView";
import AddTask from "./pages/AddTask";
import AddProject from "./pages/AddProject";
import EditTask from "./pages/EditTask";
import EditProject from "./pages/EditProject";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/tasks/new" element={<AddTask />} />
        <Route path="/task/:id" element={<TaskView />} />
        <Route path="/tasks/edit/:id" element={<EditTask />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/projects/new" element={<AddProject />} />
        <Route path="/projects/edit/:id" element={<EditProject />} />
        <Route path="*" element={<Login />} /> {/* default fallback */}
      </Routes>
    </Router>
  );
}

export default App;
