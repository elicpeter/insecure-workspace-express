const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");

async function getDashboardData() {
  const [stats, users, logs] = await Promise.all([
    adminModel.getStats(),
    userModel.listAll(),
    adminModel.recentAuditLogs()
  ]);

  return { stats, users, logs };
}

async function updateUserRole(actorId, userId, role) {
  const user = await userModel.updateRole(userId, role);
  await adminModel.writeAuditLog({
    actorId,
    action: "admin.roleChanged",
    targetType: "user",
    targetId: userId,
    metadata: role
  });
  return user;
}

function buildDebugPayload(req) {
  // VULN-025: Debug payload leaks full session and selected environment details.
  return {
    session: req.session,
    env: {
      databaseUrl: process.env.DATABASE_URL,
      sessionSecret: process.env.SESSION_SECRET
    }
  };
}

module.exports = {
  getDashboardData,
  updateUserRole,
  buildDebugPayload
};

