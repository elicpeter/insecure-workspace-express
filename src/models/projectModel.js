const db = require("../db");

async function createProject({ workspaceId, ownerId, name, summary, visibility }) {
  const result = await db.query(
    `
      INSERT INTO projects (workspace_id, owner_id, name, summary, visibility)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [workspaceId, ownerId, name, summary, visibility]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT p.*, w.name AS workspace_name, w.slug AS workspace_slug
      FROM projects p
      JOIN workspaces w ON w.id = p.workspace_id
      WHERE p.id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
}

async function listByWorkspace(workspaceId) {
  const result = await db.query(
    `
      SELECT p.*, u.full_name AS owner_name
      FROM projects p
      JOIN users u ON u.id = p.owner_id
      WHERE p.workspace_id = $1
      ORDER BY p.updated_at DESC
    `,
    [workspaceId]
  );

  return result.rows;
}

async function updateProject(id, { name, summary, visibility }) {
  const result = await db.query(
    `
      UPDATE projects
      SET name = $2, summary = $3, visibility = $4, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, name, summary, visibility]
  );

  return result.rows[0];
}

async function updateState(id, { status, visibility }) {
  const result = await db.query(
    `
      UPDATE projects
      SET status = $2, visibility = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, status, visibility]
  );
  return result.rows[0];
}

async function archiveByIds(ids) {
  const result = await db.query(
    `
      UPDATE projects
      SET status = 'archived', updated_at = NOW()
      WHERE id = ANY($1::int[])
      RETURNING *
    `,
    [ids]
  );

  return result.rows;
}

async function deleteById(id) {
  await db.query("DELETE FROM projects WHERE id = $1", [id]);
}

module.exports = {
  createProject,
  findById,
  listByWorkspace,
  updateProject,
  updateState,
  archiveByIds,
  deleteById
};

