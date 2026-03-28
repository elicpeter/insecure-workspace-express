const express = require("express");
const { requireLogin } = require("../middleware/auth");
const reportService = require("../services/reportService");

const router = express.Router();

router.get("/reports", requireLogin, (req, res) => {
  res.render("reports/index", {
    title: "Exports"
  });
});

router.post("/reports/export", requireLogin, async (req, res, next) => {
  try {
    const job = await reportService.exportWorkspace({
      workspaceId: Number(req.body.workspaceId),
      requestedBy: req.session.user.id,
      format: req.body.format,
      filter: req.body.filter,
      fileName: req.body.fileName
    });

    req.session.flash = {
      type: "success",
      message: `Export ${job.id} created at ${job.output_path}.`
    };
    res.redirect(`/workspaces/${req.body.workspaceId}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

