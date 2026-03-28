const db = require("../db");

async function listByProject(projectId) {
  const result = await db.query(
    `
      SELECT c.*, u.full_name AS author_name
      FROM comments c
      JOIN users u ON u.id = c.author_id
      WHERE c.project_id = $1
      ORDER BY c.created_at ASC
    `,
    [projectId]
  );
  return result.rows;
}

async function createComment({ projectId, authorId, body }) {
  const result = await db.query(
    `
      INSERT INTO comments (project_id, author_id, body)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [projectId, authorId, body]
  );
  return result.rows[0];
}

module.exports = {
  listByProject,
  createComment
};

