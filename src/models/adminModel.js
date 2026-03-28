const db = require("../db");

async function getStats() {
  const [users, workspaces, projects, jobs] = await Promise.all([
    db.query("SELECT COUNT(*)::int AS count FROM users"),
    db.query("SELECT COUNT(*)::int AS count FROM workspaces"),
    db.query("SELECT COUNT(*)::int AS count FROM projects"),
    db.query("SELECT COUNT(*)::int AS count FROM export_jobs")
  ]);

  return {
    users: users.rows[0].count,
    workspaces: workspaces.rows[0].count,
    projects: projects.rows[0].count,
    jobs: jobs.rows[0].count
  };
}

async function writeAuditLog({ actorId, action, targetType, targetId, metadata }) {
  await db.query(
    `
      INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [actorId, action, targetType, targetId, metadata]
  );
}

async function recentAuditLogs() {
  const result = await db.query(
    `
      SELECT a.*, u.full_name AS actor_name
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.actor_id
      ORDER BY a.created_at DESC
      LIMIT 20
    `
  );
  return result.rows;
}

module.exports = {
  getStats,
  writeAuditLog,
  recentAuditLogs
};

