-- ========================================================
-- Cloudflare D1 SQL Schema: Eliyas Hasan Portfolio
-- Database Name: portfolio-db
-- ========================================================

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags TEXT,
  image TEXT,
  github TEXT,
  live TEXT,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index, id DESC);
