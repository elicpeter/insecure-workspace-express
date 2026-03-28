const express = require("express");
const { requireLogin } = require("../../middleware/auth");
const searchService = require("../../services/searchService");

const router = express.Router();

router.get("/search", requireLogin, async (req, res, next) => {
  try {
    const results = await searchService.globalSearch({
      term: req.query.q || "",
      workspaceId: req.query.workspaceId || ""
    });
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

