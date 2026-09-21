/**
 * db.js
 * ---------------------------------------------------------------------------
 * Prototype data store.
 *
 * The research architecture specifies MongoDB Atlas for operational data.
 * This prototype keeps its seeded data in JSON so it can run without an
 * external database. Vercel serverless functions have a read-only deployment
 * filesystem, so writes are kept in memory when disk persistence is unavailable.
 * This preserves the prototype workflow while avoiding 500 errors in deployment.
 * ---------------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "db.json");

const DEFAULT_DATA = {
  users: [],
  institutions: [],
  students: [],
  credentials: [],
  verificationLogs: [],
  blockchainRecords: [],
  auditLogs: [],
  presentations: []
};

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return { ...DEFAULT_DATA };
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Database load error:", e.message);
    return { ...DEFAULT_DATA };
  }
}

function save(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    // Vercel deployments use a read-only filesystem. Keep the updated
    // prototype state in memory rather than turning a successful operation
    // into a 500 response.
    console.warn("Database disk persistence unavailable:", e.message);
    return false;
  }
}

let cache = load();

const db = {
  get(collection) {
    return cache[collection] || [];
  },

  insert(collection, doc) {
    if (!cache[collection]) cache[collection] = [];
    cache[collection].push(doc);
    save(cache);
    return doc;
  },

  update(collection, id, patch) {
    const arr = cache[collection] || [];
    const idx = arr.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    arr[idx] = { ...arr[idx], ...patch };
    save(cache);
    return arr[idx];
  },

  findOne(collection, predicate) {
    return (cache[collection] || []).find(predicate) || null;
  },

  find(collection, predicate) {
    return (cache[collection] || []).filter(predicate || (() => true));
  },

  reset() {
    cache = { ...DEFAULT_DATA };
    save(cache);
  }
};

module.exports = db;
