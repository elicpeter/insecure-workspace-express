const express = require("express");
const { requireLogin } = require("../middleware/auth");
const workspaceModel = require("../models/workspaceModel");
const searchService = require("../services/searchService");

const router = express.Router();

router.get("/dashboard", requireLogin, async (req, res, next) => {
  try {
    const workspaces = await workspaceModel.listForUser(req.session.user.id);
    res.render("dashboard/index", {
      title: "Dashboard",
      workspaces
    });
  } catch (error) {
    next(error);
  }
});

router.get("/search", requireLogin, async (req, res, next) => {
  try {
    const results = req.query.q
      ? await searchService.globalSearch({
          term: req.query.q,
          workspaceId: req.query.workspaceId
        })
      : [];

    res.render("search", {
      title: "Search",
      query: req.query.q || "",
      workspaceId: req.query.workspaceId || "",
      results
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

