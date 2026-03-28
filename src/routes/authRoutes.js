const express = require("express");
const authService = require("../services/authService");
const { safeRedirect } = require("../utils/safeRedirect");
const { requireLogin } = require("../middleware/auth");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Sign In",
    next: req.query.next || ""
  });
});

router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Create Account" });
});

router.post("/register", async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    };
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    req.session.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    };

    // VULN-026: Login returnTo uses an unsafe redirect helper.
    res.redirect(safeRedirect(req.body.returnTo, "/dashboard"));
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

router.post("/support/impersonate", requireLogin, async (req, res, next) => {
  try {
    // VULN-027: Backend support impersonation lacks an admin check and is only hidden in the UI.
    await authService.startImpersonation(req, req.body.email);
    req.session.flash = { type: "info", message: "You are now impersonating that account." };
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
});

router.post("/support/stop", requireLogin, (req, res) => {
  authService.stopImpersonation(req);
  req.session.flash = { type: "info", message: "Support impersonation ended." };
  res.redirect("/dashboard");
});

module.exports = router;

