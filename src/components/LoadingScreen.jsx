import React, { useState, useEffect } from "react";
import { config } from "../data/config";

export default function LoadingScreen({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExited, setIsExited] = useState(false);

  // Ultra-fast millisecond percentage count-up (under 1 second)
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Step increment between 3 and 7 for a rapid, cybernetic count-up in ~350-450ms
      const step = Math.floor(Math.random() * 5) + 3;
      current += step;
      if (current >= 100) {
        current = 100;
        setPercent(100);
        clearInterval(interval);
      } else {
        setPercent(current);
      }
    }, 16); // 16ms (~60fps frame rate) for lightning-fast millisecond count

    window.__skipLoader = () => {
      setIsExited(true);
      if (onComplete) onComplete();
    };

    return () => {
      clearInterval(interval);
      delete window.__skipLoader;
    };
  }, []);

  // When 100% reached, quickly flash "WELCOME" and smoothly expand
  useEffect(() => {
    if (percent >= 100) {
      const t1 = setTimeout(() => {
        setIsComplete(true); // Switches "LOADING" -> "WELCOME"
      }, 150);

      const t2 = setTimeout(() => {
        setIsExpanded(true); // Pill smoothly expands to open into portfolio
      }, 450);

      const t3 = setTimeout(() => {
        setIsExited(true);
        if (onComplete) onComplete();
      }, 800);

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
    // Instant skip to 100% on click if user clicks the button
    if (percent < 100) {
      setPercent(100);
    }
  };

  if (isExited) return null;

  const role1 = "AI AUTOMATION EXPERT";
  const role2 = "FULL-STACK WEB DEVELOPER";

  return (
    <div className={`loading-screen ${isExited ? "loading-screen-hidden" : ""}`}>
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

      {/* Center Floating Pill / Capsule */}
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
  );
}
