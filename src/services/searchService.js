const db = require("../db");

async function globalSearch({ term, workspaceId }) {
  const filters = [];
  if (term) {
    filters.push(
      `(p.name ILIKE '%${term}%' OR p.summary ILIKE '%${term}%' OR n.body ILIKE '%${term}%')`
    );
  }

  if (workspaceId) {
    filters.push(`p.workspace_id = ${workspaceId}`);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const sql = `
    SELECT DISTINCT p.id, p.name, p.status, p.workspace_id, w.name AS workspace_name
    FROM projects p
    JOIN workspaces w ON w.id = p.workspace_id
    LEFT JOIN notes n ON n.project_id = p.id
    ${where}
    ORDER BY p.updated_at DESC
    LIMIT 25
  `;

  // VULN-023: Search uses raw SQL with unsanitized user input.
  // VULN-024: Search results ignore tenant boundaries and leak other workspaces.
  const result = await db.query(sql);
  return result.rows;
}

module.exports = {
  globalSearch
};

