import React from "react";
import { config } from "../data/config";

export default function TechStack() {
  return (
    <section className="tech-section" id="skills">
      <div className="section-container">
        <span className="section-label">Toolkit</span>
        <h2 className="section-heading">
          Tech <span>Stack</span>
        </h2>

        <div className="tech-pyramid">
          {config.techStack.map((row, rIdx) => (
            <div key={rIdx} className="tech-row">
              {row.map((item, iIdx) => (
                <a
                  key={iIdx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tech-item"
                  title={item.name}
                >
                  <img src={item.icon} alt={item.name} loading="lazy" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
