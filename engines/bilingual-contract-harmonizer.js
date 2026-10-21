/**
 * Bilingual Statutory Contract Harmonizer Engine (`engines/bilingual-contract-harmonizer.js`)
 *
 * Enforces mandatory statutory language compliance for commercial contracts involving Indonesian entities per:
 *   - UU No. 24 Tahun 2009 Pasal 31 (Bendera, Bahasa, dan Lambang Negara, serta Lagu Kebangsaan)
 *   - Perpres No. 63 Tahun 2019 tentang Penggunaan Bahasa Indonesia
 *   - Surat Edaran Mahkamah Agung (SEMA) No. 3 Tahun 2015
 *
 * Zero external dependencies. Pure Node.js.
 */

const { sanitizeUntrustedPayload } = require('./security-sanitizer');

function verifyBilingualCompliance(indonesianText, englishText) {
  const indoClean = typeof indonesianText === 'string' ? sanitizeUntrustedPayload(indonesianText).trim() : '';
  const engClean = typeof englishText === 'string' ? sanitizeUntrustedPayload(englishText).trim() : '';

  const warnings = [];
  let isCompliant = true;
  let prevailingLanguage = 'BAHASA_INDONESIA';

  // 1. Mandatory Presence of Bahasa Indonesia
  if (!indoClean) {
    isCompliant = false;
    warnings.push("PELANGGARAN HUKUM: Naskah Bahasa Indonesia tidak ditemukan. Kontrak batal demi hukum (void ab initio) per Putusan MA No. 1570 K/Pdt/2015.");
  }

  // 2. Presence of Foreign Language Counterpart
  const hasEnglishVersion = Boolean(engClean);

  // 3. Prevailing Language Clause Evaluation
  const fullText = (indoClean + ' ' + engClean).toLowerCase();

  const specifiesBahasaPrevails = fullText.includes('bahasa indonesia yang berlaku') ||
                                 fullText.includes('versi bahasa indonesia yang akan berlaku') ||
                                 fullText.includes('indonesian language shall prevail');

  const specifiesEnglishPrevails = fullText.includes('english version shall prevail') ||
                                  fullText.includes('bahasa inggris yang berlaku') ||
                                  fullText.includes('english shall govern');

  if (specifiesEnglishPrevails && !specifiesBahasaPrevails) {
    prevailingLanguage = 'ENGLISH_CONDITIONAL';
    warnings.push("PERINGATAN YURISPRUDENSI: Klausul Bahasa Inggris berlaku dapat ditentang di Pengadilan Negeri Indonesia jika salah satu pihak adalah entitas berbadan hukum Indonesia (Perpres 63/2019 Pasal 26 ayat (4)).");
  } else if (specifiesBahasaPrevails) {
    prevailingLanguage = 'BAHASA_INDONESIA';
  } else if (hasEnglishVersion) {
    prevailingLanguage = 'UNDEFINED';
    warnings.push("KLAUSUL HILANG: Tidak ada klausul penentu bahasa yang berlaku jika terjadi perbedaan penafsiran antara teks Bahasa Indonesia dan Bahasa Inggris.");
  }

  // 4. Structural Article Count Parity
  const indoArticles = (indoClean.match(/(?:pasal|article)\s+\d+/gi) || []).length;
  const engArticles = (engClean.match(/(?:article|pasal)\s+\d+/gi) || []).length;

  if (hasEnglishVersion && Math.abs(indoArticles - engArticles) > 2) {
    warnings.push(`KETIDAKSETARAAN STRUKTUR: Jumlah pasal berbeda signifikan (Indonesia: ${indoArticles} pasal vs Inggris: ${engArticles} pasal). Potensi klausul asimetris.`);
  }

  return {
    isCompliant: isCompliant && warnings.length === 0,
    hasIndonesianVersion: Boolean(indoClean),
    hasEnglishVersion,
    prevailingLanguage,
    articleCountIndonesia: indoArticles,
    articleCountEnglish: engArticles,
    warningsCount: warnings.length,
    warnings,
    statutoryReference: "UU No. 24/2009 Pasal 31 jo. Perpres No. 63/2019 & SEMA No. 3/2015"
  };
}

module.exports = {
  verifyBilingualCompliance
};
