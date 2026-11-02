import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Github,
  ArrowLeft,
  LogOut,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  isAuthenticated,
  logoutAdmin,
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  compressImage,
} from "../services/projectService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Full-Stack Web Development",
    description: "",
    tags: "",
    github: "",
    live: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [compressingImage, setCompressingImage] = useState(false);

  // Security Check: Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  // Load Projects
  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      showToast("Error loading projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Full-Stack Web Development",
      description: "",
      tags: "",
      github: "",
      live: "",
      image: "",
    });
    setImagePreview("");
    setShowModal(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      category: project.category || "Full-Stack Web Development",
      description: project.description || "",
      tags: Array.isArray(project.tags) ? project.tags.join(", ") : project.tags || "",
      github: project.github || "",
      live: project.live || "",
      image: project.image || "",
    });
    setImagePreview(project.image || "");
    setShowModal(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingImage(true);
    try {
      // Auto-compress image to WebP/JPEG under 100KB for D1 storage
      const compressedDataUrl = await compressImage(file, 1200, 800, 0.82);
      setImagePreview(compressedDataUrl);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
      showToast("Image compressed & ready", "success");
    } catch (err) {
      showToast("Image compression failed", "error");
    } finally {
      setCompressingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Project title is required", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateProject(editingId, formData);
        showToast("Project updated successfully!", "success");
      } else {
        await createProject(formData);
        showToast("New project added successfully!", "success");
      }
      setShowModal(false);
      await loadProjects();
    } catch (err) {
      showToast(err.message || "Failed to save project", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteProject(id);
        showToast("Project removed", "success");
        await loadProjects();
      } catch (err) {
        showToast("Delete failed", "error");
      }
    }
  };

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast admin-toast-${toast.type}`}>
          {toast.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <Link to="/" className="admin-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Portfolio</span>
          </Link>
          <div className="admin-brand-badge">
            <span className="admin-brand-dot" />
            <span>EH Control Center</span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <div className="admin-db-status" title="Cloudflare D1 & Cache Sync">
            <Database size={15} color="#c2a4ff" />
            <span>Cloudflare D1 Synced</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-container">
        {/* Header Hero Stats */}
        <section className="admin-hero">
          <div>
            <h1>Project Management Dashboard</h1>
            <p>
              Add, update, or remove showcase projects. All changes are stored in
              Cloudflare D1 and updated live across the portfolio.
            </p>
          </div>
          <button onClick={handleOpenAddModal} className="admin-add-btn">
            <Plus size={18} />
            <span>Add New Project</span>
          </button>
        </section>

        {/* Stats Row */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Layers size={22} color="#c2a4ff" />
            </div>
            <div>
              <div className="admin-stat-number">{projects.length}</div>
              <div className="admin-stat-label">Total Showcase Projects</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Sparkles size={22} color="#a87cff" />
            </div>
            <div>
              <div className="admin-stat-number">
                {new Set(projects.map((p) => p.category)).size}
              </div>
              <div className="admin-stat-label">Active Categories</div>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Database size={22} color="#22c55e" />
            </div>
            <div>
              <div className="admin-stat-number">5 GB</div>
              <div className="admin-stat-label">Cloudflare D1 Storage</div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="admin-projects-section">
          <h2>Your Projects ({projects.length})</h2>

          {loading ? (
            <div className="admin-loading-state">
              <div className="admin-spinner" />
              <span>Loading projects from Cloudflare...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="admin-empty-state">
              <ImageIcon size={48} color="rgba(255,255,255,0.2)" />
              <p>No projects found. Click "Add New Project" to get started!</p>
            </div>
          ) : (
            <div className="admin-projects-grid">
              {projects.map((project, idx) => (
                <div key={project.id || idx} className="admin-project-card">
                  {/* Card Thumbnail */}
                  <div className="admin-card-thumb">
                    {project.image ? (
                      <img src={project.image} alt={project.title} />
                    ) : (
                      <div className="admin-card-no-img">No Image Provided</div>
                    )}
                    <span className="admin-card-category">{project.category}</span>
                  </div>

                  {/* Card Body */}
                  <div className="admin-card-body">
                    <h3>{project.title}</h3>
                    <p className="admin-card-desc">{project.description}</p>

                    {/* Tech Tags */}
                    <div className="admin-card-tags">
                      {(Array.isArray(project.tags)
                        ? project.tags
                        : (project.tags || "").split(",")
                      )
                        .slice(0, 4)
                        .map((tag, tIdx) => (
                          <span key={tIdx} className="admin-tag-pill">
                            {tag.trim()}
                          </span>
                        ))}
                    </div>

                    {/* Links */}
                    <div className="admin-card-links">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link-btn"
                          title="Open Live Preview"
                        >
                          <ExternalLink size={14} />
                          <span>Live</span>
                        </a>
                      )}
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-link-btn"
                          title="View Source on GitHub"
                        >
                          <Github size={14} />
                          <span>Repo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="admin-card-actions">
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="admin-action-btn admin-edit-btn"
                      title="Edit Project"
                    >
                      <Edit3 size={15} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="admin-action-btn admin-del-btn"
                      title="Delete Project"
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Project Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="admin-editor-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-editor-header">
              <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="admin-modal-close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-editor-form">
              {/* Row 1: Title & Category */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., AI WhatsApp Automation Agent"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="AI Automation">AI Automation</option>
                    <option value="Full-Stack Web Development">
                      Full-Stack Web Development
                    </option>
                    <option value="SaaS Application">SaaS Application</option>
                    <option value="Mobile / API Integration">
                      Mobile / API Integration
                    </option>
                    <option value="Creative WebGL & 3D">Creative WebGL & 3D</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Description */}
              <div className="admin-form-group">
                <label>Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the solution, impact, and features..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Row 3: Tags */}
              <div className="admin-form-group">
                <label>Tech Stack Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, Three.js, PostgreSQL"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>

              {/* Row 4: Live & Github Links */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Live URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.live}
                    onChange={(e) =>
                      setFormData({ ...formData, live: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github}
                    onChange={(e) =>
                      setFormData({ ...formData, github: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 5: Image Upload with Canvas Auto-compression */}
              <div className="admin-form-group">
                <label>Project Screenshot / Image</label>
                <div className="admin-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    id="project-image-input"
                    onChange={handleImageFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="project-image-input"
                    className="admin-upload-label"
                  >
                    <Upload size={20} color="#c2a4ff" />
                    <span>
                      {compressingImage
                        ? "Compressing image..."
                        : "Click to upload image (Auto-optimized for D1)"}
                    </span>
                  </label>

                  {imagePreview && (
                    <div className="admin-preview-box">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, image: "" });
                        }}
                        className="admin-remove-img-btn"
                        title="Remove Image"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-editor-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || compressingImage}
                  className="admin-btn-primary"
                >
                  {saving
                    ? "Saving to D1..."
                    : editingId
                    ? "Update Project"
                    : "Save & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
