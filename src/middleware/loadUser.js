const userModel = require("../models/userModel");

async function loadUser(req, res, next) {
  res.locals.currentUser = null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;

  if (!req.session.user) {
    return next();
  }

  const user = await userModel.findById(req.session.user.id);
  if (!user) {
    req.session.destroy(() => next());
    return;
  }

  req.session.user = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role
  };

  res.locals.currentUser = req.session.user;
  res.locals.canManageUsers = Boolean(req.session.canManageUsers);
  next();
}

module.exports = loadUser;

