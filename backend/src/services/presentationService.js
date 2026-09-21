const db = require("../db");
const { newId } = require("../utils/crypto");
const qrService = require("./qrService");
const auditService = require("./auditService");

const EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Student selects which attributes to disclose and generates a
 * "Privacy-Preserving Proof" presentation. This mirrors Section 9 of the
 * spec: the resulting QR encodes only a presentationId (never raw data);
 * the verifier resolves it server-side against the selective-disclosure
 * commitment scheme in zkpService.
 */
async function createPresentation({ credentialId, studentId, disclosedAttributes }) {
  const credential = db.findOne("credentials", (c) => c.credentialId === credentialId);
  if (!credential) throw new Error("Credential not found");
  const allowed = new Set(Object.keys(credential.committedFields || {}));
  const safeAttributes = [...new Set(disclosedAttributes)].filter((a) => allowed.has(a));
  if (safeAttributes.length === 0) throw new Error("Select at least one valid attribute to disclose");
  const presentationId = newId("PRES");
  const presentation = {
    id: presentationId,
    presentationId,
    credentialId,
    studentId,
    disclosedAttributes: safeAttributes,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + EXPIRY_MS).toISOString(),
    used: false
  };
  db.insert("presentations", presentation);
  const qrDataUrl = await qrService.generateQRDataUrl(presentationId);

  auditService.log({
    event: "Credential Presented",
    userLabel: studentId,
    credentialId,
    result: "success",
    reference: presentationId
  });

  return { ...presentation, qrDataUrl };
}

function getPresentation(presentationId) {
  return db.findOne("presentations", (p) => p.presentationId === presentationId);
}

module.exports = { createPresentation, getPresentation };
