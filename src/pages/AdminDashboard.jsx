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

  // Active Tab: "add" (প্রজেক্ট অ্যাড করা) or "edit" (প্রজেক্ট এডিট করা)
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
  const [editingProject, setEditingProject] = useState(null); // Project currently in edit modal
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
  // HANDLERS FOR OPTION 1: ADD PROJECT
  // -------------------------------------------------------------
  const handleAddImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddCompressing(true);
    try {
      const compressedDataUrl = await compressImage(file, 1200, 800, 0.82);
      setAddImagePreview(compressedDataUrl);
      setAddForm((prev) => ({ ...prev, image: compressedDataUrl }));
      showToast("Image compressed & ready for D1", "success");
    } catch (err) {
      showToast("Image compression failed", "error");
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
      showToast("Project added & published successfully!", "success");
      setAddForm(initialAddForm);
      setAddImagePreview("");
      await loadProjects();
    } catch (err) {
      showToast(err.message || "Failed to add project", "error");
    } finally {
      setAddSaving(false);
    }
  };

  const handleAddReset = () => {
    setAddForm(initialAddForm);
    setAddImagePreview("");
  };

  // -------------------------------------------------------------
  // HANDLERS FOR OPTION 2: EDIT PROJECT
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
        showToast("Project removed successfully", "success");
        await loadProjects();
      } catch (err) {
        showToast("Delete failed", "error");
      }
    }
  };

  // Filtered projects for Option 2 (Edit view)
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

      {/* Main Container */}
      <main className="admin-container">
        {/* Header Hero */}
        <section className="admin-hero">
          <div>
            <h1>Project Management Dashboard</h1>
            <p>
              Manage your personal portfolio showcase. Easily add new creations or update existing projects.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="admin-quick-stats">
            <div className="admin-quick-stat-item">
              <Layers size={16} color="#c2a4ff" />
              <span><strong>{projects.length}</strong> Total Projects</span>
            </div>
            <div className="admin-quick-stat-item">
              <Sparkles size={16} color="#a87cff" />
              <span><strong>{new Set(projects.map((p) => p.category)).size}</strong> Categories</span>
            </div>
            <div className="admin-quick-stat-item">
              <Database size={16} color="#22c55e" />
              <span><strong>5 GB</strong> D1 Storage</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* TWO PROMINENT OPTIONS: ADD PROJECT & EDIT PROJECT */}
        {/* ------------------------------------------------------------- */}
        <section className="admin-option-selector">
          <button
            type="button"
            className={`admin-option-card ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            <div className="admin-option-icon">
              <Plus size={24} />
            </div>
            <div className="admin-option-info">
              <div className="admin-option-badge">OPTION 1</div>
              <h3>প্রজেক্ট অ্যাড করা (Add Project)</h3>
              <p>নতুন প্রজেক্টের টাইটেল, ডেসক্রিপশন, ট্যাগ ও ছবি দিয়ে পোর্টফোলিওতে সরাসরি যুক্ত করুন।</p>
            </div>
          </button>

          <button
            type="button"
            className={`admin-option-card ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <div className="admin-option-icon">
              <Edit3 size={22} />
            </div>
            <div className="admin-option-info">
              <div className="admin-option-badge">OPTION 2</div>
              <h3>প্রজেক্ট এডিট করা (Edit Projects)</h3>
              <p>পূর্বের যেকোনো প্রজেক্টের তথ্য পরিবর্তন করুন, ছবি আপডেট করুন বা প্রজেক্ট মুছে ফেলুন ({projects.length} টি)।</p>
            </div>
          </button>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: OPTION 1 - ADD PROJECT (প্রজেক্ট অ্যাড করা) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "add" && (
          <section className="admin-section-pane animate-fade-in">
            <div className="admin-pane-header">
              <div className="admin-pane-title-group">
                <div className="admin-pane-icon-badge add-badge">
                  <Plus size={20} />
                </div>
                <div>
                  <h2>নতুন প্রজেক্ট যুক্ত করুন (Add New Project)</h2>
                  <p>নিচের ফর্মটি পূরণ করে "Save & Publish" বাটনে ক্লিক করলেই আপনার ওয়েবসাইটে শো করবে।</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddReset}
                className="admin-btn-secondary"
                title="Clear all fields"
              >
                <RotateCcw size={14} />
                <span>Reset Form</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="admin-form-card">
              {/* Row 1: Title & Category */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Project Title <span className="req-star">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., AI WhatsApp Automation & Customer CRM"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Category <span className="req-star">*</span></label>
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
              <div className="admin-form-group">
                <label>Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what the project does, key features, business impact, and how it was built..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                />
              </div>

              {/* Row 3: Tech Stack Tags */}
              <div className="admin-form-group">
                <label>Tech Stack Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, OpenAI API, Cloudflare Workers, TailwindCSS"
                  value={addForm.tags}
                  onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
                />
                {addForm.tags && (
                  <div className="admin-tags-preview">
                    {addForm.tags.split(",").map((t, idx) => {
                      const trimmed = t.trim();
                      return trimmed ? (
                        <span key={idx} className="admin-tag-pill">
                          {trimmed}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Row 4: Live URL & GitHub URL */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Live Website URL</label>
                  <input
                    type="url"
                    placeholder="https://myproject.com"
                    value={addForm.live}
                    onChange={(e) => setAddForm({ ...addForm, live: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/ClearVision2k1/my-repo"
                    value={addForm.github}
                    onChange={(e) => setAddForm({ ...addForm, github: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5: Screenshot / Image Upload with Auto-compression */}
              <div className="admin-form-group">
                <label>Project Screenshot / Image</label>
                <div className="admin-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    id="add-project-image-input"
                    onChange={handleAddImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="add-project-image-input" className="admin-upload-label">
                    <Upload size={22} color="#c2a4ff" />
                    <div>
                      <span className="upload-main-text">
                        {addCompressing ? "Compressing image for Cloudflare D1..." : "Click or Drag to Upload Project Image"}
                      </span>
                      <span className="upload-sub-text">
                        Auto-compressed into high quality lightweight WebP format (&lt; 100KB)
                      </span>
                    </div>
                  </label>

                  {addImagePreview && (
                    <div className="admin-preview-box">
                      <img src={addImagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setAddImagePreview("");
                          setAddForm({ ...addForm, image: "" });
                        }}
                        className="admin-remove-img-btn"
                        title="Remove Image"
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="admin-form-actions">
                <button
                  type="submit"
                  disabled={addSaving || addCompressing}
                  className="admin-btn-primary admin-submit-large"
                >
                  <Plus size={18} />
                  <span>{addSaving ? "Publishing to D1..." : "Save & Publish Project"}</span>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: OPTION 2 - EDIT PROJECT (প্রজেক্ট এডিট করা) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "edit" && (
          <section className="admin-section-pane animate-fade-in">
            <div className="admin-pane-header">
              <div className="admin-pane-title-group">
                <div className="admin-pane-icon-badge edit-badge">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h2>প্রজেক্ট এডিট ও পরিবর্তন করুন (Edit Projects)</h2>
                  <p>যেকোনো প্রজেক্টের "Edit Project" বাটনে ক্লিক করে তথ্য বা ছবি পরিবর্তন করুন।</p>
                </div>
              </div>

              {/* Quick Jump to Add */}
              <button
                type="button"
                onClick={() => setActiveTab("add")}
                className="admin-btn-primary"
              >
                <Plus size={16} />
                <span>Add Another Project</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search projects by title, description, or tech stack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="clear-search-btn"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="admin-category-filter">
                <Filter size={15} color="#c2a4ff" />
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

            {/* Projects Grid for Editing */}
            {loading ? (
              <div className="admin-loading-state">
                <div className="admin-spinner" />
                <span>Loading projects from Cloudflare D1...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="admin-empty-state">
                <ImageIcon size={48} color="rgba(255,255,255,0.2)" />
                <p>No matching projects found.</p>
                {searchQuery || categoryFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                    className="admin-btn-secondary"
                  >
                    Clear Search Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="admin-btn-primary"
                  >
                    <Plus size={16} />
                    <span>Add Your First Project</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-projects-grid">
                {filteredProjects.map((project, idx) => (
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
                        {(project.live || project.link) && (
                          <a
                            href={project.live || project.link}
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

                    {/* Actions Bar: Prominent Edit and Delete */}
                    <div className="admin-card-actions">
                      <button
                        onClick={() => handleOpenEdit(project)}
                        className="admin-action-btn admin-edit-btn"
                        title="Edit this project"
                      >
                        <Edit3 size={15} />
                        <span>Edit Project</span>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        className="admin-action-btn admin-del-btn"
                        title="Delete project"
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
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* EDIT PROJECT MODAL (Triggered from Option 2) */}
      {/* ------------------------------------------------------------- */}
      {editingProject && editForm && (
        <div className="admin-modal-overlay" onClick={handleCloseEdit}>
          <div className="admin-editor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-editor-header">
              <div className="admin-editor-header-title">
                <Edit3 size={20} color="#c2a4ff" />
                <h2>প্রজেক্ট এডিট করুন (Edit Project)</h2>
              </div>
              <button onClick={handleCloseEdit} className="admin-modal-close" title="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="admin-editor-form">
              {/* Row 1: Title & Category */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Project Title <span className="req-star">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Project Title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Category <span className="req-star">*</span></label>
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

              {/* Row 2: Description */}
              <div className="admin-form-group">
                <label>Project Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the solution, impact, and features..."
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              {/* Row 3: Tags */}
              <div className="admin-form-group">
                <label>Tech Stack Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Python, PostgreSQL"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                />
              </div>

              {/* Row 4: Live & Github Links */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Live URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={editForm.live}
                    onChange={(e) => setEditForm({ ...editForm, live: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5: Image Upload with Canvas Auto-compression */}
              <div className="admin-form-group">
                <label>Replace / Update Project Screenshot</label>
                <div className="admin-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-project-image-input"
                    onChange={handleEditImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="edit-project-image-input" className="admin-upload-label">
                    <Upload size={20} color="#c2a4ff" />
                    <span>
                      {editCompressing
                        ? "Compressing new image..."
                        : "Click to upload replacement image"}
                    </span>
                  </label>

                  {editImagePreview && (
                    <div className="admin-preview-box">
                      <img src={editImagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setEditImagePreview("");
                          setEditForm({ ...editForm, image: "" });
                        }}
                        className="admin-remove-img-btn"
                        title="Remove Image"
                      >
                        <X size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-editor-actions">
                <button type="button" onClick={handleCloseEdit} className="admin-btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving || editCompressing}
                  className="admin-btn-primary"
                >
                  {editSaving ? "Saving to D1..." : "Update Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
