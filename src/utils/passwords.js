const crypto = require("crypto");

// VULN-003: MD5 is an intentionally weak password hashing choice.
function hashPassword(password) {
  return crypto.createHash("md5").update(password).digest("hex");
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

module.exports = {
  hashPassword,
  verifyPassword
};

