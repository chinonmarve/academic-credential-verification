const { sha256, randomHex } = require("../utils/crypto");

/**
 * ZKPService
 * ---------------------------------------------------------------------------
 * PROTOTYPE / SIMULATION NOTICE
 * The research proposes a full Zero-Knowledge Proof primitive (e.g. a
 * zk-SNARK / Groth16 circuit) combined with BBS+ Signatures for selective
 * disclosure. Implementing a real ZKP circuit is outside the scope of this
 * software prototype.
 *
 * What this module actually implements is a genuine (if simplified)
 * cryptographic selective-disclosure commitment scheme:
 *   - Every credential attribute is salted and hashed individually:
 *         commitment(field) = SHA256(fieldName + ":" + value + ":" + salt)
 *   - The credential's overall hash (the one anchored on-chain) is the
 *     SHA256 of all attribute commitments, sorted deterministically.
 *   - When a holder discloses only some attributes, the verifier receives
 *     the plaintext value + salt for disclosed fields, and only the
 *     commitment (not the value) for undisclosed fields. The verifier
 *     recomputes every commitment and checks the aggregate hash still
 *     matches the on-chain record - proving the disclosed values are part
 *     of the original signed credential WITHOUT learning the undisclosed
 *     values.
 *
 * This gives a real, working "selective disclosure without full exposure"
 * property suitable for demonstrating the research concept, and is clearly
 * distinguished here from a production zk-SNARK/BBS+ implementation.
 * ---------------------------------------------------------------------------
 */

function commitFields(fields) {
  const committed = {};
  for (const [key, value] of Object.entries(fields)) {
    const salt = randomHex(8);
    committed[key] = {
      value: String(value),
      salt,
      commitment: sha256(`${key}:${value}:${salt}`)
    };
  }
  return committed;
}

function aggregateHash(committedFields) {
  const sortedCommitments = Object.keys(committedFields)
    .sort()
    .map((k) => committedFields[k].commitment);
  return sha256(sortedCommitments.join("|"));
}

/**
 * Builds a selective-disclosure proof for the requested attribute list.
 * Returns disclosed plaintext values plus a boolean `proofValid` computed
 * by recomputing the aggregate hash and comparing it to the anchored hash.
 */
function buildProof(committedFields, anchoredHash, requestedAttributes) {
  const disclosed = {};
  let recomputeOk = true;

  for (const key of Object.keys(committedFields)) {
    const entry = committedFields[key];
    const recomputed = sha256(`${key}:${entry.value}:${entry.salt}`);
    if (recomputed !== entry.commitment) recomputeOk = false;
  }

  const recomputedAggregate = aggregateHash(committedFields);
  const hashMatches = recomputedAggregate === anchoredHash;

  for (const attr of requestedAttributes) {
    if (committedFields[attr]) {
      disclosed[attr] = committedFields[attr].value;
    }
  }

  return {
    disclosed,
    proofValid: recomputeOk && hashMatches,
    engine: "ACV Salted-Commitment Selective Disclosure (Prototype Simulation)",
    note:
      "This prototype simulates Zero-Knowledge selective disclosure using salted attribute commitments rather than a production zk-SNARK/BBS+ circuit."
  };
}

module.exports = { commitFields, aggregateHash, buildProof };
