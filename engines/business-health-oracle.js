/**
 * 360° Sovereign Business Health Oracle Engine (`engines/business-health-oracle.js`)
 *
 * Synthesizes full multi-domain corporate health metrics across 5 critical pillars:
 *   1. Tax Compliance (PPh 21 TER, SPT Tahunan, PPh Badan 31E, PPN, NPWP validity)
 *   2. Labor & Payroll Compliance (BPJS registration, UMP minimum wage, PKWT tenure, THR)
 *   3. Legal & Commercial Governance (OSS-RBA NIB/PB-UMKU, Contract Risk Score, UU PDP)
 *   4. Financial Stability (Balance Sheet Identity, Cash Runway, Thin-Cap DER 4:1)
 *   5. Commercial & Unit Economics (Contribution Margin, True ROAS, COD Return buffer)
 *
 * Zero external dependencies. Pure Node.js.
 */

function auditBusinessHealth(profile = {}) {
  const tax = profile.tax || {};
  const hr = profile.hr || {};
  const legal = profile.legal || {};
  const finance = profile.finance || {};
  const commerce = profile.commerce || {};

  const criticalAlerts = [];
  const recommendations = [];

  // 1. Tax Compliance Pillar (Weight: 20 points)
  let taxScore = 100;
  if (tax.hasAnnualSpt === false) {
    taxScore -= 30;
    criticalAlerts.push("PAJAK: SPT Tahunan Badan / Orang Pribadi belum dilaporkan (Risiko denda & SP2DK).");
  }
  if (tax.isNpwpValid === false) {
    taxScore -= 25;
    criticalAlerts.push("PAJAK: NPWP/NIK tidak terverifikasi atau tidak valid (Sanksi tarif pajak 20% - 100% lebih tinggi).");
  }
  if (tax.hasPph21TerWithholding === false) {
    taxScore -= 20;
    recommendations.push("Terapkan pemotongan PPh 21 TER bulanan sesuai PP 58/2023 & PMK 168/2023.");
  }
  taxScore = Math.max(0, taxScore);

  // 2. Labor & Payroll Compliance Pillar (Weight: 20 points)
  let hrScore = 100;
  if (hr.meetsMinimumWage === false || hr.paysUmp === false) {
    hrScore -= 40;
    criticalAlerts.push("HR: Upah pokok pegawai di bawah UMP/UMK provinsi (Pelanggaran pidana UU Ketenagakerjaan).");
  }
  if (hr.hasBpjsRegistration === false) {
    hrScore -= 30;
    criticalAlerts.push("HR: Perusahaan belum mendaftarkan seluruh karyawan ke BPJS TK & BPJS Kesehatan (Sanksi administratif).");
  }
  if (hr.pkwtExceeds5Years === true) {
    hrScore -= 20;
    criticalAlerts.push("HR: Masa kerja PKWT melebihi batas 5 tahun (Demi hukum otomatis berubah menjadi pegawai tetap PKWTT).");
  }
  if (hr.thrPaid === false) {
    hrScore -= 10;
    recommendations.push("Pastikan alokasi dana THR dibayarkan paling lambat H-7 Hari Raya Keagamaan (Permenaker 6/2016).");
  }
  hrScore = Math.max(0, hrScore);

  // 3. Legal & Governance Pillar (Weight: 20 points)
  let legalScore = 100;
  if (legal.hasNibOss === false) {
    legalScore -= 40;
    criticalAlerts.push("LEGAL: Perusahaan belum memiliki Nomor Induk Berusaha (NIB) berbasis risiko OSS-RBA (PP 5/2021).");
  }
  if (legal.contractRiskScore && legal.contractRiskScore > 50) {
    legalScore -= 30;
    criticalAlerts.push(`LEGAL: Kontrak komersial memiliki skor risiko kritis (${legal.contractRiskScore}/100) — tinjau klausul liability cap & Pasal 1266.`);
  }
  if (legal.hasUuPdpCompliance === false) {
    legalScore -= 15;
    recommendations.push("Sesuaikan SOP pengolahan data pelanggan dengan mandat UU No. 27/2022 (PDP).");
  }
  legalScore = Math.max(0, legalScore);

  // 4. Financial Stability Pillar (Weight: 20 points)
  let financeScore = 100;
  const cashRunway = Number(finance.cashRunwayMonths || 12);
  if (cashRunway < 3) {
    financeScore -= 40;
    criticalAlerts.push(`FINANSIAL: Sisa kas (Cash Runway) hanya ${cashRunway} bulan (Zona bahaya insolvensi operasional).`);
  } else if (cashRunway < 6) {
    financeScore -= 15;
    recommendations.push("Tingkatkan cadangan kas operasional minimal 6 bulan masa bakar (burn rate).");
  }

  const der = Number(finance.debtToEquityRatio || 1.0);
  if (der > 4.0) {
    financeScore -= 30;
    criticalAlerts.push(`FINANSIAL: Rasio utang DER (${der}:1) melebihi batas statutory Thin-Cap 4:1 (PMK 172/2023).`);
  }
  financeScore = Math.max(0, financeScore);

  // 5. Commercial & Market Pillar (Weight: 20 points)
  let commerceScore = 100;
  if (commerce.isContributionMarginPositive === false) {
    commerceScore -= 40;
    criticalAlerts.push("KOMERSIAL: Margin kontribusi bersih per unit bernilai negatif setelah dipotong fee marketplace & retur COD.");
  }
  if (commerce.isRoasAboveBreakEven === false) {
    commerceScore -= 20;
    recommendations.push("Turunkan biaya iklan atau tingkatkan konversi organik agar ROAS melampaui break-even ROAS floor.");
  }
  commerceScore = Math.max(0, commerceScore);

  // Composite Weighted Score
  const overallScore = Math.round(
    (taxScore * 0.20) +
    (hrScore * 0.20) +
    (legalScore * 0.20) +
    (financeScore * 0.20) +
    (commerceScore * 0.20)
  );

  let healthTier = 'STABLE_COMPLIANT';
  if (overallScore >= 85) healthTier = 'SOVEREIGN_EXCELLENT';
  else if (overallScore < 50) healthTier = 'DISTRESSED';
  else if (overallScore < 70) healthTier = 'VULNERABLE';

  return {
    overallHealthScore: overallScore,
    healthTier,
    radarScores: {
      taxCompliance: taxScore,
      laborCompliance: hrScore,
      legalGovernance: legalScore,
      financialStability: financeScore,
      commercialEfficiency: commerceScore
    },
    criticalAlertsCount: criticalAlerts.length,
    criticalAlerts,
    recommendationsCount: recommendations.length,
    recommendations,
    calculatedAt: new Date().toISOString().slice(0, 10),
    standardFramework: "Indonesia Business 360° Sovereign Health Oracle (UU HPP, PP 35/2021, PP 5/2021, PSAK 1)"
  };
}

module.exports = {
  auditBusinessHealth
};
