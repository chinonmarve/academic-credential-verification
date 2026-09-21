const express = require("express");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const credentialService = require("../services/credentialService");
const presentationService = require("../services/presentationService");

const router = express.Router();
router.use(requireAuth, requireRole("student"));

function getStudentRecord(req) {
  return db.findOne("students", (s) => s.userId === req.user.id);
}

function sanitize(credential) {
  // Never send raw salts/commitments to the wallet UI wholesale - only
  // human-readable field values plus verification metadata.
  const fields = {};
  Object.entries(credential.committedFields).forEach(([k, v]) => {
    fields[k] = v.value;
  });
  return {
    credentialId: credential.credentialId,
    qualification: credential.qualification,
    credentialType: credential.credentialType,
    issueDate: credential.issueDate,
    graduationDate: credential.graduationDate,
    status: credential.status,
    issuerDid: credential.issuerDid,
    studentDid: credential.studentDid,
    credentialHash: credential.credentialHash,
    blockchainReference: credential.blockchainReference,
    blockNumber: credential.blockNumber,
    qrDataUrl: credential.qrDataUrl,
    fields,
    revokedAt: credential.revokedAt
  };
}

router.get("/wallet", (req, res) => {
  const student = getStudentRecord(req);
  if (!student) return res.status(404).json({ error: "Student record not found" });
  const credentials = credentialService.getCredentialsForStudent(student.id).map(sanitize);
  res.json({ student, credentials });
});

router.get("/wallet/:credentialId", (req, res) => {
  const credential = credentialService.getByCredentialId(req.params.credentialId);
  if (!credential) return res.status(404).json({ error: "Credential not found" });
  res.json({ credential: sanitize(credential) });
});

router.post("/wallet/:credentialId/present", async (req, res) => {
  const student = getStudentRecord(req);
  const credential = credentialService.getByCredentialId(req.params.credentialId);
  if (!credential) return res.status(404).json({ error: "Credential not found" });
  const { disclosedAttributes } = req.body;
  if (!Array.isArray(disclosedAttributes) || disclosedAttributes.length === 0) {
    return res.status(400).json({ error: "Select at least one attribute to disclose" });
  }

  const presentation = await presentationService.createPresentation({
    credentialId: credential.credentialId,
    studentId: student.id,
    disclosedAttributes
  });
  res.status(201).json({ presentation });
});

router.get("/dashboard/stats", (req, res) => {
  const student = getStudentRecord(req);
  const credentials = credentialService.getCredentialsForStudent(student.id);
  const verificationLogs = db
    .get("verificationLogs")
    .filter((v) => credentials.some((c) => c.credentialId === v.credentialId));

  res.json({
    credentialsHeld: credentials.length,
    activeCredentials: credentials.filter((c) => c.status === "active").length,
    credentialsPresented: db.get("presentations").filter((p) => p.studentId === student.id).length,
    verificationActivity: verificationLogs.length
  });
});

module.exports = router;
