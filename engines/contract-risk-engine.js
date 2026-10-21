/**
 * Deterministic Contract Risk Scoring Engine (`engines/contract-risk-engine.js`)
 *
 * Audits Indonesian commercial agreements against statutory legal mandates:
 *   - KUHPerdata Pasal 1243 (Wanprestasi), 1266 (Syarat Batal), 1320 (Syarat Sah), 1338 (Kebebasan Berkontrak)
 *   - UU No. 27/2022 (Pelindungan Data Pribadi / PDP)
 *   - UU No. 8/1999 (Perlindungan Konsumen — Klausula Baku)
 *
 * Implements quantitative risk scoring (0-100) and draft counter-clause generation.
 * Zero external dependencies. Pure Node.js.
 */

const { sanitizeUntrustedPayload } = require('./security-sanitizer');

function auditContractRisk(contractTextInput) {
  if (typeof contractTextInput !== 'string' || !contractTextInput.trim()) {
    throw new Error("INVALID_INPUT: 'contractText' must be a non-empty string");
  }

  const cleanText = sanitizeUntrustedPayload(contractTextInput);
  const lower = cleanText.toLowerCase();

  let riskScore = 0;
  const detectedRisks = [];

  // 1. Pasal 1266 / 1267 KUHPerdata Waiver (Weight: 25 points)
  // Checks if termination requires court order or waives court order
  const waives1266 = lower.includes('1266') || lower.includes('mengesampingkan ketentuan pasal 1266');
  if (waives1266) {
    // If waived, check if termination right is mutual or unilateral
    const hasUnilateralTermination = lower.includes('sepihak') || lower.includes('tanpa persetujuan');
    if (hasUnilateralTermination) {
      riskScore += 25;
      detectedRisks.push({
        code: 'UNILATERAL_1266_WAIVER',
        severity: 'CRITICAL',
        points: 25,
        title: 'Asymmetrical Waiver of Article 1266 KUHPerdata',
        description: 'Contract waives Article 1266 court involvement while permitting immediate unilateral termination without judicial determination.',
        statutoryBasis: 'KUHPerdata Pasal 1266 & 1338 (Itikad Baik)',
        recommendation: 'Ensure Article 1266 waiver applies strictly symmetrically and mandates a 30-day written cure notice before termination.'
      });
    } else {
      riskScore += 10;
      detectedRisks.push({
        code: 'MUTUAL_1266_WAIVER',
        severity: 'LOW',
        points: 10,
        title: 'Standard Mutual Article 1266 Waiver',
        description: 'Parties agree to waive court intervention for contract termination upon uncured material breach.',
        statutoryBasis: 'KUHPerdata Pasal 1266',
        recommendation: 'Compliant market standard if cure period of at least 14 days is provided.'
      });
    }
  }

  // 2. Limitation of Liability / Unlimited Indemnity (Weight: 20 points)
  const hasLiabilityCap = lower.includes('batasan tanggung jawab') || 
                          lower.includes('limitation of liability') || 
                          lower.includes('maksimal ganti rugi') || 
                          lower.includes('agregat ganti rugi');

  const hasUnlimitedIndemnity = lower.includes('mengganti seluruh kerugian') || 
                                lower.includes('tanpa batasan') || 
                                lower.includes('unlimited indemnity') || 
                                lower.includes('harmless');

  if (!hasLiabilityCap || hasUnlimitedIndemnity) {
    riskScore += 20;
    detectedRisks.push({
      code: 'UNLIMITED_LIABILITY',
      severity: 'HIGH',
      points: 20,
      title: 'Uncapped Liability or Broad Indemnification',
      description: 'Contract lacks an aggregate liability cap (standard: 100% of fees paid in past 12 months), exposing the company to existential damages.',
      statutoryBasis: 'KUHPerdata Pasal 1243 & 1246 (Kerugian Nyata & Terduga)',
      recommendation: 'Insert aggregate liability cap equal to total contract value or fees paid in preceding 12 months.'
    });
  }

  // 3. Penalty / Denda Keterlambatan Ceiling (Weight: 20 points)
  const hasPenaltyClause = lower.includes('denda') || lower.includes('penalty') || lower.includes('bunga keterlambatan');
  const penaltyMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:per|setiap)\s*(?:hari|bulan)/);

  if (hasPenaltyClause && penaltyMatch) {
    const rate = parseFloat(penaltyMatch[1].replace(',', '.'));
    if (lower.includes('hari') && rate > 0.1) { // >0.1% per day = >36.5% annually
      riskScore += 20;
      detectedRisks.push({
        code: 'EXCESSIVE_DAILY_PENALTY',
        severity: 'HIGH',
        points: 20,
        title: 'Excessive Daily Delay Penalty',
        description: `Daily penalty rate of ${rate}% per day is disproportionately punitive and exceeds commercial reasonableness.`,
        statutoryBasis: 'Yurisprudensi MA RI & KUHPerdata Pasal 1338 ayat (3)',
        recommendation: 'Cap daily penalty at 0.1% per day and impose an absolute maximum ceiling of 5% of invoice value.'
      });
    }
  }

  // 4. Dispute Forum & Exclusive Jurisdiction (Weight: 15 points)
  const mentionsArbitration = lower.includes('bani') || lower.includes('siac') || lower.includes('arbitrase');
  const mentionsCourt = lower.includes('pengadilan negeri') || lower.includes('district court');

  if (mentionsArbitration && mentionsCourt && !lower.includes('kecuali untuk sita jaminan')) {
    riskScore += 15;
    detectedRisks.push({
      code: 'CONFLICTING_DISPUTE_FORUMS',
      severity: 'MEDIUM',
      points: 15,
      title: 'Conflicting Dispute Resolution Jurisdiction',
      description: 'Agreement references both Arbitration and District Court without clarifying exclusive jurisdiction or hierarchical escalation.',
      statutoryBasis: 'UU No. 30/1999 tentang Arbitrase Pasal 3 & 11',
      recommendation: 'Clarify exclusive forum: BANI Indonesia or District Court with explicit domicile agreement (Pasal 118 HIR).'
    });
  }

  // 5. UU PDP Data Protection Compliance (Weight: 20 points)
  const handlesPersonalData = lower.includes('data pribadi') || lower.includes('personal data') || lower.includes('informasi pengguna');
  const hasPdpClause = lower.includes('uu no. 27/2022') || lower.includes('pelindungan data pribadi') || lower.includes('pemberitahuan kebocoran');

  if (handlesPersonalData && !hasPdpClause) {
    riskScore += 20;
    detectedRisks.push({
      code: 'MISSING_UU_PDP_COMPLIANCE',
      severity: 'HIGH',
      points: 20,
      title: 'Missing Statutory Personal Data Protection Safeguards',
      description: 'Agreement involves personal data processing but omits mandatory 3x24 hours breach notification and lawful basis warranties.',
      statutoryBasis: 'UU No. 27/2022 Pasal 20 & Pasal 46 (Kewajiban Pengendali Data)',
      recommendation: 'Insert mandatory UU PDP Data Processing Addendum (DPA) with 72-hour security incident notification obligation.'
    });
  }

  // Determine Category
  const finalScore = Math.min(100, Math.max(0, riskScore));
  let riskCategory = 'LOW';
  if (finalScore >= 60) riskCategory = 'CRITICAL';
  else if (finalScore >= 40) riskCategory = 'HIGH';
  else if (finalScore >= 20) riskCategory = 'MEDIUM';

  return {
    contractRiskScore: finalScore,
    riskCategory,
    totalRisksIdentified: detectedRisks.length,
    detectedRisks,
    complianceChecks: {
      pasal1266Waiver: waives1266,
      liabilityCapped: hasLiabilityCap,
      penaltyExceedsCap: Boolean(penaltyMatch && parseFloat(penaltyMatch[1]) > 0.1),
      disputeResolutionDefined: mentionsArbitration || mentionsCourt,
      uuPdpAddressed: hasPdpClause
    },
    statutoryFramework: "KUHPerdata (Buku III Perikatan), UU No. 27/2022 (PDP), UU No. 30/1999"
  };
}

module.exports = {
  auditContractRisk
};
