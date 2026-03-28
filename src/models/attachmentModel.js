const db = require("../db");

async function createAttachment({
  projectId,
  uploaderId,
  originalName,
  storedName,
  storagePath
}) {
  const result = await db.query(
    `
      INSERT INTO attachments (project_id, uploader_id, original_name, stored_name, storage_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [projectId, uploaderId, originalName, storedName, storagePath]
  );
  return result.rows[0];
}

async function listByProject(projectId) {
  const result = await db.query(
    `
      SELECT a.*, u.full_name AS uploader_name
      FROM attachments a
      JOIN users u ON u.id = a.uploader_id
      WHERE a.project_id = $1
      ORDER BY a.created_at DESC
    `,
    [projectId]
  );
  return result.rows;
}

async function findById(id) {
  const result = await db.query("SELECT * FROM attachments WHERE id = $1", [id]);
  return result.rows[0] || null;
}

module.exports = {
  createAttachment,
  listByProject,
  findById
};

