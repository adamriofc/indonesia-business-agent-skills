/**
 * Indonesia Business Lifecycle & Scenario Engine
 * Maps a business profile (entity type, revenue, headcount, sales channels)
 * across the 8 Stages of the Indonesia Business Lifecycle to produce an end-to-end
 * compliance, tax, legal, and operational roadmap.
 */

function evaluateBusinessScenario({
  companyProfile = {
    entityType: 'pt',              // 'individual', 'perseroan_perorangan', 'pt', 'cv'
    annualRevenue: 5000000000,
    employeeCount: 15,
    businessActivities: ['software_development', 'ecommerce_retail'],
    salesChannels: ['marketplace', 'b2b_direct']
  }
}) {
  const entityType = (companyProfile.entityType || 'pt').toLowerCase().trim();
  const revenue = Math.max(0, Number(companyProfile.annualRevenue) || 0);
  const headcount = Math.max(0, Number(companyProfile.employeeCount) || 0);
  const channels = Array.isArray(companyProfile.salesChannels) ? companyProfile.salesChannels : ['b2b_direct'];

  const lifecycleStages = [];

  // Stage 1: Incorporation & OSS-RBA Licensing
  lifecycleStages.push({
    stageNumber: 1,
    stageName: 'Incorporation & OSS-RBA Licensing',
    applicableSkills: ['oss-kbli-navigator', 'spk-generator', 'haki-trademark-check'],
    keyStatutes: ['PP No. 5/2021 (OSS-RBA)', 'KBLI 2020'],
    summary: `Entity '${entityType.toUpperCase()}' must map activities to 5-digit KBLI 2020 codes and obtain NIB via OSS-RBA.`
  });

  // Stage 2: Workforce Onboarding & Employment Architecture
  lifecycleStages.push({
    stageNumber: 2,
    stageName: 'Workforce Onboarding & Employment Architecture',
    applicableSkills: ['pkwt-pkwtt-checker', 'pkwtt-checker', 'surat-peringatan', 'sop-perusahaan'],
    keyStatutes: ['PP No. 35/2021', 'UU No. 13/2003'],
    summary: `For ${headcount} employees: audit PKWT contract limits (max 5 yrs, no probation) vs PKWTT permanent employment.`
  });

  // Stage 3: Payroll, BPJS & THR Execution
  lifecycleStages.push({
    stageNumber: 3,
    stageName: 'Payroll, BPJS & THR Execution',
    applicableSkills: ['pph21-calculator', 'pph21-grossup', 'bpjs-calculator', 'thr-calculator', 'struktur-skala-upah'],
    keyStatutes: ['PP No. 58/2023 (PPh 21 TER)', 'PMK 168/2023', 'Permenaker 6/2016 (THR)', 'Permenaker 1/2017'],
    summary: `Monthly payroll withholding via TER tables (Category A/B/C) + statutory BPJS Health/Social Security splits + annual THR.`
  });

  // Stage 4: Commercial Contracts & Legal Protection
  lifecycleStages.push({
    stageNumber: 4,
    stageName: 'Commercial Contracts & Legal Protection',
    applicableSkills: ['contract-reviewer', 'spk-generator', 'nda-indonesia', 'pdp-compliance'],
    keyStatutes: ['KUHPerdata Arts. 1320 & 1338', 'UU No. 27/2022 (PDP)'],
    summary: `Audit commercial contracts, redline asymmetrical liability caps, waive Article 1266, and enforce DPA addendums.`
  });

  // Stage 5: Taxation & Equalisation
  const umkmEligible = (entityType === 'individual' || entityType === 'perseroan_perorangan') && revenue <= 4800000000;
  lifecycleStages.push({
    stageNumber: 5,
    stageName: 'Taxation & Equalisation',
    applicableSkills: ['pph-final-umkm', 'pph-badan-calculator', 'pph23-26-calculator', 'ppn-ppnbm-advanced', 'tax-planning'],
    keyStatutes: umkmEligible ? ['PP No. 20/2026 (UMKM 0.5%)'] : ['Pasal 31E UU PPh (Corporate Tax 11%/22%)', 'PMK 131/2024 (PPN 12%)'],
    summary: umkmEligible
      ? `Eligible for 0.5% UMKM final tax with Rp 500M non-taxable threshold.`
      : `Subject to General Corporate Income Tax (22%) with Pasal 31E sliding scale facility + PPN 12% equalisation.`
  });

  // Stage 6: E-Commerce & Marketplace Operations
  if (channels.includes('marketplace')) {
    lifecycleStages.push({
      stageNumber: 6,
      stageName: 'E-Commerce & Marketplace Operations',
      applicableSkills: ['margin-pricing-calculator', 'tokopedia-seo-optimizer', 'cs-komplain-handler', 'klaim-logistik-retur'],
      keyStatutes: ['Permendag No. 31/2023 (PMSE)'],
      summary: `Compute net seller payout after Shopee/Tokopedia/TikTok Shop admin fees (4%-8.5%) and manage logistic insurance claims.`
    });
  }

  // Stage 7: Accounting & Financial Reporting
  lifecycleStages.push({
    stageNumber: 7,
    stageName: 'Accounting & Financial Reporting',
    applicableSkills: ['laporan-keuangan-psak', 'financial-statements', 'financial-ratio-analysis', 'working-capital'],
    keyStatutes: ['SAK EMKM / SAK EP'],
    summary: `Format trial balance into 3-statement SAK EMKM financial report for bank credit applications and tax audits.`
  });

  // Stage 8: Exit, Restructuring & Liquidation Waterfall
  lifecycleStages.push({
    stageNumber: 8,
    stageName: 'Exit, Restructuring & Payout Waterfall',
    applicableSkills: ['vc-term-sheet-waterfall', 'phk-calculator', 'phk-advanced-matrix'],
    keyStatutes: ['UU No. 40/2007 (PT Law)', 'PP No. 35/2021 (Termination Severance)'],
    summary: `Model liquidation preference payout waterfall (Seniority/Pari Passu/Participating) and employee severance cross-over.`
  });

  return {
    companyProfile: {
      entityType,
      annualRevenue: revenue,
      employeeCount: headcount,
      salesChannels: channels
    },
    totalLifecycleStages: lifecycleStages.length,
    lifecycleStages,
    recommendedRegime: umkmEligible ? 'UMKM_FINAL_TAX' : 'GENERAL_CORPORATE_TAX',
    statutoryFramework: "Indonesian Business & Regulatory Lifecycle Framework"
  };
}

module.exports = {
  evaluateBusinessScenario
};