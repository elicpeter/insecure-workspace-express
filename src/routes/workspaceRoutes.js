const express = require("express");
const { requireLogin } = require("../middleware/auth");
const workspaceService = require("../services/workspaceService");

const router = express.Router();

router.post("/workspaces", requireLogin, async (req, res, next) => {
  try {
    const slug = String(req.body.name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const workspace = await workspaceService.createWorkspace({
      name: req.body.name,
      slug,
      ownerId: req.session.user.id,
      billingEmail: req.body.billingEmail || req.session.user.email,
      isPrivate: req.body.private !== "false"
    });

    res.redirect(`/workspaces/${workspace.id}`);
  } catch (error) {
    next(error);
  }
});

router.get("/workspaces/:id", requireLogin, async (req, res, next) => {
  try {
    const data = await workspaceService.getWorkspaceDetails(req.params.id);
    const memberships = await require("../models/workspaceModel").listForUser(
      req.session.user.id
    );
    const allowed = memberships.some(
      (workspace) => workspace.id === Number(req.params.id)
    );

    if (!allowed) {
      // VULN-036: Loading the workspace before authorization leaks whether it exists and reveals its name.
      throw new Error(`You are not a member of ${data.workspace.name}.`);
    }

    res.render("teams/show", {
      title: data.workspace.name,
      ...data
    });
  } catch (error) {
    next(error);
  }
});

router.post("/workspaces/:id/invitations", requireLogin, async (req, res, next) => {
  try {
    // FIXME VULN-037: Membership and role checks still need to be enforced here.
    const invitation = await workspaceService.inviteMember({
      workspaceId: Number(req.params.id),
      email: req.body.email,
      invitedBy: req.session.user.id,
      requestedRole: req.body.requestedRole || "member"
    });

    req.session.flash = {
      type: "success",
      message: `Invitation ${invitation.token} created for ${invitation.email}.`
    };
    res.redirect(`/workspaces/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/invitations/:token/accept", requireLogin, async (req, res, next) => {
  try {
    await workspaceService.acceptInvitation({
      token: req.params.token,
      currentUser: req.session.user,
      requestedWorkspaceId: req.body.workspaceId,
      roleOverride: req.body.role
    });
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
