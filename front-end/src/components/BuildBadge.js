import React from "react";

const BUILD_SHA = process.env.REACT_APP_BUILD_SHA;
const BUILD_URL = process.env.REACT_APP_BUILD_URL;
const BUILD_TIME = process.env.REACT_APP_BUILD_TIME;

const styles = {
  wrapper: {
    position: "fixed",
    bottom: "10px",
    left: "10px",
    textDecoration: "none",
    color: "#e8f0ff",
    zIndex: 9999,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(18, 24, 38, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "14px",
    padding: "6px 10px",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.3)",
    opacity: 0,
    transition: "opacity 700ms ease, boxShadow 700ms ease",
    backdropFilter: "blur(6px)",
    fontSize: "12px",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
  pillHover: {
    opacity: 1,
    boxShadow: "0 10px 22px rgba(0, 0, 0, 0.35)",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#4ade80",
    boxShadow: "0 0 0 6px rgba(74, 222, 128, 0.12)",
    flexShrink: 0,
  },
};

const BuildBadge = () => {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef(null);
  const shortSha = BUILD_SHA ? BUILD_SHA.slice(0, 7) : null;
  const shortTime = BUILD_TIME ? BUILD_TIME.slice(0, 16) : null; // e.g., 2025-12-08T12:34
  // if (!BUILD_SHA) return null;

  const showWithDelay = () => {
    timerRef.current = setTimeout(() => setVisible(true), 2000);
  };

  const hideAndClear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{ position: "fixed", bottom: 0, left: 0, width: "140px", height: "120px", zIndex: 9998 }}
      onMouseEnter={showWithDelay}
      onMouseLeave={hideAndClear}
      onFocus={showWithDelay}
      onBlur={hideAndClear}
    >
      <a
        style={styles.wrapper}
        href={BUILD_URL || ""}
        target="_blank"
        rel="noreferrer"
        aria-label={`Build ${BUILD_SHA}${BUILD_TIME ? ` at ${BUILD_TIME}` : ""}`}
        tabIndex={0}
      >
        <span
          style={{
            ...styles.pill,
            ...(visible ? styles.pillHover : {}),
          }}
        >
          <span style={styles.dot} />
          <span>
            Build {shortSha || "n/a"}
            {shortTime ? ` · ${shortTime}` : ""}
          </span>
        </span>
      </a>
    </div>
  );
};

export default BuildBadge;
