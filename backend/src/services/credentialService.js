const db = require("../db");
const { newId } = require("../utils/crypto");
const signatureService = require("./signatureService");
const blockchainService = require("./blockchainService");
const zkpService = require("./zkpService");
const qrService = require("./qrService");
const auditService = require("./auditService");

/**
 * Issues a Verifiable Credential.
 * Steps mirror Section 19 of the spec:
 *  1. Build the credential attribute set
 *  2. Commit each attribute (salted hash) - enables later selective disclosure
 *  3. Compute the aggregate credential hash
 *  4. Sign the aggregate hash with the issuer's (simulated) key
 *  5. Anchor the hash on the simulated blockchain via the smart-contract layer
 *  6. Generate a QR code encoding only the credential reference
 *  7. Persist the full credential inside the student's DID wallet (off-chain)
 */
async function issueCredential({ student, institution, academic }) {
  const credentialId = newId("CRED");

  const issueDate = new Date().toISOString();
  const fields = {
    studentName: student.fullName,
    studentIdNumber: student.studentId,
    studentDid: student.did,
    institution: institution.name,
    faculty: academic.faculty,
    department: academic.department,
    programme: academic.programme,
    qualification: academic.qualification,
    credentialType: academic.credentialType,
    graduationDate: academic.graduationDate,
    graduationYear: academic.graduationDate ? new Date(`${academic.graduationDate}T00:00:00`).getFullYear() : "",
    issuanceDate: issueDate,
    gpa: academic.gpa || "N/A",
    dateOfBirth: academic.dateOfBirth || "N/A",
    graduationStatus: "Graduated",
    vcName: institution.vcName || "The Vice-Chancellor",
    registrarName: institution.registrarName || "The Registrar"
  };

  const committedFields = zkpService.commitFields(fields);
  const credentialHash = zkpService.aggregateHash(committedFields);
  const signature = signatureService.sign(institution.issuerSecret, credentialHash);
  const blockchainRecord = blockchainService.recordHash(credentialId, credentialHash, "ISSUANCE");
  const qrDataUrl = await qrService.generateQRDataUrl(credentialId);

  const credential = {
    id: credentialId,
    credentialId,
    studentId: student.id,
    studentDid: student.did,
    issuerId: institution.id,
    issuerDid: institution.did,
    credentialType: academic.credentialType,
    qualification: academic.qualification,
    issueDate,
    graduationDate: academic.graduationDate,
    graduationYear: academic.graduationDate ? new Date(`${academic.graduationDate}T00:00:00`).getFullYear() : "",
    issuanceDate: issueDate,
    committedFields,
    credentialHash,
    signature,
    blockchainReference: blockchainRecord.transactionHash,
    blockNumber: blockchainRecord.blockNumber,
    status: "active",
    qrDataUrl,
    createdAt: new Date().toISOString(),
    revokedAt: null,
    revocationReason: null
  };

  db.insert("credentials", credential);

  auditService.log({
    event: "Credential Issued",
    userLabel: institution.name,
    credentialId,
    result: "success",
    reference: blockchainRecord.transactionHash
  });

  return credential;
}

function revokeCredential(credentialId, reason) {
  const credential = db.findOne("credentials", (c) => c.credentialId === credentialId);
  if (!credential) return null;

  const updated = db.update("credentials", credential.id, {
    status: "revoked",
    revokedAt: new Date().toISOString(),
    revocationReason: reason || "Not specified"
  });

  blockchainService.recordHash(credentialId, credential.credentialHash, "REVOCATION");

  auditService.log({
    event: "Credential Revoked",
    userLabel: "University Administrator",
    credentialId,
    result: "success",
    reference: reason
  });

  return updated;
}

function getCredentialsForStudent(studentId) {
  return db.find("credentials", (c) => c.studentId === studentId);
}

function getCredentialsForIssuer(issuerId) {
  return db.find("credentials", (c) => c.issuerId === issuerId);
}

function getByCredentialId(credentialId) {
  return db.findOne("credentials", (c) => c.credentialId === credentialId);
}

module.exports = {
  issueCredential,
  revokeCredential,
  getCredentialsForStudent,
  getCredentialsForIssuer,
  getByCredentialId
};
