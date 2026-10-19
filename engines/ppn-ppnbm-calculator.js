/**
 * Deterministic PPN 12% & Luxury Goods Sales Tax (PPnBM) Calculator Engine
 * Calculates statutory 12% PPN, PPnBM rates (10% to 200%), Other Basis DPP (11/12), and Import CIF Tax Bases.
 * Supports PPN equalisation between Input Tax Credits (Pajak Masukan) and Output Tax Credits (Pajak Keluaran).
 */

const STATUTORY_PPN_RATE = 0.12; // 12% PPN Rate per UU No. 7/2021 (HPP) & PMK 131/2024
const DPP_NILAI_LAIN_FRACTION = 11 / 12; // 11/12 multiplier for non-luxury effective 11% burden

function calculatePpnAndPpnbm({
  transactionType = 'standard', // 'standard', 'dpp_nilai_lain', 'import', 'export_zero'
  cifValueIdr = 0,             // For imports: Cost, Insurance & Freight in IDR
  customsDutyAmount = 0,       // Bea Masuk in IDR
  sellingPriceOrDpp = 0,       // Standard selling price or DPP
  ppnbmRatePercent = 0,        // PPnBM rate e.g. 10, 20, 30, 50, 95, 200
  inputTaxCreditsAlreadyPaid = 0 // Pajak Masukan
}) {
  const price = Math.max(0, Number(sellingPriceOrDpp) || 0);
  const cif = Math.max(0, Number(cifValueIdr) || 0);
  const duty = Math.max(0, Number(customsDutyAmount) || 0);
  const ppnbmRate = Math.max(0, Number(ppnbmRatePercent) || 0) / 100;
  const inputTax = Math.max(0, Number(inputTaxCreditsAlreadyPaid) || 0);
  const type = (transactionType || 'standard').toLowerCase().trim();

  let dppBase = 0;
  let ppnRateApplied = STATUTORY_PPN_RATE;
  let ppnAmount = 0;
  let ppnbmAmount = 0;
  let effectivePpnBurdenPercent = "12.00%";

  if (type === 'import') {
    // Import DPP = Nilai Impor (CIF + Bea Masuk)
    dppBase = cif + duty;
    ppnAmount = Math.round(dppBase * STATUTORY_PPN_RATE);
    ppnbmAmount = Math.round(dppBase * ppnbmRate);
    effectivePpnBurdenPercent = "12.00%";
  } else if (type === 'dpp_nilai_lain') {
    // Other Basis DPP = 11/12 * Selling Price -> Effective 11% tax burden
    dppBase = Math.round(price * DPP_NILAI_LAIN_FRACTION);
    ppnAmount = Math.round(dppBase * STATUTORY_PPN_RATE);
    ppnbmAmount = Math.round(price * ppnbmRate);
    effectivePpnBurdenPercent = "11.00%"; // 12% * (11/12) = 11%
  } else if (type === 'besaran_tertentu_1_2' || type === 'besaran_tertentu' || type === 'logistik' || type === 'freight_forwarding' || type === 'travel') {
    // Besaran Tertentu Pasal 9A UU PPN jo. PMK 71/2022 & PMK 131/2024 (10% x tarif PPN 12% = 1.2% effective)
    dppBase = price;
    ppnRateApplied = 0.012;
    ppnAmount = Math.round(price * 0.012);
    ppnbmAmount = Math.round(price * ppnbmRate);
    effectivePpnBurdenPercent = "1.20%";
  } else if (type === 'export_zero') {
    // Export BKP/JKP: 0% PPN rate, Input Tax remains fully creditable
    dppBase = price;
    ppnRateApplied = 0;
    ppnAmount = 0;
    ppnbmAmount = 0;
    effectivePpnBurdenPercent = "0.00%";
  } else {
    // Standard domestic transaction
    dppBase = price;
    ppnAmount = Math.round(dppBase * STATUTORY_PPN_RATE);
    ppnbmAmount = Math.round(dppBase * ppnbmRate);
    effectivePpnBurdenPercent = "12.00%";
  }

  const totalInvoiceWithTaxes = price + ppnAmount + ppnbmAmount;

  // Output vs Input Tax Equalisation (Kurang/Lebih Bayar PPN)
  const netPpnPayableToKasNegara = ppnAmount - inputTax;

  return {
    transactionType: type,
    dppBase,
    ppnRatePercent: `${(ppnRateApplied * 100).toFixed(2)}%`,
    effectivePpnBurdenPercent,
    ppnAmount,
    ppnbmRatePercent: `${(ppnbmRate * 100).toFixed(2)}%`,
    ppnbmAmount,
    totalTaxes: ppnAmount + ppnbmAmount,
    totalInvoiceWithTaxes,
    inputTaxCreditsAlreadyPaid: inputTax,
    netPpnPayableToKasNegara,
    isOverpaid: netPpnPayableToKasNegara < 0,
    statutoryReference: "UU No. 7/2021 (HPP), PP No. 61/2020 & PMK No. 131/2024"
  };
}

module.exports = {
  calculatePpnAndPpnbm,
  STATUTORY_PPN_RATE,
  DPP_NILAI_LAIN_FRACTION
};
