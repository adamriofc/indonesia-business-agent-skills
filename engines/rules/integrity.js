/**
 * Cryptographic SHA-256 Ruleset Integrity & Tamper Protection Anchor
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const EXPECTED_HASHES = {
  "bpjs.json": "9203585d83863a44fec7ced194672d0c206dcb70b7b6d844626c90b93101d9b7",
  "pph21.json": "ed1198d3b5c151a1dd8ff2653743bd04af03d73f7ea18dbbca6bac0e64e921ed",
  "marketplace.json": "551fa957822cde264463b62c647f19d7759fb9c171f051c49406d325d89ebfa2",
  "umkm.json": "1b06c261a9d06eb0359817dbe12bf1d4cf8ba9f8875cc025a6d49edef3cdd03a",
  "btki.json": "d5ca820d377edde092bcbaf6a16c105c27da4d7114a548d93dad9f5a6a90320e",
  "kmk-rates.json": "fe11898332b7fccb0ea4a4d952efb19e1ec4421eebc51815aedee7c5e6ba9b01",
  "oss-rba.json": "2de50787bf225e8cff6f1dcef032f59329b293af909b816f0fe7e578d408ab07"
};

function verifyRulesetIntegrity(fileBasename, overrideFilePath = null) {
  const expected = EXPECTED_HASHES[fileBasename];
  if (!expected) {
    throw new Error("No registered hash manifest for: " + fileBasename);
  }
  const filePath = overrideFilePath || path.join(__dirname, fileBasename);
  if (!fs.existsSync(filePath)) {
    throw new Error("Missing ruleset file: " + fileBasename);
  }
  const content = fs.readFileSync(filePath);
  const actual = crypto.createHash("sha256").update(content).digest("hex");
  if (actual !== expected) {
    throw new Error("Cryptographic Integrity Violation: Ruleset " + fileBasename + " has been tampered with! Expected " + expected + ", got " + actual);
  }
  return {
    status: "VERIFIED",
    file: fileBasename,
    hash: actual
  };
}

module.exports = {
  verifyRulesetIntegrity
};
