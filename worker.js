/**
 * Cloudflare Worker with Native D1 Database & Static Assets Binding
 * Eliyas Hasan Personal Portfolio Backend API
 */

const DEFAULT_PASSKEY = "112212123";
const AUTH_TOKEN_PREFIX = "eh_token_";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function verifyAuth(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const validPasskey = env.ADMIN_PASSWORD || DEFAULT_PASSKEY;
  // Simple HMAC/token validation against the passkey
  const expectedToken = AUTH_TOKEN_PREFIX + btoa(validPasskey).slice(0, 16);
  return token === expectedToken || token === validPasskey;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // -------------------------------------------------------------
    // API ROUTE: /api/admin/auth (Verify Admin Passkey)
    // -------------------------------------------------------------
    if (url.pathname === "/api/admin/auth" && request.method === "POST") {
      try {
        const body = await request.json();
        const validPasskey = env.ADMIN_PASSWORD || DEFAULT_PASSKEY;
        if (body.password === validPasskey) {
          const token = AUTH_TOKEN_PREFIX + btoa(validPasskey).slice(0, 16);
          return jsonResponse({ success: true, token, message: "Access granted" });
        }
        return jsonResponse({ success: false, error: "Invalid Passkey" }, 401);
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 400);
      }
    }

    // -------------------------------------------------------------
    // API ROUTE: /api/admin/init-db (Auto initialize table if needed)
    // -------------------------------------------------------------
    if (url.pathname === "/api/admin/init-db" && request.method === "POST") {
      if (!verifyAuth(request, env)) {
        return jsonResponse({ success: false, error: "Unauthorized" }, 401);
      }
      if (!env.DB) {
        return jsonResponse({ success: false, error: "Cloudflare D1 is not bound yet" }, 500);
      }
      try {
        await env.DB.exec(`
          CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            tags TEXT,
            image TEXT,
            screenshots TEXT,
            how_built TEXT,
            features TEXT,
            github TEXT,
            live TEXT,
            order_index INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        return jsonResponse({ success: true, message: "Table initialized successfully" });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // -------------------------------------------------------------
    // API ROUTE: /api/projects (Public: Fetch all projects)
    // -------------------------------------------------------------
    if (url.pathname === "/api/projects" && request.method === "GET") {
      if (!env.DB) {
        return jsonResponse({ success: true, projects: [], d1_connected: false });
      }
      try {
        // Query projects from D1
        const { results } = await env.DB.prepare(
          "SELECT * FROM projects ORDER BY order_index ASC, id DESC"
        ).all();
        return jsonResponse({ success: true, projects: results || [], d1_connected: true });
      } catch (err) {
        // Table might not exist yet, return empty list gracefully
        return jsonResponse({ success: true, projects: [], error: err.message, d1_connected: true });
      }
    }

    // -------------------------------------------------------------
    // API ROUTE: /api/admin/projects (Protected: Add new project)
    // -------------------------------------------------------------
    if (url.pathname === "/api/admin/projects" && request.method === "POST") {
      if (!verifyAuth(request, env)) {
        return jsonResponse({ success: false, error: "Unauthorized" }, 401);
      }
      if (!env.DB) {
        return jsonResponse({ success: false, error: "D1 database not bound" }, 500);
      }
      try {
        const body = await request.json();
        const { title, category, description, tags, image, screenshots, how_built, features, github, live, order_index } = body;

        if (!title || !category) {
          return jsonResponse({ success: false, error: "Title and category are required" }, 400);
        }

        const screenshotsStr = typeof screenshots === "object" ? JSON.stringify(screenshots) : (screenshots || "");

        const info = await env.DB.prepare(
          `INSERT INTO projects (title, category, description, tags, image, screenshots, how_built, features, github, live, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            title,
            category,
            description || "",
            tags || "",
            image || "",
            screenshotsStr,
            how_built || "",
            features || "",
            github || "",
            live || "",
            order_index || 0
          )
          .run();

        return jsonResponse({
          success: true,
          id: info.meta.last_row_id,
          message: "Project created successfully",
        });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }

    // -------------------------------------------------------------
    // API ROUTE: /api/admin/projects/:id (Protected: Update/Delete project)
    // -------------------------------------------------------------
    const projectMatch = url.pathname.match(/^\/api\/admin\/projects\/(\d+)$/);
    if (projectMatch) {
      if (!verifyAuth(request, env)) {
        return jsonResponse({ success: false, error: "Unauthorized" }, 401);
      }
      if (!env.DB) {
        return jsonResponse({ success: false, error: "D1 database not bound" }, 500);
      }

      const projectId = parseInt(projectMatch[1], 10);

      // DELETE Project
      if (request.method === "DELETE") {
        try {
          await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(projectId).run();
          return jsonResponse({ success: true, message: "Project deleted successfully" });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }

      // PUT Update Project
      if (request.method === "PUT") {
        try {
          const body = await request.json();
          const { title, category, description, tags, image, screenshots, how_built, features, github, live, order_index } = body;

          const screenshotsStr = typeof screenshots === "object" ? JSON.stringify(screenshots) : (screenshots || "");

          await env.DB.prepare(
            `UPDATE projects SET
              title = ?,
              category = ?,
              description = ?,
              tags = ?,
              image = ?,
              screenshots = ?,
              how_built = ?,
              features = ?,
              github = ?,
              live = ?,
              order_index = ?
             WHERE id = ?`
          )
            .bind(
              title,
              category,
              description || "",
              tags || "",
              image || "",
              screenshotsStr,
              how_built || "",
              features || "",
              github || "",
              live || "",
              order_index || 0,
              projectId
            )
            .run();

          return jsonResponse({ success: true, message: "Project updated successfully" });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
    }

    // -------------------------------------------------------------
    // Fallback: Cloudflare Static Assets (Portfolio SPA Frontend)
    // -------------------------------------------------------------
    return env.ASSETS.fetch(request);
  },
};
