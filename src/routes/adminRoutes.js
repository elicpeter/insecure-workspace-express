const express = require("express");
const { requireLogin, requireAdmin } = require("../middleware/auth");
const adminService = require("../services/adminService");

const router = express.Router();

router.get("/admin", requireAdmin, async (req, res, next) => {
  try {
    const data = await adminService.getDashboardData();
    res.render("admin/index", {
      title: "Admin",
      ...data
    });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/users/:id/role", requireLogin, async (req, res, next) => {
  try {
    // VULN-028: Role assignment is protected in the UI but the backend only checks for login.
    await adminService.updateUserRole(
      req.session.user.id,
      Number(req.params.id),
      req.body.role
    );
    res.redirect("/admin");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

