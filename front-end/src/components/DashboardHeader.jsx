import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import logo from "../assets/logo.png";

export default function DashboardHeader({ children }) {
  const navigate = useNavigate();
  const goHome = () => navigate("/home");

  return (
    <header className="dashboard-header">
      <button type="button" className="dashboard-brand" onClick={goHome}>
        <h1>Taskbank</h1>
      </button>
      <button type="button" className="logo-box logo-box-button" onClick={goHome}>
        <img src={logo} alt="Logo" className="logo-image" />
      </button>
      {children}
    </header>
  );
}
