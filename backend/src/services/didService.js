const { randomHex } = require("../utils/crypto");

/**
 * DIDService
 * Generates simplified W3C-style Decentralised Identifiers (did:acv:<method-specific-id>)
 * and their accompanying DID Document (public key + service endpoint) for the
 * prototype. A real deployment would anchor this on a DID method such as
 * did:web, did:ion, or did:ethr.
 */
function generateDID(entityType) {
  const methodId = randomHex(16);
  const did = `did:acv:${entityType}:${methodId}`;
  const publicKey = `pk_${randomHex(24)}`;
  return {
    did,
    document: {
      "@context": "https://www.w3.org/ns/did/v1",
      id: did,
      verificationMethod: [
        {
          id: `${did}#keys-1`,
          type: "Ed25519VerificationKey2020 (simulated)",
          controller: did,
          publicKeyHex: publicKey
        }
      ],
      service: [
        {
          id: `${did}#verification`,
          type: "CredentialVerificationService",
          serviceEndpoint: "/api/verify"
        }
      ]
    },
    publicKey
  };
}

module.exports = { generateDID };
