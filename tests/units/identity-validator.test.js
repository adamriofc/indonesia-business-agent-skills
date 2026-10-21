const assert = require('assert');
const { validateNik, validateNpwp, normalizeTaxIdentity } = require('../../engines/identity-validator');

function runIdentityValidatorTests() {
  console.log("🔍 Running NIK & NPWP 16-Digit Identity Validator Tests...\n");

  // 1. Valid Male NIK
  // Province 31 (DKI Jakarta), male day 15, month 08, year 90
  const validMaleNik = "3171011508900001";
  const maleRes = validateNik(validMaleNik);
  assert.strictEqual(maleRes.isValid, true);
  assert.strictEqual(maleRes.isFemale, false);
  assert.strictEqual(maleRes.birthDay, 15);
  assert.strictEqual(maleRes.birthMonth, 8);
  assert.strictEqual(maleRes.provinceCode, "31");

  // 2. Valid Female NIK
  // Day 15 + 40 = 55
  const validFemaleNik = "3273015508920002";
  const femaleRes = validateNik(validFemaleNik);
  assert.strictEqual(femaleRes.isValid, true);
  assert.strictEqual(femaleRes.isFemale, true);
  assert.strictEqual(femaleRes.birthDay, 15);
  assert.strictEqual(femaleRes.birthMonth, 8);

  // 3. Invalid NIK (length != 16, dummy sequence, invalid province)
  assert.strictEqual(validateNik("12345").isValid, false);
  assert.strictEqual(validateNik("0000000000000000").isValid, false);
  assert.strictEqual(validateNik("9999999999999999").isValid, false); // 99 is invalid province

  // 4. NPWP 15-to-16 Coretax Conversion
  const legacyNpwp = "01.234.567.8-123.000";
  const npwpRes = validateNpwp(legacyNpwp);
  assert.strictEqual(npwpRes.isValid, true);
  assert.strictEqual(npwpRes.isConvertedFrom15, true);
  assert.strictEqual(npwpRes.npwp16, "0012345678123000");

  // 5. NPWP 16 Coretax Format
  const coretaxNpwp = "0012345678123000";
  const coretaxRes = validateNpwp(coretaxNpwp);
  assert.strictEqual(coretaxRes.isValid, true);
  assert.strictEqual(coretaxRes.isConvertedFrom15, false);

  // 6. Normalize Identity
  const normNik = normalizeTaxIdentity(validMaleNik);
  assert.strictEqual(normNik.isValid, true);
  assert.strictEqual(normNik.identityType, "NIK_16");

  const normNpwp = normalizeTaxIdentity(legacyNpwp);
  assert.strictEqual(normNpwp.isValid, true);
  assert.strictEqual(normNpwp.identityType, "NPWP_15_LEGACY");

  console.log("✅ Identity Validator Tests PASSED 100%!");
}

runIdentityValidatorTests();
