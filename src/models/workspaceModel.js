const db = require("../db");

async function createWorkspace({ name, slug, ownerId, billingEmail, isPrivate }) {
  const result = await db.query(
    `
      INSERT INTO workspaces (name, slug, owner_id, billing_email, private)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [name, slug, ownerId, billingEmail, isPrivate]
  );

  return result.rows[0];
}

async function addMembership({ workspaceId, userId, role, invitedBy, accepted = true }) {
  const result = await db.query(
    `
      INSERT INTO memberships (workspace_id, user_id, role, invited_by, accepted)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (workspace_id, user_id)
      DO UPDATE SET role = EXCLUDED.role, accepted = EXCLUDED.accepted
      RETURNING *
    `,
    [workspaceId, userId, role, invitedBy, accepted]
  );
  return result.rows[0];
}

async function listForUser(userId) {
  const result = await db.query(
    `
      SELECT w.*, m.role AS membership_role
      FROM workspaces w
      JOIN memberships m ON m.workspace_id = w.id
      WHERE m.user_id = $1
      ORDER BY w.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query("SELECT * FROM workspaces WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function listMembers(workspaceId) {
  const result = await db.query(
    `
      SELECT u.id, u.email, u.full_name, u.role, m.role AS membership_role
      FROM memberships m
      JOIN users u ON u.id = m.user_id
      WHERE m.workspace_id = $1
      ORDER BY u.full_name ASC
    `,
    [workspaceId]
  );
  return result.rows;
}

async function listInvitations(workspaceId) {
  const result = await db.query(
    "SELECT * FROM invitations WHERE workspace_id = $1 ORDER BY created_at DESC",
    [workspaceId]
  );
  return result.rows;
}

module.exports = {
  createWorkspace,
  addMembership,
  listForUser,
  findById,
  listMembers,
  listInvitations
};

