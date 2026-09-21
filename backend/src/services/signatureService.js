const { hmacSha256 } = require("../utils/crypto");

/**
 * SignatureService
 * ---------------------------------------------------------------------------
 * The research (Section 3.6/3.8) specifies BBS+ Signatures because they
 * support selective disclosure. A full BBS+ pairing-based signature scheme
 * is out of scope for this prototype. Instead we simulate the *properties*
 * BBS+ gives us (an issuer signature over a credential that later supports
 * selective disclosure) using HMAC-SHA256 keyed by a per-institution issuer
 * secret. This is clearly a prototype substitute, not production
 * cryptography - swap this module for a real BBS+ library (e.g. @mattrglobal
 * BBS+ signatures) for production use.
 * ---------------------------------------------------------------------------
 */
function sign(issuerSecret, credentialHash) {
  return `sig_${hmacSha256(issuerSecret, credentialHash)}`;
}

function verify(issuerSecret, credentialHash, signature) {
  const expected = sign(issuerSecret, credentialHash);
  return expected === signature;
}

module.exports = { sign, verify };
