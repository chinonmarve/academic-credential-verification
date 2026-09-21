const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET, requireAuth, requireRole } = require("../middleware/auth");
const verificationService = require("../services/verificationService");
const presentationService = require("../services/presentationService");

const router = express.Router();

/** Reads an optional bearer token so public verification can still tag a
 * logged-in employer's history, without requiring authentication. */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    } catch (e) {
      /* ignore invalid token for public route */
    }
  }
  next();
}

// Public verification: by credential ID or by presentation ID (from a scanned/uploaded QR)
router.post("/", optionalAuth, (req, res) => {
  const { credentialId, presentationId } = req.body;

  let resolvedCredentialId = credentialId;
  let requestedAttributes = null;

  if (presentationId) {
    const presentation = presentationService.getPresentation(presentationId);
    if (!presentation) {
      return res.status(404).json({ error: "Presentation not found or expired" });
    }
    if (new Date(presentation.expiresAt) < new Date()) {
      return res.status(410).json({ error: "This presentation has expired. Ask the holder to present again." });
    }
    resolvedCredentialId = presentation.credentialId;
    requestedAttributes = presentation.disclosedAttributes;
  }

  if (!resolvedCredentialId) {
    return res.status(400).json({ error: "Provide a credentialId or presentationId" });
  }

  const verifierLabel = req.user ? req.user.name : req.body.verifierLabel || "Public Verifier";

  const result = verificationService.verifyCredential({
    credentialId: resolvedCredentialId,
    requestedAttributes,
    verifierLabel
  });

  res.json(result);
});

router.get("/history", requireAuth, requireRole("employer"), (req, res) => {
  res.json({ history: verificationService.historyForVerifier(req.user.name) });
});

router.get("/dashboard/stats", requireAuth, requireRole("employer"), (req, res) => {
  const history = verificationService.historyForVerifier(req.user.name);
  res.json({
    totalVerifications: history.length,
    successful: history.filter((h) => h.finalResult === "VALID").length,
    failed: history.filter((h) => h.finalResult !== "VALID").length,
    recent: history.slice(0, 8)
  });
});

module.exports = router;
