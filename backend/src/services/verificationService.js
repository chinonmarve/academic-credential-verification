const db = require("../db");
const { newId } = require("../utils/crypto");
const signatureService = require("./signatureService");
const blockchainService = require("./blockchainService");
const zkpService = require("./zkpService");
const auditService = require("./auditService");
const credentialService = require("./credentialService");

const DEFAULT_DISCLOSURE = ["qualification", "institution", "graduationStatus"];

/**
 * Verifies a credential and returns a structured, step-by-step result
 * mirroring Section 11/12/13 of the spec:
 *   1. Credential located
 *   2. Issuer signature verified
 *   3. Credential hash retrieved
 *   4. Blockchain hash compared
 *   5. Credential status checked
 *   6. Zero-Knowledge Proof validated
 *   7. Verification completed
 */
function verifyCredential({ credentialId, requestedAttributes, verifierLabel, institution }) {
  const steps = [];
  const credential = credentialService.getByCredentialId(credentialId);

  if (!credential) {
    steps.push({ step: "Credential located", passed: false });
    return finalize({
      credentialId,
      steps,
      finalResult: "INVALID",
      reason: "Credential not found",
      verifierLabel
    });
  }
  steps.push({ step: "Credential located", passed: true });

  const issuer = institution || db.findOne("institutions", (i) => i.id === credential.issuerId);
  const signatureResult = issuer
    ? signatureService.verify(issuer.issuerSecret, credential.credentialHash, credential.signature)
    : false;
  steps.push({ step: "Issuer signature verified", passed: signatureResult });

  const chainRecord = blockchainService.getLatestHashForCredential(credentialId);
  const hashResult = !!chainRecord && chainRecord.credentialHash === credential.credentialHash;
  steps.push({ step: "Blockchain hash compared", passed: hashResult });

  const statusOk = credential.status === "active";
  steps.push({ step: "Credential status checked", passed: statusOk, status: credential.status });

  const attributesToDisclose =
    requestedAttributes && requestedAttributes.length ? requestedAttributes : DEFAULT_DISCLOSURE;
  const proof = zkpService.buildProof(
    credential.committedFields,
    credential.credentialHash,
    attributesToDisclose
  );
  steps.push({ step: "Zero-Knowledge Proof validated", passed: proof.proofValid });

  let finalResult = "VALID";
  let reason = null;
  if (credential.status === "revoked") {
    finalResult = "REVOKED";
    reason = credential.revocationReason || "Credential was revoked by the issuing institution";
  } else if (!signatureResult || !hashResult || !proof.proofValid) {
    finalResult = "INVALID";
    reason = "One or more cryptographic checks failed";
  }
  steps.push({ step: "Verification completed", passed: true });

  return finalize({
    credentialId,
    steps,
    finalResult,
    reason,
    disclosed: proof.disclosed,
    proof,
    credential,
    chainRecord,
    verifierLabel
  });
}

function finalize({ credentialId, steps, finalResult, reason, disclosed, proof, credential, chainRecord, verifierLabel }) {
  const log = {
    id: newId("VER"),
    credentialId,
    verifierLabel: verifierLabel || "Public Verifier",
    disclosedAttributes: disclosed ? Object.keys(disclosed) : [],
    signatureResult: steps.find((s) => s.step === "Issuer signature verified")?.passed || false,
    hashResult: steps.find((s) => s.step === "Blockchain hash compared")?.passed || false,
    zkpResult: steps.find((s) => s.step === "Zero-Knowledge Proof validated")?.passed || false,
    finalResult,
    timestamp: new Date().toISOString()
  };
  db.insert("verificationLogs", log);

  auditService.log({
    event: `Verification ${finalResult}`,
    userLabel: verifierLabel || "Public Verifier",
    credentialId,
    result: finalResult.toLowerCase(),
    reference: log.id
  });

  return {
    finalResult,
    reason,
    steps,
    disclosed: disclosed || {},
    proofEngine: proof ? proof.engine : null,
    credential: credential
      ? {
          credentialId: credential.credentialId,
          qualification: credential.qualification,
          credentialType: credential.credentialType,
          issueDate: credential.issueDate,
          issuerDid: credential.issuerDid,
          studentDid: credential.studentDid,
          status: credential.status
        }
      : null,
    blockchain: chainRecord
      ? {
          transactionHash: chainRecord.transactionHash,
          blockNumber: chainRecord.blockNumber,
          network: chainRecord.network,
          timestamp: chainRecord.timestamp
        }
      : null,
    verificationId: log.id,
    verifiedAt: log.timestamp
  };
}

function historyForVerifier(verifierLabel) {
  return db
    .find("verificationLogs", (v) => v.verifierLabel === verifierLabel)
    .slice()
    .reverse();
}

function allHistory() {
  return db.get("verificationLogs").slice().reverse();
}

module.exports = { verifyCredential, historyForVerifier, allHistory };
