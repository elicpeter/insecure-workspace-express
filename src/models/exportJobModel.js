const db = require("../db");

async function createJob({ workspaceId, requestedBy, format, filter, outputPath, status }) {
  const result = await db.query(
    `
      INSERT INTO export_jobs (workspace_id, requested_by, format, filter, output_path, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [workspaceId, requestedBy, format, filter, outputPath, status]
  );
  return result.rows[0];
}

async function listByWorkspace(workspaceId) {
  const result = await db.query(
    `
      SELECT ej.*, u.full_name AS requested_by_name
      FROM export_jobs ej
      JOIN users u ON u.id = ej.requested_by
      WHERE ej.workspace_id = $1
      ORDER BY ej.created_at DESC
    `,
    [workspaceId]
  );
  return result.rows;
}

module.exports = {
  createJob,
  listByWorkspace
};

