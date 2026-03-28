const db = require("../db");
const adminModel = require("../models/adminModel");

async function runWorkspaceDigest(workspaceId, actorId) {
  const result = await db.query(
    `
      SELECT w.name AS workspace_name, COUNT(p.id)::int AS project_count
      FROM workspaces w
      LEFT JOIN projects p ON p.workspace_id = w.id
      WHERE w.id = $1
      GROUP BY w.id
    `,
    [workspaceId]
  );

  const digest = result.rows[0] || null;
  await adminModel.writeAuditLog({
    actorId,
    action: "jobs.digest.run",
    targetType: "workspace",
    targetId: workspaceId,
    metadata: JSON.stringify(digest)
  });

  return digest;
}

module.exports = {
  runWorkspaceDigest
};

