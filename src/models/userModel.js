const db = require("../db");

async function createUser({ email, fullName, passwordHash, role = "user" }) {
  const result = await db.query(
    `
      INSERT INTO users (email, full_name, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [email, fullName, passwordHash, role]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function listAll() {
  const result = await db.query(
    "SELECT id, email, full_name, role, created_at FROM users ORDER BY created_at DESC"
  );
  return result.rows;
}

async function updateProfile(id, { bio, signatureHtml, themeConfig }) {
  const result = await db.query(
    `
      UPDATE users
      SET bio = $2, signature_html = $3, theme_config = $4
      WHERE id = $1
      RETURNING *
    `,
    [id, bio, signatureHtml, themeConfig]
  );

  return result.rows[0];
}

async function updateRole(id, role) {
  const result = await db.query(
    "UPDATE users SET role = $2 WHERE id = $1 RETURNING *",
    [id, role]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listAll,
  updateProfile,
  updateRole
};

