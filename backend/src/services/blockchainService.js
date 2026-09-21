const db = require("../db");
const { sha256, randomHex } = require("../utils/crypto");

const NETWORK_LABEL = process.env.BLOCKCHAIN_NETWORK_LABEL || "Simulated Ethereum-Compatible Network";

/**
 * BlockchainService
 * ---------------------------------------------------------------------------
 * Simulates a smart-contract "credential registry" on an Ethereum-compatible
 * chain (as the research scope explicitly limits itself to a simulated
 * network - Section 1.5 / 26). Each record is chained to the previous
 * block's hash so tampering with history is detectable, mirroring real
 * blockchain immutability at a conceptual level. No real blockchain node
 * is contacted; everything happens in the local data store.
 * ---------------------------------------------------------------------------
 */
function getLastBlock() {
  const blocks = db.get("blockchainRecords");
  return blocks.length ? blocks[blocks.length - 1] : null;
}

function recordHash(credentialId, credentialHash, eventType = "ISSUANCE") {
  const last = getLastBlock();
  const blockNumber = last ? last.blockNumber + 1 : 1000001;
  const prevBlockHash = last ? last.blockHash : "0x0".padEnd(66, "0");
  const txHash = `0x${randomHex(32)}`;
  const blockHash = `0x${sha256(`${prevBlockHash}|${credentialHash}|${txHash}|${blockNumber}`)}`;

  const record = {
    id: `BLK-${blockNumber}`,
    credentialId,
    credentialHash,
    eventType, // ISSUANCE | REVOCATION
    transactionHash: txHash,
    blockNumber,
    blockHash,
    prevBlockHash,
    network: NETWORK_LABEL,
    status: "confirmed",
    timestamp: new Date().toISOString()
  };
  db.insert("blockchainRecords", record);
  return record;
}

function getRecordsForCredential(credentialId) {
  return db.find("blockchainRecords", (r) => r.credentialId === credentialId);
}

function getLatestHashForCredential(credentialId) {
  const records = getRecordsForCredential(credentialId);
  if (!records.length) return null;
  return records[records.length - 1];
}

function getAllRecords() {
  return db.get("blockchainRecords");
}

/** Verifies the chain's internal integrity (each block links to the previous one). */
function verifyChainIntegrity() {
  const blocks = db.get("blockchainRecords");
  for (let i = 0; i < blocks.length; i++) {
    const expectedPrev = i === 0 ? "0x0".padEnd(66, "0") : blocks[i - 1].blockHash;
    if (blocks[i].prevBlockHash !== expectedPrev) {
      return { valid: false, brokenAt: blocks[i].id };
    }
  }
  return { valid: true };
}

module.exports = {
  NETWORK_LABEL,
  recordHash,
  getRecordsForCredential,
  getLatestHashForCredential,
  getAllRecords,
  verifyChainIntegrity
};
