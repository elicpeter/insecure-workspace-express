const db = require("../db");

async function listByProject(projectId) {
  const result = await db.query(
    `
      SELECT n.*, u.full_name AS author_name, u.signature_html
      FROM notes n
      JOIN users u ON u.id = n.author_id
      WHERE n.project_id = $1
      ORDER BY n.created_at ASC
    `,
    [projectId]
  );
  return result.rows;
}

async function createNote({ projectId, authorId, title, body, isInternal }) {
  const result = await db.query(
    `
      INSERT INTO notes (project_id, author_id, title, body, is_internal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [projectId, authorId, title, body, isInternal]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await db.query("SELECT * FROM notes WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function updateNote(id, { title, body }) {
  const result = await db.query(
    `
      UPDATE notes
      SET title = $2, body = $3
      WHERE id = $1
      RETURNING *
    `,
    [id, title, body]
  );
  return result.rows[0];
}

module.exports = {
  listByProject,
  createNote,
  findById,
  updateNote
};

