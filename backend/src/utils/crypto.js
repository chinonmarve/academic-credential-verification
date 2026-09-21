const crypto = require("crypto");

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function hmacSha256(secret, input) {
  return crypto.createHmac("sha256", secret).update(input).digest("hex");
}

function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${randomHex(4)}`.toUpperCase();
}

module.exports = { sha256, hmacSha256, randomHex, newId };
