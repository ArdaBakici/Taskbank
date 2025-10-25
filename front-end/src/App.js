import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllTasks from "./pages/AllTasks";
import AllProjects from "./pages/AllProjects";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<AllTasks />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="*" element={<Login />} /> {/* default fallback */}
      </Routes>
    </Router>
  );
}

export default App;
