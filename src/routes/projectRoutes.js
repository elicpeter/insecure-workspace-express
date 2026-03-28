const express = require("express");
const multer = require("multer");
const { requireLogin } = require("../middleware/auth");
const projectService = require("../services/projectService");
const fileService = require("../services/fileService");
const { renderUserMarkdown } = require("../utils/markdown");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/projects", requireLogin, async (req, res, next) => {
  try {
    const project = await projectService.createProject({
      workspaceId: Number(req.body.workspaceId),
      ownerId: req.session.user.id,
      name: req.body.name,
      summary: req.body.summary,
      visibility: req.body.visibility || "private"
    });
    res.redirect(`/projects/${project.id}`);
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:id", requireLogin, async (req, res, next) => {
  try {
    const data = await projectService.getProjectPageData(
      req.session.user.id,
      req.params.id
    );

    res.render("projects/show", {
      title: data.project.name,
      ...data,
      renderUserMarkdown
    });
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:id/update", requireLogin, async (req, res, next) => {
  try {
    await projectService.updateProject(req.params.id, {
      name: req.body.name,
      summary: req.body.summary,
      visibility: req.body.visibility || "private"
    });
    res.redirect(`/projects/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:id/notes", requireLogin, async (req, res, next) => {
  try {
    await projectService.addNote({
      projectId: Number(req.params.id),
      authorId: req.session.user.id,
      title: req.body.title,
      body: req.body.body,
      isInternal: req.body.isInternal === "on"
    });
    res.redirect(`/projects/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/notes/:id/edit", requireLogin, async (req, res, next) => {
  try {
    const note = await projectService.updateNote(req.params.id, {
      title: req.body.title,
      body: req.body.body
    });
    res.redirect(`/projects/${note.project_id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:id/comments", requireLogin, async (req, res, next) => {
  try {
    await projectService.addComment({
      projectId: Number(req.params.id),
      authorId: req.session.user.id,
      body: req.body.body
    });
    res.redirect(`/projects/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/projects/:id/attachments",
  requireLogin,
  upload.single("attachment"),
  async (req, res, next) => {
    try {
      if (req.file) {
        await fileService.saveUpload(req.file, Number(req.params.id), req.session.user.id);
      }
      res.redirect(`/projects/${req.params.id}`);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/projects/:id/publish-review", requireLogin, async (req, res, next) => {
  try {
    await projectService.preparePublish(req, req.params.id);
    res.render("projects/publish", {
      title: "Publish Project",
      projectId: req.params.id
    });
  } catch (error) {
    next(error);
  }
});

router.post("/projects/publish-confirm", requireLogin, async (req, res, next) => {
  try {
    const project = await projectService.confirmPublish(
      req,
      req.body.projectId,
      req.body.visibility || "public"
    );
    res.redirect(`/projects/${project.id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:id/delete", requireLogin, async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

