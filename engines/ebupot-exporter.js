/**
 * Last-Mile e-Bupot CSV Exporter (`engines/ebupot-exporter.js`)
 *
 * Generates exact CSV files conforming to Directorate General of Taxes (DJP)
 * e-Bupot 21/26 Unifikasi & e-Bupot 23 bulk import schema.
 *
 * Zero external dependencies. Pure Node.js.
 */

function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates official DJP e-Bupot 21/26 import CSV (Bulanan Pegawai Tetap 21-100-01).
 * Standard unifikasi schema with exact column ordering and formatting.
 */
function exportEbupot21Csv(payrollRecords = [], options = {}) {
  const taxMonth = options.month || new Date().getMonth() + 1;
  const taxYear = options.year || new Date().getFullYear();
  const pembetulan = options.pembetulan || 0;

  const headers = [
    "Masa Pajak",
    "Tahun Pajak",
    "Pembetulan",
    "NPWP/NIK Pemotong",
    "Nama Pemotong",
    "Identitas Penerima (1=NPWP, 2=NIK)",
    "Nomor Identitas",
    "Nama Penerima",
    "Alamat Penerima",
    "Kode Objek Pajak",
    "Penghasilan Bruto",
    "Tarif",
    "PPh Dipotong",
    "Metode (1=Gross, 2=Gross-up, 3=Nett)",
    "Status PTKP",
    "Fasilitas (1=Tanpa Fasilitas, 2=DTP)",
    "Nomor Dokumen",
    "Tanggal Dokumen"
  ];

  const rows = [headers.map(escapeCsvField).join(',')];

  for (const emp of payrollRecords) {
    const isNik = String(emp.identityNumber || '').length === 16 && !emp.hasNpwp;
    const identitasType = isNik ? "2" : "1";
    const gross = Math.round(Number(emp.grossSalary || emp.grossMonthlyIncome || 0));
    const tax = Math.round(Number(emp.monthlyTaxWithheld || emp.pph21Amount || 0));
    const ratePercent = emp.effectiveRatePercent ? emp.effectiveRatePercent.replace('%', '') : "0";
    const docDate = emp.documentDate || `${taxYear}-${String(taxMonth).padStart(2, '0')}-28`;

    const row = [
      taxMonth,
      taxYear,
      pembetulan,
      options.companyNpwp || "0000000000000000",
      options.companyName || "PT Perusahaan Indonesia",
      identitasType,
      emp.identityNumber || emp.nik || emp.npwp || "0000000000000000",
      emp.name || emp.employeeName || "Pegawai",
      emp.address || "Indonesia",
      emp.taxObjectCode || "21-100-01",
      gross,
      ratePercent,
      tax,
      emp.taxMethod === 'gross_up' ? "2" : "1",
      emp.ptkpStatus || "TK/0",
      "1",
      emp.documentNumber || `BP-21-${taxYear}${String(taxMonth).padStart(2, '0')}-${String(rows.length).padStart(4, '0')}`,
      docDate
    ];

    rows.push(row.map(escapeCsvField).join(','));
  }

  return {
    totalRecords: payrollRecords.length,
    taxMonth,
    taxYear,
    csvContent: rows.join('\r\n'),
    statutoryStandard: "DJP e-Bupot 21/26 Unifikasi PER-24/PJ/2021 jo. PER-06/PJ/2024"
  };
}

/**
 * Generates DJP e-Bupot Unifikasi PPh 23 CSV for domestic vendor services (Kode 24-104-01).
 */
function exportEbupot23Csv(serviceRecords = [], options = {}) {
  const taxMonth = options.month || new Date().getMonth() + 1;
  const taxYear = options.year || new Date().getFullYear();
  const pembetulan = options.pembetulan || 0;

  const headers = [
    "Masa Pajak",
    "Tahun Pajak",
    "Pembetulan",
    "Identitas Vendor (1=NPWP, 2=NIK)",
    "Nomor Identitas Vendor",
    "Nama Vendor",
    "Kode Objek Pajak",
    "Dasar Pengenaan Pajak (DPP)",
    "Tarif",
    "PPh 23 Dipotong",
    "Nomor Faktur/Invoice",
    "Tanggal Invoice"
  ];

  const rows = [headers.map(escapeCsvField).join(',')];

  for (const item of serviceRecords) {
    const dpp = Math.round(Number(item.grossAmount || item.dpp || 0));
    const tax = Math.round(Number(item.taxWithheld || item.pph23Amount || 0));
    const rate = item.effectiveRatePercent ? item.effectiveRatePercent.replace('%', '') : "2.00";

    const row = [
      taxMonth,
      taxYear,
      pembetulan,
      item.hasNpwp !== false ? "1" : "2",
      item.vendorIdentity || "0000000000000000",
      item.vendorName || "Vendor Jasa",
      item.taxObjectCode || "24-104-01",
      dpp,
      rate,
      tax,
      item.invoiceNumber || `INV-${taxYear}${String(taxMonth).padStart(2, '0')}-${String(rows.length).padStart(3, '0')}`,
      item.invoiceDate || `${taxYear}-${String(taxMonth).padStart(2, '0')}-01`
    ];

    rows.push(row.map(escapeCsvField).join(','));
  }

  return {
    totalRecords: serviceRecords.length,
    taxMonth,
    taxYear,
    csvContent: rows.join('\r\n'),
    statutoryStandard: "DJP e-Bupot Unifikasi PPh 23 PER-24/PJ/2021"
  };
}

module.exports = {
  exportEbupot21Csv,
  exportEbupot23Csv
};
