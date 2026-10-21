/**
 * Algorithmic NIK & NPWP 16-Digit Identity Validator (`engines/identity-validator.js`)
 *
 * Implements deterministic validation and normalization per:
 *   - UU No. 7/2021 (HPP)
 *   - PMK No. 112/PMK.03/2022 (NPWP 16 Digit Format & NIK-NPWP Integration)
 *   - PER-06/PJ/2024 (Tata Cara Penggunaan NIK sebagai NPWP)
 *
 * Zero external dependencies. Pure Node.js.
 */

// Valid Indonesian Province Codes (Kemendagri standard 11 - 94)
const VALID_PROVINCE_CODES = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '21',
  '31', '32', '33', '34', '35', '36', '51', '52', '53', '61',
  '62', '63', '64', '65', '71', '72', '73', '74', '75', '76',
  '81', '82', '91', '92', '93', '94'
]);

function sanitizeDigits(val) {
  if (typeof val !== 'string' && typeof val !== 'number') return '';
  return String(val).replace(/\D/g, '');
}

/**
 * Validates 16-digit Nomor Induk Kependudukan (NIK).
 */
function validateNik(nikInput) {
  const digits = sanitizeDigits(nikInput);

  if (digits.length !== 16) {
    return {
      isValid: false,
      nik: digits,
      error: `NIK must be exactly 16 numeric digits (received ${digits.length})`
    };
  }

  // Reject dummy repeating digits
  if (/^(\d)\1{15}$/.test(digits) || digits === '1234567890123456') {
    return {
      isValid: false,
      nik: digits,
      error: "NIK cannot be a repeating or trivial test sequence"
    };
  }

  const prov = digits.slice(0, 2);
  if (!VALID_PROVINCE_CODES.has(prov)) {
    return {
      isValid: false,
      nik: digits,
      error: `Invalid province code '${prov}' in NIK`
    };
  }

  // Birth date decode (DDMMYY)
  const rawDay = parseInt(digits.slice(6, 8), 10);
  const month = parseInt(digits.slice(8, 10), 10);
  const year2 = parseInt(digits.slice(10, 12), 10);

  let isFemale = false;
  let day = rawDay;

  // Indonesian female NIK rule: birth day is incremented by 40
  if (rawDay > 40) {
    isFemale = true;
    day = rawDay - 40;
  }

  if (day < 1 || day > 31) {
    return {
      isValid: false,
      nik: digits,
      error: `Invalid birth day '${day}' decoded from NIK`
    };
  }

  if (month < 1 || month > 12) {
    return {
      isValid: false,
      nik: digits,
      error: `Invalid birth month '${month}' decoded from NIK`
    };
  }

  return {
    isValid: true,
    nik: digits,
    provinceCode: prov,
    isFemale,
    birthDay: day,
    birthMonth: month,
    birthYearShort: year2,
    statutoryReference: "UU No. 24/2013 jo. PMK No. 112/PMK.03/2022"
  };
}

/**
 * Validates and normalizes 15-digit & 16-digit NPWP (Coretax standard).
 */
function validateNpwp(npwpInput) {
  const digits = sanitizeDigits(npwpInput);

  if (digits.length !== 15 && digits.length !== 16) {
    return {
      isValid: false,
      rawInput: String(npwpInput),
      error: `NPWP must be 15 digits (legacy) or 16 digits (Coretax) (received ${digits.length} digits)`
    };
  }

  // Reject repeating dummy digits
  if (/^(\d)\1+$/.test(digits)) {
    return {
      isValid: false,
      rawInput: String(npwpInput),
      error: "NPWP cannot be a repeating dummy sequence"
    };
  }

  let npwp16 = '';
  let npwp15 = '';
  let isConvertedFrom15 = false;

  if (digits.length === 15) {
    // PMK 112/2022: 15-digit NPWP converts to 16-digit by prepending '0'
    npwp15 = digits;
    npwp16 = '0' + digits;
    isConvertedFrom15 = true;
  } else {
    npwp16 = digits;
    // If it starts with 0, 15-digit legacy is the trailing 15 digits
    npwp15 = digits.startsWith('0') ? digits.slice(1) : digits.slice(0, 15);
  }

  const formatted15 = `${npwp15.slice(0, 2)}.${npwp15.slice(2, 5)}.${npwp15.slice(5, 8)}.${npwp15.slice(8, 9)}-${npwp15.slice(9, 12)}.${npwp15.slice(12, 15)}`;
  const formatted16 = `${npwp16.slice(0, 4)} ${npwp16.slice(4, 8)} ${npwp16.slice(8, 12)} ${npwp16.slice(12, 16)}`;

  return {
    isValid: true,
    npwp16,
    npwp15,
    formatted15,
    formatted16,
    isConvertedFrom15,
    isCoretaxReady: true,
    statutoryReference: "PMK No. 112/PMK.03/2022 & PER-06/PJ/2024"
  };
}

/**
 * Normalizes either NIK or NPWP into a standard identity verification object.
 */
function normalizeTaxIdentity(taxIdentityInput) {
  const digits = sanitizeDigits(taxIdentityInput);

  if (digits.length === 16) {
    const nikCheck = validateNik(digits);
    if (nikCheck.isValid) {
      return {
        identityType: 'NIK_16',
        value: digits,
        isValid: true,
        details: nikCheck
      };
    }
    const npwpCheck = validateNpwp(digits);
    return {
      identityType: 'NPWP_16',
      value: digits,
      isValid: npwpCheck.isValid,
      details: npwpCheck
    };
  } else if (digits.length === 15) {
    const npwpCheck = validateNpwp(digits);
    return {
      identityType: 'NPWP_15_LEGACY',
      value: npwpCheck.npwp16,
      isValid: npwpCheck.isValid,
      details: npwpCheck
    };
  }

  return {
    identityType: 'INVALID',
    value: String(taxIdentityInput || ''),
    isValid: false,
    error: `Expected 15 or 16 numeric digits (got ${digits.length})`
  };
}

module.exports = {
  validateNik,
  validateNpwp,
  normalizeTaxIdentity,
  VALID_PROVINCE_CODES
};
