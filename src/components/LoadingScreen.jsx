import React, { useState, useEffect } from "react";
import { config } from "../data/config";

export default function LoadingScreen({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExited, setIsExited] = useState(false);

  // Smooth, rhythmic count-up (around 700-900ms)
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      const step = Math.floor(Math.random() * 4) + 2;
      current += step;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        clearInterval(interval);
      } else {
        setPercent(current);
      }
    }, 20);

    window.__skipLoader = () => {
      setIsExited(true);
      if (onComplete) onComplete();
    };

    return () => {
      clearInterval(interval);
      delete window.__skipLoader;
    };
  }, []);

  // When 100% reached, display "WELCOME" proudly, then smoothly transition into portfolio
  useEffect(() => {
    if (percent >= 100) {
      const t1 = setTimeout(() => {
        setIsComplete(true); // Switches to "WELCOME"
      }, 100);

      const t2 = setTimeout(() => {
        setIsExpanded(true); // Smooth fade / reveal
      }, 900);

      const t3 = setTimeout(() => {
        setIsExited(true);
        if (onComplete) onComplete();
      }, 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [percent, onComplete]);

  // Mouse spotlight glow inside the capsule
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleClick = () => {
    if (percent < 100) {
      setPercent(100);
    } else {
      setIsExited(true);
      if (onComplete) onComplete();
    }
  };

  if (isExited) return null;

  const role1 = "AI AUTOMATION EXPERT";
  const role2 = "FULL-STACK WEB DEVELOPER";

  return (
    <div
      className={`loading-screen ${isExited ? "loading-screen-hidden" : ""} ${
        isExpanded ? "loading-screen-expanded" : ""
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="loader-ambient-glow" />

      {/* Top Header Bar */}
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          {config.developer.fullName.replace(" ", "")}
        </a>

        {/* Top-Right Sound Wave / Equalizer Game Animation */}
        <div className={`loaderGame ${isExpanded ? "loader-out" : ""}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, idx) => (
                <div key={idx} className="loaderGame-line" />
              ))}
            </div>
            <div className="loaderGame-ball" />
          </div>
        </div>
      </div>

      {/* Horizontal Continuous Marquee Banner */}
      <div className="loading-marquee">
        <div className="loading-marquee-track">
          <span>&nbsp; {role1} &nbsp;</span>
          <span>&nbsp; {role2} &nbsp;</span>
          <span>&nbsp; {role1} &nbsp;</span>
          <span>&nbsp; {role2} &nbsp;</span>
          <span>&nbsp; {role1} &nbsp;</span>
          <span>&nbsp; {role2} &nbsp;</span>
          <span>&nbsp; {role1} &nbsp;</span>
          <span>&nbsp; {role2} &nbsp;</span>
        </div>
      </div>

      {/* Center Welcome Container: Photo on TOP (Upore), Text DOWNWARDS (Nicher dike) */}
      <div className="loader-center-content">
        {/* Upore: Eliyas's Photo */}
        <div className="loader-avatar-wrapper">
          <div className="loader-avatar-ring-pulse" />
          <div className="loader-avatar-frame">
            <img
              src={config.developer.photo || "/images/eliyas.png"}
              alt={config.developer.fullName}
              className="loader-avatar-img"
              onError={(e) => {
                e.target.src = "/images/eliyas-avatar.png";
              }}
            />
          </div>
        </div>

        {/* Nicher dike: Text & Capsule Button */}
        <div className="loader-info-group">
          <h2 className="loader-developer-name">{config.developer.fullName.toUpperCase()}</h2>
          <p className="loader-developer-role">
            {config.developer.title} • {config.developer.secondaryTitle}
          </p>

          {/* Interactive Floating Capsule */}
          <div
            className={`loading-wrap ${isExpanded ? "loading-clicked" : ""}`}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            data-cursor="disable"
          >
            <div className="loading-hover" />
            <div className={`loading-button ${isComplete ? "loading-complete" : ""}`}>
              <div className="loading-container">
                <div className="loading-content">
                  <div className="loading-content-in">
                    LOADING <span>{percent}%</span>
                    <span className="loading-box" />
                  </div>
                </div>
              </div>
              <div className="loading-content2">
                <span>WELCOME</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
