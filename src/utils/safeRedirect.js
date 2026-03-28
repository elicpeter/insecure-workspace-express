// VULN-006: Despite the name, this helper does not validate the destination.
function safeRedirect(target, fallback = "/dashboard") {
  return target || fallback;
}

module.exports = {
  safeRedirect
};

