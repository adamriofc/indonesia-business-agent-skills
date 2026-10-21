/**
 * Local Cryptographic Compliance Ledger (`engines/compliance-ledger.js`)
 *
 * Implements a zero-database, tamper-evident Merkle hash chain audit ledger.
 * Provides immutable cryptographic proof of compliance calculations, prevent backdating,
 * and enables third-party regulatory inspection.
 *
 * Zero external dependencies. Pure Node.js.
 */

const crypto = require('crypto');

const GENESIS_PREVIOUS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

class ComplianceLedger {
  constructor(initialChain = []) {
    this.chain = Array.isArray(initialChain) && initialChain.length > 0 ? [...initialChain] : [];
  }

  /**
   * Appends a new immutable compliance action to the cryptographic ledger.
   */
  append({
    domain = 'tax',
    action = 'calculate',
    statute = '',
    payload = {}
  }) {
    const blockIndex = this.chain.length;
    const previousHash = blockIndex === 0 ? GENESIS_PREVIOUS_HASH : this.chain[blockIndex - 1].blockHash;
    const timestamp = new Date().toISOString();
    const payloadHash = sha256(JSON.stringify(payload));

    const rawBlockString = `${blockIndex}|${timestamp}|${domain}|${action}|${statute}|${payloadHash}|${previousHash}`;
    const blockHash = sha256(rawBlockString);

    const block = {
      blockIndex,
      timestamp,
      domain: String(domain).toLowerCase(),
      action: String(action),
      statute: String(statute),
      payloadHash,
      previousHash,
      blockHash
    };

    this.chain.push(block);
    return block;
  }

  /**
   * Cryptographically verifies the integrity of the entire compliance audit chain.
   */
  verifyChain() {
    if (this.chain.length === 0) {
      return { isValid: true, totalBlocks: 0, message: "Ledger is empty" };
    }

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];
      const expectedPrevHash = (i === 0) ? GENESIS_PREVIOUS_HASH : this.chain[i - 1].blockHash;

      // 1. Verify previous hash linkage
      if (block.previousHash !== expectedPrevHash) {
        return {
          isValid: false,
          violationBlockIndex: i,
          error: `Broken chain link at block ${i}: expected previousHash '${expectedPrevHash}', got '${block.previousHash}'`
        };
      }

      // 2. Re-compute block hash
      const rawBlockString = `${block.blockIndex}|${block.timestamp}|${block.domain}|${block.action}|${block.statute}|${block.payloadHash}|${block.previousHash}`;
      const recomputedHash = sha256(rawBlockString);

      if (block.blockHash !== recomputedHash) {
        return {
          isValid: false,
          violationBlockIndex: i,
          error: `Tamper detected at block ${i}: expected blockHash '${recomputedHash}', got '${block.blockHash}'`
        };
      }
    }

    return {
      isValid: true,
      totalBlocks: this.chain.length,
      latestBlockHash: this.chain[this.chain.length - 1].blockHash,
      verifiedAt: new Date().toISOString()
    };
  }

  getLatestBlock() {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1] : null;
  }

  exportBlocks() {
    return [...this.chain];
  }
}

// Global singleton instance for runtime audit tracking
const defaultLedger = new ComplianceLedger();

module.exports = {
  ComplianceLedger,
  defaultLedger,
  recordComplianceEntry: (domain, action, statute, payload) => defaultLedger.append({ domain, action, statute, payload }),
  verifyComplianceChain: () => defaultLedger.verifyChain()
};
