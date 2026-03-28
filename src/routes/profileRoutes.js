const express = require("express");
const { requireLogin } = require("../middleware/auth");
const userModel = require("../models/userModel");

const router = express.Router();

router.get("/profile", requireLogin, async (req, res, next) => {
  try {
    const user = await userModel.findById(req.session.user.id);
    res.render("profile/show", {
      title: "Profile",
      user
    });
  } catch (error) {
    next(error);
  }
});

router.post("/profile", requireLogin, async (req, res, next) => {
  try {
    await userModel.updateProfile(req.session.user.id, {
      bio: req.body.bio,
      signatureHtml: req.body.signatureHtml,
      themeConfig: req.body.themeConfig
    });
    res.redirect("/profile");
  } catch (error) {
    next(error);
  }
});

module.exports = router;

