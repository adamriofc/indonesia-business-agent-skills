/**
 * Deterministic OSS-RBA Risk & PB-UMKU Navigator Engine (`engines/oss-rba-engine.js`)
 *
 * Implements risk-based business licensing classification per:
 *   - Peraturan Pemerintah (PP) No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko
 *   - BPS Peraturan No. 2 Tahun 2020 (KBLI 2020)
 *
 * Zero external dependencies. Pure Node.js.
 */

const ossRules = require('./rules/oss-rba.json');
const { verifyRulesetIntegrity } = require('./rules/integrity');

// Validate ruleset integrity
verifyRulesetIntegrity('oss-rba.json');

const activeRuleset = ossRules.rulesets[0];

function resolveOssRisk(kbliCodeInput) {
  const code = String(kbliCodeInput || '').replace(/\D/g, '').trim();

  if (code.length !== 5) {
    throw new Error(`INVALID_INPUT: KBLI code must be exactly 5 numeric digits (received '${kbliCodeInput}')`);
  }

  const mapping = activeRuleset.kbli_risk_map[code];
  let riskLevel = 'MENENGAH_RENDAH'; // Default general commerce risk
  let sectorName = 'Sektor Usaha Terklasifikasi KBLI 2020';
  let pbumkuList = [];

  if (mapping) {
    riskLevel = mapping.risk;
    sectorName = mapping.sector;
    pbumkuList = mapping.pbumku || [];
  } else {
    // Structural heuristic for unmapped KBLI categories per PP 5/2021
    if (code.startsWith('86') || code.startsWith('21') || code.startsWith('35')) {
      riskLevel = 'TINGGI'; // Health, Pharma, Electricity
    } else if (code.startsWith('10') || code.startsWith('56') || code.startsWith('49')) {
      riskLevel = 'MENENGAH_TINGGI'; // Food processing, restaurants, transport
    } else if (code.startsWith('62') || code.startsWith('70') || code.startsWith('74')) {
      riskLevel = 'RENDAH'; // IT, Consulting, Professional services
    }
  }

  const riskDetails = activeRuleset.risk_levels[riskLevel] || activeRuleset.risk_levels.RENDAH;

  return {
    kbliCode: code,
    sectorName,
    riskLevel,
    riskDescription: riskDetails.description,
    requiredPrimaryLicense: riskDetails.requiredLicense,
    requiresGovernmentVerification: riskDetails.verificationRequired,
    operationalReadyImmediately: riskDetails.operationalReadyImmediately,
    requiredPbumkuPermits: pbumkuList,
    statutoryReference: "PP No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko"
  };
}

module.exports = {
  resolveOssRisk
};
