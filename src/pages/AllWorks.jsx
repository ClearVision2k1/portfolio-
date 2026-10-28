import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { config } from "../data/config";

export default function AllWorks() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="all-works-page">
      {/* Top gradient fade */}
      <div className="nav-fade" />

      <main className="all-works-container">
        {/* Back to Home Button (exact matching reference site) */}
        <div className="all-works-top-nav">
          <Link to="/" className="back-to-home-btn" data-cursor="disable">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Title Section */}
        <div className="all-works-header">
          <h1>
            All <span>Works</span>
          </h1>
          <p>A collection of all my projects and creations</p>
        </div>

        {/* All Works Responsive Grid */}
        <div className="all-works-grid">
          {config.projects.map((project, idx) => (
            <a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="all-works-card"
              data-cursor="disable"
            >
              {/* Card Image Banner */}
              <div className="all-works-card-image">
                <img
                  src={project.image}
                  alt={project.title}
                  decoding="async"
                />
                <span className="card-badge">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="card-arrow-btn">
                  <ArrowUpRight size={17} />
                </div>
              </div>

              {/* Card Content */}
              <div className="all-works-card-body">
                <h3>{project.title}</h3>
                <span className="card-category">{project.category}</span>
                <p className="card-description">{project.description}</p>
                <div className="card-tech">{project.technologies}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Back Button */}
        <div className="all-works-footer-nav">
          <Link to="/" className="back-to-home-btn" data-cursor="disable">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
