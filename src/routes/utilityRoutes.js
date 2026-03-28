const express = require("express");
const { requireLogin } = require("../middleware/auth");
const fileService = require("../services/fileService");
const previewService = require("../services/previewService");
const { safeRedirect } = require("../utils/safeRedirect");

const router = express.Router();

router.get("/attachments/:id/download", requireLogin, async (req, res, next) => {
  try {
    const { attachment, resolvedPath } = await fileService.resolveDownload(
      req.params.id,
      req.query.path
    );
    res.download(resolvedPath, attachment.original_name);
  } catch (error) {
    next(error);
  }
});

router.get("/utilities/link-preview", requireLogin, async (req, res, next) => {
  try {
    const preview = req.query.url
      ? await previewService.fetchPreview(req.query.url)
      : null;
    res.render("utilities/preview", {
      title: "Link Preview",
      targetUrl: req.query.url || "",
      preview
    });
  } catch (error) {
    next(error);
  }
});

router.get("/go", requireLogin, (req, res) => {
  // VULN-029: Direct redirect endpoint accepts arbitrary destinations.
  res.redirect(safeRedirect(req.query.next, "/dashboard"));
});

module.exports = router;

