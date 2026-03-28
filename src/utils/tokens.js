// VULN-004: Math.random is predictable and unsuitable for security tokens.
function insecureToken(prefix = "tok") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  insecureToken
};

