const express = require("express");
const { requireLogin } = require("../../middleware/auth");
const adminService = require("../../services/adminService");

const router = express.Router();

router.get("/debug/session", requireLogin, (req, res) => {
  res.json(adminService.buildDebugPayload(req));
});

module.exports = router;

