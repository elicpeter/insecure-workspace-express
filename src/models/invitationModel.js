const db = require("../db");

async function createInvitation({
  workspaceId,
  email,
  token,
  invitedBy,
  requestedRole,
  expiresAt
}) {
  const result = await db.query(
    `
      INSERT INTO invitations (workspace_id, email, token, invited_by, requested_role, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [workspaceId, email, token, invitedBy, requestedRole, expiresAt]
  );

  return result.rows[0];
}

async function findByToken(token) {
  const result = await db.query("SELECT * FROM invitations WHERE token = $1", [token]);
  return result.rows[0] || null;
}

async function markAccepted(id) {
  const result = await db.query(
    "UPDATE invitations SET accepted = TRUE WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createInvitation,
  findByToken,
  markAccepted
};

