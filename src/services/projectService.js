/**
 * Project Service: Bridges Cloudflare D1 Backend API with Local Cache Fallback
 */

import { config } from "../data/config";

const LOCAL_STORAGE_KEY = "eh_portfolio_custom_projects";
const AUTH_STORAGE_KEY = "eh_admin_auth";
const DEFAULT_PASSKEY = "112212123";

/**
 * Compress an image File via Canvas to WebP/JPEG Base64 string (~70-120KB)
 */
export async function compressImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Admin Authentication
 */
export async function verifyAdminPasskey(password) {
  // Try Cloudflare Worker endpoint first
  try {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, data.token);
        return { success: true };
      }
    }
  } catch (err) {
    // If running offline or API unreachable, use local validation
    console.warn("Worker auth unavailable, checking local fallback:", err);
  }

  // Fallback to local passkey check
  if (password === DEFAULT_PASSKEY) {
    const token = "eh_token_" + btoa(DEFAULT_PASSKEY).slice(0, 16);
    sessionStorage.setItem(AUTH_STORAGE_KEY, token);
    return { success: true };
  }

  return { success: false, error: "Invalid Passkey" };
}

export function isAuthenticated() {
  const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
  return !!token;
}

export function logoutAdmin() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Fetch All Projects (D1 + config.js fallback)
 */
export async function getAllProjects() {
  let d1Projects = [];
  try {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects) && data.projects.length > 0) {
        d1Projects = data.projects.map((p) => ({
          ...p,
          tags: typeof p.tags === "string" ? p.tags.split(",").map((t) => t.trim()) : p.tags,
        }));
      }
    }
  } catch (err) {
    console.warn("Could not fetch from /api/projects:", err);
  }

  // Check local storage custom projects
  let localProjects = [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      localProjects = JSON.parse(stored);
    }
  } catch (e) {}

  // Format helper to ensure both link/live and tags/technologies are normalized
  const normalizeProject = (p, defaultIdx = 0) => {
    const tagsArray = Array.isArray(p.tags)
      ? p.tags
      : (typeof p.tags === "string" ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : (p.techStack || []));
    const techString = p.technologies || (tagsArray.length > 0 ? tagsArray.join(" • ") : "");
    const targetLink = p.link || p.live || p.github || "#";

    let projectImage = p.image;
    const defaultThumbnail = `/images/projects/project-${p.id || defaultIdx + 1}.webp`;
    if (!projectImage || projectImage.includes("eliyas-photo.png") || projectImage === "/project-placeholder.webp") {
      projectImage = defaultThumbnail;
    }

    return {
      id: p.id || defaultIdx + 1,
      title: p.title || "Untitled Project",
      category: p.category || "Full-Stack Web Development",
      description: p.description || "",
      technologies: techString,
      tags: tagsArray,
      image: projectImage,
      github: p.github || "",
      live: p.live || p.link || "",
      link: targetLink,
      order_index: p.order_index !== undefined ? p.order_index : defaultIdx,
      created_at: p.created_at || new Date().toISOString(),
    };
  };

  if (d1Projects.length > 0) {
    return d1Projects.map((p, idx) => normalizeProject(p, idx));
  }

  if (localProjects.length > 0) {
    return localProjects.map((p, idx) => normalizeProject(p, idx));
  }

  // Default to config.projects
  return config.projects.map((p, idx) => normalizeProject(p, idx));
}

/**
 * Save / Create Project
 */
export async function createProject(projectData) {
  const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
  const payload = {
    ...projectData,
    tags: Array.isArray(projectData.tags) ? projectData.tags.join(", ") : projectData.tags,
  };

  // Try API first
  let apiSucceeded = false;
  try {
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      apiSucceeded = true;
    }
  } catch (e) {}

  // Always keep localStorage in sync
  const current = await getAllProjects();
  const newProj = {
    ...projectData,
    id: Date.now(),
    tags: Array.isArray(projectData.tags)
      ? projectData.tags
      : (projectData.tags || "").split(",").map((t) => t.trim()),
    created_at: new Date().toISOString(),
  };
  const updated = [newProj, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  return { success: true, project: newProj, syncedWithD1: apiSucceeded };
}

/**
 * Update Project
 */
export async function updateProject(id, projectData) {
  const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
  const payload = {
    ...projectData,
    tags: Array.isArray(projectData.tags) ? projectData.tags.join(", ") : projectData.tags,
  };

  try {
    await fetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {}

  const current = await getAllProjects();
  const updated = current.map((p) =>
    p.id === id
      ? {
          ...p,
          ...projectData,
          tags: Array.isArray(projectData.tags)
            ? projectData.tags
            : (projectData.tags || "").split(",").map((t) => t.trim()),
        }
      : p
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return { success: true };
}

/**
 * Delete Project
 */
export async function deleteProject(id) {
  const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
  try {
    await fetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (e) {}

  const current = await getAllProjects();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return { success: true };
}
