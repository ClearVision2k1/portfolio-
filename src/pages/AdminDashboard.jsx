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
  Search,
  Filter,
  X,
  RotateCcw,
  Globe,
  Code2,
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

const CATEGORIES = [
  "Full-Stack Web Development",
  "AI Automation",
  "SaaS Application",
  "Mobile / API Integration",
  "Creative WebGL & 3D",
  "Custom Solution",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Active Tab: "add" or "edit"
  const [activeTab, setActiveTab] = useState("add");

  // -------------------------------------------------------------
  // TAB 1: ADD PROJECT FORM STATE
  // -------------------------------------------------------------
  const initialAddForm = {
    title: "",
    category: "Full-Stack Web Development",
    description: "",
    tags: "",
    github: "",
    live: "",
    image: "",
  };
  const [addForm, setAddForm] = useState(initialAddForm);
  const [addImagePreview, setAddImagePreview] = useState("");
  const [addCompressing, setAddCompressing] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  // -------------------------------------------------------------
  // TAB 2: EDIT PROJECTS STATE & MODAL
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editCompressing, setEditCompressing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Security Check: Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  // Load Projects from Cloudflare D1 / Local Cache
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

  // -------------------------------------------------------------
  // HANDLERS FOR ADD PROJECT
  // -------------------------------------------------------------
  const handleAddImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 1200, 800, 0.82);
      setAddImagePreview(compressedDataUrl);
      setAddForm((prev) => ({ ...prev, image: compressedDataUrl }));
      showToast("Image optimized for D1 storage", "success");
    } catch (err) {
      showToast("Image optimization failed", "error");
    } finally {
      setAddCompressing(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.title.trim()) {
      showToast("Project title is required", "error");
      return;
    }

    setAddSaving(true);
    try {
      await createProject(addForm);
      showToast("Project published successfully!", "success");
      setAddForm(initialAddForm);
      setAddImagePreview("");
      await loadProjects();
    } catch (err) {
      showToast(err.message || "Failed to publish project", "error");
    } finally {
      setAddSaving(false);
    }
  };

  const handleAddReset = () => {
    setAddForm(initialAddForm);
    setAddImagePreview("");
  };

  // -------------------------------------------------------------
  // HANDLERS FOR EDIT PROJECT
  // -------------------------------------------------------------
  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      category: project.category || "Full-Stack Web Development",
      description: project.description || "",
      tags: Array.isArray(project.tags) ? project.tags.join(", ") : project.tags || "",
      github: project.github || "",
      live: project.live || project.link || "",
      image: project.image || "",
    });
    setEditImagePreview(project.image || "");
  };

  const handleCloseEdit = () => {
    setEditingProject(null);
    setEditForm(null);
    setEditImagePreview("");
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 1200, 800, 0.82);
      setEditImagePreview(compressedDataUrl);
      setEditForm((prev) => ({ ...prev, image: compressedDataUrl }));
      showToast("New image compressed & ready", "success");
    } catch (err) {
      showToast("Image compression failed", "error");
    } finally {
      setEditCompressing(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      showToast("Project title is required", "error");
      return;
    }

    setEditSaving(true);
    try {
      await updateProject(editingProject.id, editForm);
      showToast("Project updated successfully!", "success");
      handleCloseEdit();
      await loadProjects();
    } catch (err) {
      showToast(err.message || "Failed to update project", "error");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteProject(id);
        showToast("Project deleted successfully", "success");
        await loadProjects();
      } catch (err) {
        showToast("Delete failed", "error");
      }
    }
  };

  // Filtered projects for Edit view
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(p.tags) ? p.tags.join(" ") : p.tags || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <Link to="/" className="admin-back-btn">
            <ArrowLeft size={15} />
            <span>Back to Portfolio</span>
          </Link>
          <div className="admin-brand-badge">
            <span className="admin-brand-dot" />
            <span>Admin Control Panel</span>
          </div>
        </div>

        <div className="admin-topbar-right">
          <div className="admin-db-status" title="Cloudflare D1 Database Active">
            <Database size={14} color="#a87cff" />
            <span>Cloudflare D1</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn" title="Sign out of Admin">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-container">
        {/* Header Hero */}
        <section className="admin-header-row">
          <div>
            <h1>Project Management</h1>
            <p>
              Manage portfolio projects, live deployments, and Cloudflare D1 storage.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="admin-metrics-group">
            <div className="admin-metric-badge">
              <Layers size={15} color="#c2a4ff" />
              <span><strong>{projects.length}</strong> Projects</span>
            </div>
            <div className="admin-metric-badge">
              <Sparkles size={15} color="#a87cff" />
              <span><strong>{new Set(projects.map((p) => p.category)).size}</strong> Categories</span>
            </div>
            <div className="admin-metric-badge">
              <Database size={15} color="#22c55e" />
              <span><strong>5 GB</strong> Free D1</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* TWO CLEAN DEDICATED TABS */}
        {/* ------------------------------------------------------------- */}
        <div className="admin-tabs-container">
          <div className="admin-tabs-nav">
            <button
              type="button"
              className={`admin-tab-item ${activeTab === "add" ? "active" : ""}`}
              onClick={() => setActiveTab("add")}
            >
              <Plus size={16} />
              <span>Add New Project</span>
            </button>

            <button
              type="button"
              className={`admin-tab-item ${activeTab === "edit" ? "active" : ""}`}
              onClick={() => setActiveTab("edit")}
            >
              <Edit3 size={15} />
              <span>Edit Existing Projects</span>
              <span className="admin-tab-pill">{projects.length}</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* OPTION 1: ADD PROJECT FORM */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "add" && (
          <section className="admin-card-pane">
            <div className="admin-pane-top">
              <div>
                <h2>Create Showcase Project</h2>
                <p>Provide project details, screenshots, and links to publish directly to your portfolio.</p>
              </div>

              <button
                type="button"
                onClick={handleAddReset}
                className="admin-btn-ghost"
                title="Reset all input fields"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="admin-form-grid">
              {/* Row 1: Title & Category */}
              <div className="admin-two-col">
                <div className="admin-input-group">
                  <label>Project Title <span className="admin-required">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., AI WhatsApp Automation & Customer CRM"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  />
                </div>

                <div className="admin-input-group">
                  <label>Category <span className="admin-required">*</span></label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Description */}
              <div className="admin-input-group">
                <label>Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the problem solved, architecture overview, and core functionality..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                />
              </div>

              {/* Row 3: Tech Stack Tags */}
              <div className="admin-input-group">
                <label>Tech Stack Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Next.js, Python, OpenAI, Cloudflare, PostgreSQL"
                  value={addForm.tags}
                  onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                />
                {addForm.tags && (
                  <div className="admin-tag-preview-bar">
                    {addForm.tags.split(",").map((t, idx) => {
                      const trimmed = t.trim();
                      return trimmed ? (
                        <span key={idx} className="admin-preview-pill">
                          {trimmed}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Row 4: Live URL & GitHub URL */}
              <div className="admin-two-col">
                <div className="admin-input-group">
                  <label>Live Website URL</label>
                  <div className="admin-icon-field">
                    <Globe size={15} className="field-icon" />
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={addForm.live}
                      onChange={(e) => setAddForm({ ...addForm, live: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-input-group">
                  <label>GitHub Repository URL</label>
                  <div className="admin-icon-field">
                    <Code2 size={15} className="field-icon" />
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={addForm.github}
                      onChange={(e) => setAddForm({ ...addForm, github: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Screenshot / Image Upload with Auto-compression */}
              <div className="admin-input-group">
                <label>Project Screenshot / Cover</label>
                <div className="admin-dropzone-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    id="add-image-file"
                    onChange={handleAddImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="add-image-file" className="admin-dropzone">
                    <Upload size={22} color="#a87cff" />
                    <div>
                      <p className="dropzone-title">
                        {addCompressing ? "Compressing image for Cloudflare D1..." : "Click to browse or drop screenshot here"}
                      </p>
                      <p className="dropzone-subtitle">
                        Automatically compressed to high-res WebP (&lt; 100KB) for direct D1 storage.
                      </p>
                    </div>
                  </label>

                  {addImagePreview && (
                    <div className="admin-image-display">
                      <img src={addImagePreview} alt="Project Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setAddImagePreview("");
                          setAddForm({ ...addForm, image: "" });
                        }}
                        className="admin-image-delete-btn"
                        title="Remove image"
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-submit-row">
                <button
                  type="submit"
                  disabled={addSaving || addCompressing}
                  className="admin-btn-action"
                >
                  <Plus size={16} />
                  <span>{addSaving ? "Publishing to D1..." : "Publish Project"}</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* OPTION 2: EDIT & MANAGE PROJECTS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "edit" && (
          <section className="admin-card-pane">
            <div className="admin-pane-top">
              <div>
                <h2>Manage Showcase Projects</h2>
                <p>Select any project below to update details, replace screenshots, or delete from portfolio.</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("add")}
                className="admin-btn-action admin-btn-action-sm"
              >
                <Plus size={15} />
                <span>Add Another Project</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="admin-search-row">
              <div className="admin-search-box">
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by title, description, or tech stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="search-clear-btn"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="admin-select-wrapper">
                <Filter size={14} color="#a87cff" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories ({projects.length})</option>
                  {CATEGORIES.map((cat) => {
                    const count = projects.filter((p) => p.category === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="admin-state-box">
                <div className="admin-spinner" />
                <span>Loading projects from Cloudflare D1...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="admin-state-box">
                <ImageIcon size={44} color="rgba(255,255,255,0.2)" />
                <p>No matching projects found.</p>
                {searchQuery || categoryFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                    className="admin-btn-ghost"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="admin-btn-action"
                  >
                    <Plus size={15} />
                    <span>Create Your First Project</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-cards-grid">
                {filteredProjects.map((project, idx) => (
                  <div key={project.id || idx} className="admin-item-card">
                    {/* Thumbnail */}
                    <div className="admin-item-media">
                      {project.image ? (
                        <img src={project.image} alt={project.title} />
                      ) : (
                        <div className="admin-item-empty-img">No Image Provided</div>
                      )}
                      <span className="admin-item-tag">{project.category}</span>
                    </div>

                    {/* Card Content */}
                    <div className="admin-item-content">
                      <h3>{project.title}</h3>
                      <p className="admin-item-desc">{project.description}</p>

                      {/* Tags */}
                      <div className="admin-item-pills">
                        {(Array.isArray(project.tags)
                          ? project.tags
                          : (project.tags || "").split(",")
                        )
                          .slice(0, 4)
                          .map((tag, tIdx) => (
                            <span key={tIdx} className="admin-mini-pill">
                              {tag.trim()}
                            </span>
                          ))}
                      </div>

                      {/* Links */}
                      <div className="admin-item-links">
                        {(project.live || project.link) && (
                          <a
                            href={project.live || project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-link-chip"
                            title="Open Live Preview"
                          >
                            <ExternalLink size={13} />
                            <span>Live</span>
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-link-chip"
                            title="View Source on GitHub"
                          >
                            <Github size={13} />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="admin-item-actions">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="admin-act-btn admin-act-edit"
                        title="Edit this project"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        className="admin-act-btn admin-act-del"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* EDIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {editingProject && editForm && (
        <div className="admin-modal-overlay" onClick={handleCloseEdit}>
          <div className="admin-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-window-header">
              <div className="admin-modal-window-title">
                <Edit3 size={18} color="#a87cff" />
                <h3>Edit Project</h3>
              </div>
              <button onClick={handleCloseEdit} className="admin-window-close" title="Close">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="admin-form-grid">
              <div className="admin-two-col">
                <div className="admin-input-group">
                  <label>Project Title <span className="admin-required">*</span></label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>Category <span className="admin-required">*</span></label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-input-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="admin-input-group">
                <label>Tech Stack Tags (Comma separated)</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                />
              </div>

              <div className="admin-two-col">
                <div className="admin-input-group">
                  <label>Live URL</label>
                  <input
                    type="url"
                    value={editForm.live}
                    onChange={(e) => setEditForm({ ...editForm, live: e.target.value })}
                  />
                </div>
                <div className="admin-input-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-input-group">
                <label>Replace Screenshot / Cover</label>
                <div className="admin-dropzone-wrap">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-image-file"
                    onChange={handleEditImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="edit-image-file" className="admin-dropzone">
                    <Upload size={18} color="#a87cff" />
                    <span>
                      {editCompressing
                        ? "Compressing new image..."
                        : "Click to upload replacement image (WebP Auto-optimized)"}
                    </span>
                  </label>

                  {editImagePreview && (
                    <div className="admin-image-display">
                      <img src={editImagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditImagePreview("");
                          setEditForm({ ...editForm, image: "" });
                        }}
                        className="admin-image-delete-btn"
                        title="Remove Image"
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={handleCloseEdit} className="admin-btn-ghost">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving || editCompressing}
                  className="admin-btn-action"
                >
                  {editSaving ? "Saving to D1..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
