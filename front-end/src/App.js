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
import ProtectedRoute from "./components/ProtectedRoute";
import ChangeUsername from "./pages/ChangeUsername";


function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} /> {/* default fallback */}
        
        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/change-username" element={<ProtectedRoute><ChangeUsername /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><AllTasks /></ProtectedRoute>} />
        <Route path="/tasks/new" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
        <Route path="/tasks/search" element={<ProtectedRoute><TaskSearch /></ProtectedRoute>} />
        <Route path="/task/:id" element={<ProtectedRoute><TaskView /></ProtectedRoute>} />
        <Route path="/tasks/edit/:id" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><AllProjects /></ProtectedRoute>} />
        <Route path="/projects/new" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
        <Route path="/projects/edit/:id" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />
        <Route path="/project/search" element={<ProtectedRoute><ProjectSearch /></ProtectedRoute>} />
        <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
