import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Layers,
  Sparkles,
  CheckCircle2,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Code,
} from "lucide-react";
import { getAllProjects, getProjectById } from "../services/projectService";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [proj, all] = await Promise.all([
          getProjectById(id),
          getAllProjects(),
        ]);
        if (isMounted) {
          if (proj) {
            setProject(proj);
            setAllProjects(all);
            setActiveScreenIndex(0);
          } else {
            // Fallback: if not found, redirect to /myworks
            navigate("/myworks");
          }
        }
      } catch (err) {
        console.error("Error loading project details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  if (loading || !project) {
    return (
      <div className="project-detail-loading">
        <div className="admin-spinner" />
        <span>Loading project details...</span>
      </div>
    );
  }

  // Find previous and next projects for pagination
  const currentIndex = allProjects.findIndex(
    (p) => String(p.id) === String(project.id)
  );
  const prevProject =
    currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  // Normalize 3 screenshots
  const screenshots =
    Array.isArray(project.screenshots) && project.screenshots.length >= 3
      ? project.screenshots
      : [
          `/images/projects/screens/project-${project.id}-s1.webp`,
          `/images/projects/screens/project-${project.id}-s2.webp`,
          `/images/projects/screens/project-${project.id}-s3.webp`,
        ];

  return (
    <div className="project-detail-page">
      {/* Top Ambient Glow Fade */}
      <div className="project-detail-ambient" />

      <main className="project-detail-container">
        {/* Top Back Navigation Bar */}
        <div className="project-detail-top-nav">
          <Link to="/myworks" className="project-back-btn" data-cursor="disable">
            <ArrowLeft size={16} />
            <span>Back to All Works</span>
          </Link>

          <div className="project-detail-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/myworks">Works</Link>
            <span>/</span>
            <span className="current">{project.title}</span>
          </div>
        </div>

        {/* Project Header Info */}
        <section className="project-detail-header">
          <div className="project-detail-badge">
            <Sparkles size={14} color="#a87cff" />
            <span>{project.category}</span>
          </div>

          <h1 className="project-detail-title">{project.title}</h1>
          <p className="project-detail-tagline">{project.description}</p>
        </section>

        {/* ============================================================== */}
        {/* TOP SECTION: 3 SHOWCASE SCREENSHOTS */}
        {/* ============================================================== */}
        <section className="project-screens-showcase">
          <div className="screens-header-row">
            <div>
              <h3>Project Showcase (3 Screenshots)</h3>
              <p>Explore the core user interface, workflow architecture, and system telemetry.</p>
            </div>
            <div className="screens-counter">
              <span>{activeScreenIndex + 1}</span> / <span>{screenshots.length}</span>
            </div>
          </div>

          {/* Active Featured Screenshot */}
          <div className="screens-featured-frame">
            <img
              src={screenshots[activeScreenIndex]}
              alt={`${project.title} Screenshot ${activeScreenIndex + 1}`}
              className="featured-screen-img"
            />

            {/* Navigation arrows */}
            <button
              type="button"
              className="screen-nav-arrow screen-arrow-prev"
              onClick={() =>
                setActiveScreenIndex(
                  (prev) => (prev - 1 + screenshots.length) % screenshots.length
                )
              }
              title="Previous Screenshot"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="screen-nav-arrow screen-arrow-next"
              onClick={() =>
                setActiveScreenIndex((prev) => (prev + 1) % screenshots.length)
              }
              title="Next Screenshot"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* 3 Screenshot Selectors Row */}
          <div className="screens-thumbs-grid">
            {screenshots.map((screen, idx) => (
              <button
                key={idx}
                type="button"
                className={`screen-thumb-card ${
                  activeScreenIndex === idx ? "active" : ""
                }`}
                onClick={() => setActiveScreenIndex(idx)}
              >
                <div className="thumb-preview">
                  <img src={screen} alt={`Thumbnail ${idx + 1}`} />
                  <span className="thumb-index">0{idx + 1}</span>
                </div>
                <div className="thumb-info">
                  <h4>
                    {idx === 0
                      ? "Core App Interface"
                      : idx === 1
                      ? "Architecture & Deep-Dive"
                      : "Telemetry & Live Output"}
                  </h4>
                  <p>Click to inspect view</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* SCROLLING DOWN: ACTION CTA & DETAILED PROJECT BREAKDOWN */}
        {/* ============================================================== */}
        <section className="project-content-grid">
          {/* Main Column */}
          <div className="project-main-column">
            {/* Action Bar (Live Demo & Source Code) */}
            <div className="project-action-card">
              <div className="action-card-text">
                <h3>Experience the Live Build</h3>
                <p>Test the working deployment or inspect the production code on GitHub.</p>
              </div>

              <div className="action-buttons-group">
                {(project.live || project.link) && (
                  <a
                    href={project.live || project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-cta-primary"
                    data-cursor="disable"
                  >
                    <span>Launch Live Demo</span>
                    <ExternalLink size={16} />
                  </a>
                )}

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-cta-secondary"
                    data-cursor="disable"
                  >
                    <Github size={16} />
                    <span>View GitHub Repo</span>
                  </a>
                )}
              </div>
            </div>

            {/* Section 1: Project Overview */}
            <div className="project-content-block">
              <div className="block-title-row">
                <div className="block-icon">
                  <Layers size={18} color="#a87cff" />
                </div>
                <h2>Project Overview</h2>
              </div>
              <p className="block-body-text">{project.description}</p>
            </div>

            {/* Section 2: How I Built This ("আমি কিভাবে প্রজেক্টগুলা করলাম") */}
            <div className="project-content-block">
              <div className="block-title-row">
                <div className="block-icon">
                  <Cpu size={18} color="#a87cff" />
                </div>
                <h2>How I Built This Project</h2>
              </div>
              <div className="block-body-text how-built-body">
                {project.how_built ? (
                  project.how_built.split("\n\n").map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))
                ) : (
                  <p>
                    Engineered from ground up with modern software design
                    principles. Focused on responsive frontend architecture,
                    low-latency API communications, and robust cloud data
                    synchronization.
                  </p>
                )}
              </div>
            </div>

            {/* Section 3: Key Features & Capabilities */}
            {project.features && project.features.length > 0 && (
              <div className="project-content-block">
                <div className="block-title-row">
                  <div className="block-icon">
                    <CheckCircle2 size={18} color="#22c55e" />
                  </div>
                  <h2>Key Features & Highlights</h2>
                </div>
                <div className="features-checklist">
                  {project.features.map((feat, idx) => (
                    <div key={idx} className="feature-item">
                      <div className="feature-dot" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <aside className="project-sidebar-column">
            {/* Tech Stack Box */}
            <div className="project-meta-card">
              <h3>Technologies Used</h3>
              <div className="meta-tags-list">
                {(Array.isArray(project.tags)
                  ? project.tags
                  : (project.tags || "").split(",")
                ).map((tag, idx) => (
                  <span key={idx} className="meta-tag-badge">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Specifications Card */}
            <div className="project-meta-card">
              <h3>Project Meta</h3>
              <div className="meta-spec-list">
                <div className="meta-spec-item">
                  <span className="spec-label">Role</span>
                  <span className="spec-value">Lead Developer & Automation Specialist</span>
                </div>
                <div className="meta-spec-item">
                  <span className="spec-label">Category</span>
                  <span className="spec-value">{project.category}</span>
                </div>
                <div className="meta-spec-item">
                  <span className="spec-label">Status</span>
                  <span className="spec-value status-live">Live & Production Ready</span>
                </div>
                <div className="meta-spec-item">
                  <span className="spec-label">Database</span>
                  <span className="spec-value">Cloudflare D1 & Edge Cache</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* ============================================================== */}
        {/* BOTTOM PAGINATION: PREV / NEXT PROJECTS */}
        {/* ============================================================== */}
        <nav className="project-pagination-nav">
          {prevProject ? (
            <Link
              to={`/project/${prevProject.id}`}
              className="pagination-btn pagination-prev"
              data-cursor="disable"
            >
              <div className="pagination-arrow">
                <ChevronLeft size={18} />
              </div>
              <div className="pagination-text">
                <span className="pagination-label">Previous Project</span>
                <span className="pagination-title">{prevProject.title}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextProject ? (
            <Link
              to={`/project/${nextProject.id}`}
              className="pagination-btn pagination-next"
              data-cursor="disable"
            >
              <div className="pagination-text">
                <span className="pagination-label">Next Project</span>
                <span className="pagination-title">{nextProject.title}</span>
              </div>
              <div className="pagination-arrow">
                <ChevronRight size={18} />
              </div>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </main>
    </div>
  );
}
