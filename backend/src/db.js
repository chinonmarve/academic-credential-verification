/**
 * db.js
 * ---------------------------------------------------------------------------
 * The research architecture (Section 17/18) specifies MongoDB Atlas for
 * operational data. To keep this prototype runnable with zero external
 * services, we use a lightweight embedded JSON document store that mimics
 * MongoDB-style collections (arrays of documents with an `id`).
 *
 * The rest of the codebase (services/, routes/) only talks to this module,
 * so swapping this file for a real Mongoose/MongoDB Atlas connection later
 * does not require touching business logic elsewhere.
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
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { ...DEFAULT_DATA };
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// In-memory cache, persisted to disk on every write (fine for prototype scale)
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
