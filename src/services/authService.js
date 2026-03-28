const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const { hashPassword, verifyPassword } = require("../utils/passwords");

async function register({ email, fullName, password }) {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  const user = await userModel.createUser({
    email,
    fullName,
    passwordHash: hashPassword(password)
  });

  await adminModel.writeAuditLog({
    actorId: user.id,
    action: "user.registered",
    targetType: "user",
    targetId: user.id,
    metadata: user.email
  });

  return user;
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new Error("Invalid email or password.");
  }

  return user;
}

async function startImpersonation(req, targetEmail) {
  const targetUser = await userModel.findByEmail(targetEmail);
  if (!targetUser) {
    throw new Error("No user matched that email.");
  }

  req.session.originalUser = req.session.user;
  // VULN-009: This admin capability flag survives impersonation and can outlive role changes.
  req.session.canManageUsers = req.session.user.role === "admin";
  req.session.user = {
    id: targetUser.id,
    email: targetUser.email,
    fullName: targetUser.full_name,
    role: targetUser.role
  };

  await adminModel.writeAuditLog({
    actorId: req.session.originalUser.id,
    action: "support.impersonate",
    targetType: "user",
    targetId: targetUser.id,
    metadata: targetUser.email
  });
}

function stopImpersonation(req) {
  if (req.session.originalUser) {
    req.session.user = req.session.originalUser;
    delete req.session.originalUser;
  }
}

module.exports = {
  register,
  login,
  startImpersonation,
  stopImpersonation
};

