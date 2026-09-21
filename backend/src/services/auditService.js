const db = require("../db");
const { newId } = require("../utils/crypto");

function log({ event, userLabel, credentialId = null, result = "info", reference = null }) {
  const entry = {
    id: newId("AUD"),
    event,
    userLabel,
    credentialId,
    result,
    reference,
    timestamp: new Date().toISOString()
  };
  db.insert("auditLogs", entry);
  return entry;
}

function all() {
  return db.get("auditLogs").slice().reverse();
}

module.exports = { log, all };
