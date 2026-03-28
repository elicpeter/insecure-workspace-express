jest.mock("../src/middleware/loadUser", () => (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.flash = null;
  next();
});

const app = require("../src/app");

describe("app smoke tests", () => {
  test("uses the expected view engine", () => {
    expect(app.get("view engine")).toBe("ejs");
  });

  test("registers the landing route", () => {
    const routes = app._router.stack
      .filter((layer) => layer.route)
      .map((layer) => layer.route.path);

    expect(routes).toContain("/");
  });
});
