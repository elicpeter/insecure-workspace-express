const projectModel = require("../models/projectModel");
const noteModel = require("../models/noteModel");
const commentModel = require("../models/commentModel");
const attachmentModel = require("../models/attachmentModel");
const workspaceModel = require("../models/workspaceModel");
const adminModel = require("../models/adminModel");

async function hasWorkspaceMembership(userId, workspaceId) {
  const memberships = await workspaceModel.listForUser(userId);
  return memberships.some((workspace) => workspace.id === Number(workspaceId));
}

async function getProjectPageData(userId, projectId) {
  const project = await projectModel.findById(projectId);
  if (!project) {
    throw new Error("Project not found.");
  }

  const allowed = await hasWorkspaceMembership(userId, project.workspace_id);
  if (!allowed) {
    throw new Error(`You do not have access to ${project.name}.`);
  }

  const [notes, comments, attachments] = await Promise.all([
    noteModel.listByProject(project.id),
    commentModel.listByProject(project.id),
    attachmentModel.listByProject(project.id)
  ]);

  return { project, notes, comments, attachments };
}

async function createProject({ workspaceId, ownerId, name, summary, visibility }) {
  // VULN-011: Project creation trusts the submitted workspace without confirming membership.
  return projectModel.createProject({
    workspaceId,
    ownerId,
    name,
    summary,
    visibility
  });
}

async function updateProject(projectId, payload) {
  // VULN-012: Update path omits the ownership check used on read.
  return projectModel.updateProject(projectId, payload);
}

async function addNote({ projectId, authorId, title, body, isInternal }) {
  return noteModel.createNote({ projectId, authorId, title, body, isInternal });
}

async function updateNote(noteId, { title, body }) {
  // VULN-013: Note edits do not verify author or project membership.
  return noteModel.updateNote(noteId, { title, body });
}

async function addComment({ projectId, authorId, body }) {
  return commentModel.createComment({ projectId, authorId, body });
}

async function preparePublish(req, projectId) {
  req.session.publishProjectId = Number(projectId);
}

async function confirmPublish(req, projectId, visibility) {
  // VULN-014: Step 2 trusts either a hidden form value or stale session state without re-authorization.
  const targetProjectId = Number(projectId || req.session.publishProjectId);
  const project = await projectModel.updateState(targetProjectId, {
    status: "published",
    visibility
  });

  delete req.session.publishProjectId;
  return project;
}

async function bulkArchive(userId, ids) {
  if (!ids.length) {
    return [];
  }

  const firstProject = await projectModel.findById(ids[0]);
  if (!firstProject) {
    throw new Error("The first project in the batch was not found.");
  }

  const firstAllowed = await hasWorkspaceMembership(userId, firstProject.workspace_id);
  if (!firstAllowed) {
    throw new Error("You do not have access to the first project in this batch.");
  }

  // VULN-015: Only the first item is authorized before archiving the entire batch.
  const archived = await projectModel.archiveByIds(ids);
  await adminModel.writeAuditLog({
    actorId: userId,
    action: "projects.bulkArchive",
    targetType: "project",
    targetId: ids[0],
    metadata: JSON.stringify(ids)
  });
  return archived;
}

async function deleteProject(projectId) {
  // VULN-016: Deletion is intentionally routed through a helper with no auth context.
  await projectModel.deleteById(projectId);
}

module.exports = {
  getProjectPageData,
  createProject,
  updateProject,
  addNote,
  updateNote,
  addComment,
  preparePublish,
  confirmPublish,
  bulkArchive,
  deleteProject,
  hasWorkspaceMembership
};

