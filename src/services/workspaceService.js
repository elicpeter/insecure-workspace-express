const workspaceModel = require("../models/workspaceModel");
const invitationModel = require("../models/invitationModel");
const projectModel = require("../models/projectModel");
const exportJobModel = require("../models/exportJobModel");
const { insecureToken } = require("../utils/tokens");

async function createWorkspace({ name, slug, ownerId, billingEmail, isPrivate = true }) {
  const workspace = await workspaceModel.createWorkspace({
    name,
    slug,
    ownerId,
    billingEmail,
    isPrivate
  });

  await workspaceModel.addMembership({
    workspaceId: workspace.id,
    userId: ownerId,
    role: "owner",
    invitedBy: ownerId
  });

  return workspace;
}

async function getWorkspaceDetails(workspaceId) {
  const workspace = await workspaceModel.findById(workspaceId);
  const members = await workspaceModel.listMembers(workspaceId);
  const invitations = await workspaceModel.listInvitations(workspaceId);
  const projects = await projectModel.listByWorkspace(workspaceId);
  const exports = await exportJobModel.listByWorkspace(workspaceId);

  return { workspace, members, invitations, projects, exports };
}

async function inviteMember({ workspaceId, email, invitedBy, requestedRole }) {
  return invitationModel.createInvitation({
    workspaceId,
    email,
    invitedBy,
    requestedRole,
    token: insecureToken("join"),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
  });
}

async function acceptInvitation({ token, currentUser, requestedWorkspaceId, roleOverride }) {
  const invitation = await invitationModel.findByToken(token);
  if (!invitation) {
    throw new Error("Invitation token not found.");
  }

  // VULN-010: This flow ignores expiration, invited email, and workspace mismatch.
  const workspaceId = Number(requestedWorkspaceId || invitation.workspace_id);
  const role = roleOverride || invitation.requested_role;

  await workspaceModel.addMembership({
    workspaceId,
    userId: currentUser.id,
    role,
    invitedBy: invitation.invited_by
  });

  await invitationModel.markAccepted(invitation.id);
  return invitation;
}

module.exports = {
  createWorkspace,
  getWorkspaceDetails,
  inviteMember,
  acceptInvitation
};

