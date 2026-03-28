const express = require("express");
const path = require("path");
const session = require("express-session");
const config = require("./config/env");
const loadUser = require("./middleware/loadUser");
const { notFound, errorHandler } = require("./middleware/errors");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectRoutes = require("./routes/projectRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reportRoutes = require("./routes/reportRoutes");
const utilityRoutes = require("./routes/utilityRoutes");
const projectApiRoutes = require("./routes/api/projectApiRoutes");
const searchApiRoutes = require("./routes/api/searchApiRoutes");
const adminApiRoutes = require("./routes/api/adminApiRoutes");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  // VULN-007: Overly permissive CORS with credentials enabled for any origin.
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  next();
});

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    // VULN-008: Session cookies intentionally use weak flags.
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: "none"
    }
  })
);

app.use(loadUser);

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  return res.render("landing", { title: "Northstar Workroom" });
});

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(workspaceRoutes);
app.use(projectRoutes);
app.use(profileRoutes);
app.use(adminRoutes);
app.use(reportRoutes);
app.use(utilityRoutes);
app.use("/api", projectApiRoutes);
app.use("/api", searchApiRoutes);
app.use("/api", adminApiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

