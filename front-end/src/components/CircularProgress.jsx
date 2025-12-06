import React from "react";
import "../css/CircularProgress.css";

export default function CircularProgress({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  color = "#4ade80",
  label = "",
  sublabel = ""
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="circular-progress-svg">
        {/* Background circle */}
        <circle
          className="circular-progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="circular-progress-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: color }}
        />
      </svg>
      <div className="circular-progress-text">
        <div className="circular-progress-percentage">{percentage}%</div>
        {label && <div className="circular-progress-label">{label}</div>}
        {sublabel && <div className="circular-progress-sublabel">{sublabel}</div>}
      </div>
    </div>
  );
}