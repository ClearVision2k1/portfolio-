import React, { useState } from "react";
import { config } from "../data/config";

export default function WhatIDo() {
  const [activeCard, setActiveCard] = useState(0);

  const handleToggle = (index) => {
    setActiveCard((prev) => (prev === index ? (index === 0 ? 1 : 0) : index));
  };

  return (
    <section className="whatIDO" id="services">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            &nbsp;I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          {/* Vertical dashed line borders */}
          <div className="what-border2">
            <svg width="100%">
              <line x1="0" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
              <line x1="100%" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="7,7" />
            </svg>
          </div>

          {/* Service 1: AI Developer */}
          <div
            className={`what-content what-noTouch ${
              activeCard === 0 ? "what-content-active" : "what-sibling"
            }`}
            onClick={() => handleToggle(0)}
            onMouseEnter={() => {
              if (window.innerWidth > 1024) setActiveCard(0);
            }}
          >
            <div className="what-border1">
              <svg height="100%">
                <line x1="0" y1="0" x2="100%" y2="0" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
              </svg>
            </div>
            <div className="what-corner" />
            <div className="what-content-in">
              <h3>{config.skills.develop.title}</h3>
              <h4>{config.skills.develop.description}</h4>
              <p>{config.skills.develop.details}</p>
              <h5>Skillset &amp; tools</h5>
              <div className="what-content-flex">
                {config.skills.develop.tools.map((tool, idx) => (
                  <div key={idx} className="what-tags">
                    {tool}
                  </div>
                ))}
              </div>
              <div className="what-arrow" />
            </div>
          </div>

          {/* Service 2: Full-Stack Development */}
          <div
            className={`what-content what-noTouch ${
              activeCard === 1 ? "what-content-active" : "what-sibling"
            }`}
            onClick={() => handleToggle(1)}
            onMouseEnter={() => {
              if (window.innerWidth > 1024) setActiveCard(1);
            }}
          >
            <div className="what-border1">
              <svg height="100%">
                <line x1="0" y1="100%" x2="100%" y2="100%" stroke="white" strokeWidth="2" strokeDasharray="6,6" />
              </svg>
            </div>
            <div className="what-corner" />
            <div className="what-content-in">
              <h3>{config.skills.design.title}</h3>
              <h4>{config.skills.design.description}</h4>
              <p>{config.skills.design.details}</p>
              <h5>Skillset &amp; tools</h5>
              <div className="what-content-flex">
                {config.skills.design.tools.map((tool, idx) => (
                  <div key={idx} className="what-tags">
                    {tool}
                  </div>
                ))}
              </div>
              <div className="what-arrow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
