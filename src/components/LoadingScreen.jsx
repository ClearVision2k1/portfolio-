import React, { useState, useEffect } from "react";
import { config } from "../data/config";

export default function LoadingScreen({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExited, setIsExited] = useState(false);

  // Smooth realistic percentage count-up
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < 65) {
        current += Math.floor(Math.random() * 6) + 3;
        if (current > 65) current = 65;
        setPercent(current);
      } else if (current < 92) {
        current += Math.floor(Math.random() * 3) + 1;
        if (current > 92) current = 92;
        setPercent(current);
      } else if (current < 100) {
        current += 1;
        setPercent(current);
      } else {
        clearInterval(interval);
      }
    }, 45);

    // After 2 seconds, quickly finish to 100%
    const forceFinish = setTimeout(() => {
      clearInterval(interval);
      let finishCur = current;
      const finishInterval = setInterval(() => {
        if (finishCur < 100) {
          finishCur += 2;
          if (finishCur > 100) finishCur = 100;
          setPercent(finishCur);
        } else {
          clearInterval(finishInterval);
        }
      }, 15);
    }, 1800);

    window.__skipLoader = () => {
      setIsExited(true);
      if (onComplete) onComplete();
    };

    return () => {
      clearInterval(interval);
      clearTimeout(forceFinish);
      delete window.__skipLoader;
    };
  }, []);

  // When 100% reached, trigger "Welcome" and curtain expansion sequence
  useEffect(() => {
    if (percent >= 100) {
      const t1 = setTimeout(() => {
        setIsComplete(true); // Switches "LOADING" -> "WELCOME"
      }, 400);

      const t2 = setTimeout(() => {
        setIsExpanded(true); // Pill smoothly expands to fill screen
      }, 1200);

      const t3 = setTimeout(() => {
        setIsExited(true);
        if (onComplete) onComplete();
      }, 2100);

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
