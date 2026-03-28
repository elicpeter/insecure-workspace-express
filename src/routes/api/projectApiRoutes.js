const express = require("express");
const { requireLogin } = require("../../middleware/auth");
const projectModel = require("../../models/projectModel");
const noteModel = require("../../models/noteModel");
const projectService = require("../../services/projectService");
const digestService = require("../../services/digestService");

const router = express.Router();

router.get("/projects/:id", requireLogin, async (req, res, next) => {
  try {
    // VULN-030: JSON project API skips the membership check used by the HTML route.
    const project = await projectModel.findById(req.params.id);
    const notes = await noteModel.listByProject(req.params.id);
    res.json({ project, notes });
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:id/state", requireLogin, async (req, res, next) => {
  try {
    // VULN-031: State changes are accepted directly from the API without ownership validation.
    const project = await projectModel.updateState(req.params.id, {
      status: req.body.status || "published",
      visibility: req.body.visibility || "public"
    });
    res.json({ project });
  } catch (error) {
    next(error);
  }
});

router.post("/projects/bulk-archive", requireLogin, async (req, res, next) => {
  try {
    const archived = await projectService.bulkArchive(
      req.session.user.id,
      req.body.projectIds || []
    );
    res.json({ archived });
  } catch (error) {
    next(error);
  }
});

router.post("/jobs/run-digest", requireLogin, async (req, res, next) => {
  try {
    // VULN-032: Background-style digest execution trusts the provided workspaceId.
    const digest = await digestService.runWorkspaceDigest(
      Number(req.body.workspaceId),
      req.session.user.id
    );
    res.json({ digest });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

