const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { newId } = require("../utils/crypto");
const didService = require("../services/didService");
const credentialService = require("../services/credentialService");
const auditService = require("../services/auditService");

const router = express.Router();
router.use(requireAuth, requireRole("university"));

function getInstitution(req) {
  return db.findOne("institutions", (i) => i.id === req.user.institutionId);
}

/**
 * Student initial-password rule:
 * - The first word entered in Full Name is treated as the surname/login name
 *   for this prototype's credential rule.
 * - It is uppercased.
 * - Date of birth is appended as DDMMYYYY.
 *
 * Example: John Doe + 12 August 2005 => JOHN12082005.
 */
function buildStudentInitialPassword(fullName, dateOfBirth) {
  const namePart = String(fullName || "").trim().split(/\s+/)[0].toUpperCase();
  if (!namePart || !dateOfBirth) return null;

  const match = String(dateOfBirth).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const [, year, month, day] = match;
  return `${namePart}${day}${month}${year}`;
}

// ---- Students ----
router.get("/students", (req, res) => {
  const institution = getInstitution(req);
  const students = db.find("students", (s) => s.institutionId === institution.id);
  const withCounts = students.map((s) => ({
    ...s,
    credentialCount: credentialService.getCredentialsForStudent(s.id).length
  }));
  res.json({ students: withCounts });
});

router.post("/students", (req, res) => {
  const institution = getInstitution(req);
  const { fullName, studentNumber, programme, department, faculty, email, dateOfBirth } = req.body;

  if (!fullName || !studentNumber || !programme || !email || !dateOfBirth) {
    return res.status(400).json({
      error: "Full name, student number, programme, email and date of birth are required"
    });
  }

  const initialPassword = buildStudentInitialPassword(fullName, dateOfBirth);
  if (!initialPassword) {
    return res.status(400).json({ error: "Date of birth must be supplied in YYYY-MM-DD format" });
  }

  const existingUser = db.findOne("users", (u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (existingUser) {
    return res.status(409).json({ error: "A user account already exists with this email address" });
  }

  const { did } = didService.generateDID("student");
  const studentId = newId("STU");

  const student = {
    id: studentId,
    userId: null,
    studentId: studentNumber,
    fullName,
    dateOfBirth,
    programme,
    department: department || "N/A",
    faculty: faculty || "N/A",
    did,
    institutionId: institution.id,
    status: "active",
    dateRegistered: new Date().toISOString()
  };
  db.insert("students", student);

  const passwordHash = bcrypt.hashSync(initialPassword, 10);
  const user = {
    id: newId("USR"),
    name: fullName,
    email,
    passwordHash,
    role: "student",
    studentRecordId: studentId,
    institutionId: institution.id,
    createdAt: new Date().toISOString()
  };
  db.insert("users", user);
  db.update("students", studentId, { userId: user.id });

  auditService.log({
    event: "Student Registered",
    userLabel: institution.name,
    reference: did,
    result: "success"
  });

  res.status(201).json({
    student,
    loginDetails: {
      email,
      temporaryPassword: initialPassword
    }
  });
});

router.get("/students/:id", (req, res) => {
  const student = db.findOne("students", (s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: "Student not found" });
  const credentials = credentialService.getCredentialsForStudent(student.id);
  res.json({ student, credentials });
});

// ---- Credentials ----
router.get("/credentials", (req, res) => {
  const institution = getInstitution(req);
  res.json({ credentials: credentialService.getCredentialsForIssuer(institution.id) });
});

router.post("/credentials/issue", async (req, res) => {
  try {
    const institution = getInstitution(req);
    const { studentRecordId, academic } = req.body;
    const student = db.findOne("students", (s) => s.id === studentRecordId);
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (!academic || !academic.qualification || !academic.credentialType) {
      return res.status(400).json({ error: "Academic information is incomplete" });
    }

    const credential = await credentialService.issueCredential({ student, institution, academic });
    res.status(201).json({ credential });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to issue credential" });
  }
});

router.post("/credentials/:credentialId/revoke", (req, res) => {
  const { reason } = req.body;
  const updated = credentialService.revokeCredential(req.params.credentialId, reason);
  if (!updated) return res.status(404).json({ error: "Credential not found" });
  res.json({ credential: updated });
});

// ---- Dashboard stats ----
router.get("/dashboard/stats", (req, res) => {
  const institution = getInstitution(req);
  const students = db.find("students", (s) => s.institutionId === institution.id);
  const credentials = credentialService.getCredentialsForIssuer(institution.id);
  const verificationLogs = db.get("verificationLogs").filter((v) => {
    const cred = credentials.find((c) => c.credentialId === v.credentialId);
    return !!cred;
  });

  res.json({
    totalStudents: students.length,
    credentialsIssued: credentials.length,
    activeCredentials: credentials.filter((c) => c.status === "active").length,
    revokedCredentials: credentials.filter((c) => c.status === "revoked").length,
    verificationRequests: verificationLogs.length,
    successfulVerifications: verificationLogs.filter((v) => v.finalResult === "VALID").length,
    failedVerifications: verificationLogs.filter((v) => v.finalResult !== "VALID").length,
    credentialsByMonth: buildMonthlySeries(credentials, "createdAt"),
    verificationsByOutcome: [
      { name: "Valid", value: verificationLogs.filter((v) => v.finalResult === "VALID").length },
      { name: "Invalid", value: verificationLogs.filter((v) => v.finalResult === "INVALID").length },
      { name: "Revoked", value: verificationLogs.filter((v) => v.finalResult === "REVOKED").length }
    ],
    credentialStatus: [
      { name: "Active", value: credentials.filter((c) => c.status === "active").length },
      { name: "Revoked", value: credentials.filter((c) => c.status === "revoked").length }
    ]
  });
});

function buildMonthlySeries(items, dateField) {
  const map = {};
  items.forEach((item) => {
    const d = new Date(item[dateField]);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, count]) => ({ month, count }));
}

// ---- Blockchain + audit (university view) ----
router.get("/blockchain", (req, res) => {
  const blockchainService = require("../services/blockchainService");
  res.json({
    network: blockchainService.NETWORK_LABEL,
    integrity: blockchainService.verifyChainIntegrity(),
    records: blockchainService.getAllRecords().slice().reverse()
  });
});

router.get("/audit-logs", (req, res) => {
  res.json({ logs: auditService.all() });
});

module.exports = router;
