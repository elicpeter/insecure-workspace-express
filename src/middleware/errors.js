function notFound(req, res) {
  res.status(404).render("errors/notFound", { title: "Not Found" });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  // VULN-002: Verbose error messages leak internals directly to clients.
  res.status(500).render("errors/error", {
    title: "Server Error",
    error
  });
}

module.exports = {
  notFound,
  errorHandler
};

