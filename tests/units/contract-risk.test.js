const assert = require('assert');
const { auditContractRisk } = require('../../engines/contract-risk-engine');

function runContractRiskTests() {
  console.log("📜 Running Contract Risk Scoring Engine Tests...\n");

  // 1. High Risk Contract: Unilateral 1266 waiver, no liability cap, 0.5% daily penalty, no PDP
  const riskyContract = `
    SURAT PERJANJIAN KERJASAMA
    Pasal 5: Pihak Pertama berhak melakukan pemutusan sepihak tanpa persetujuan dan mengesampingkan ketentuan Pasal 1266 KUHPerdata.
    Pasal 7: Pihak Kedua wajib mengganti seluruh kerugian tanpa batasan (unlimited indemnity).
    Pasal 8: Keterlambatan pembayaran dikenakan denda sebesar 0.5% per hari.
    Pasal 10: Pengolahan data pribadi dan informasi pengguna dilaksanakan oleh Pihak Kedua.
  `;

  const riskyRes = auditContractRisk(riskyContract);
  assert.ok(riskyRes.contractRiskScore >= 60, `Expected critical score >= 60, got ${riskyRes.contractRiskScore}`);
  assert.strictEqual(riskyRes.riskCategory, 'CRITICAL');
  assert.strictEqual(riskyRes.complianceChecks.pasal1266Waiver, true);
  assert.strictEqual(riskyRes.complianceChecks.penaltyExceedsCap, true);
  assert.strictEqual(riskyRes.complianceChecks.uuPdpAddressed, false);

  // 2. Balanced / Low Risk Contract
  const compliantContract = `
    PERJANJIAN PENYEDIAAN JASA
    Pasal 6: Para Pihak sepakat mengesampingkan Pasal 1266 KUHPerdata setelah memberikan pemberitahuan tertulis 30 hari kalender.
    Pasal 8: Batasan tanggung jawab (limitation of liability) disepakati maksimal sebesar 100% total biaya kontrak 12 bulan terakhir.
    Pasal 9: Denda keterlambatan disepakati sebesar 0.05% per hari dengan batas maksimal denda 5%.
    Pasal 10: Para Pihak tunduk pada UU No. 27/2022 tentang Pelindungan Data Pribadi dan pemberitahuan kebocoran maksimal 3x24 jam.
    Pasal 12: Sengketa diselesaikan secara eksklusif melalui BANI (Badan Arbitrase Nasional Indonesia).
  `;

  const compRes = auditContractRisk(compliantContract);
  assert.ok(compRes.contractRiskScore <= 20, `Expected low score <= 20, got ${compRes.contractRiskScore}`);
  assert.strictEqual(compRes.complianceChecks.liabilityCapped, true);
  assert.strictEqual(compRes.complianceChecks.penaltyExceedsCap, false);
  assert.strictEqual(compRes.complianceChecks.uuPdpAddressed, true);

  console.log("✅ Contract Risk Engine Tests PASSED 100%!");
}

runContractRiskTests();
