/**
 * Unit Tests for Extension Registry Engine
 * Verifies the pluggable zero-dependency extension architecture.
 */

const assert = require('assert');
const {
  registerExtension,
  getExtension,
  hasExtension,
  listExtensions,
  unregisterExtension,
  clearExtensions,
  getExtensionSkill,
  getExtensionEngine,
  executeExtensionEngine,
  validateManifest
} = require('../../engines/extension-registry');

console.log('🔌 Running Extension Registry & Pluggable Architecture Tests...\n');

// Reset before tests
clearExtensions();

// 1. Basic Registration & Lookup
console.log('  [1/6] Testing valid extension manifest registration & retrieval...');
const mockManifest = {
  id: 'pharma-id',
  name: 'Indonesia Pharma & Healthcare Extension',
  version: '1.0.0',
  domain: 'pharmaceutical',
  author: 'Adam Rifa\'i',
  license: 'AGPL-3.0-or-later',
  skills: [
    {
      id: 'bpom-nie-navigator',
      name: 'bpom-nie-navigator',
      description: 'Navigate BPOM drug registration pathways.'
    },
    {
      id: 'meso-pharmacovigilance',
      name: 'meso-pharmacovigilance',
      description: 'Triage adverse drug reactions and calculate BPOM 15-day SLA.'
    }
  ],
  engines: {
    calculateBpomPnbp: (category) => {
      if (category === 'NEW_DRUG') return 100000000;
      return 10000000;
    }
  },
  rules: {
    testRule: { key: 'value' }
  }
};

const receipt = registerExtension(mockManifest);
assert.strictEqual(receipt.success, true);
assert.strictEqual(receipt.extensionId, 'pharma-id');
assert.strictEqual(receipt.skillCount, 2);
assert.strictEqual(receipt.engineCount, 1);
assert.strictEqual(hasExtension('pharma-id'), true);
assert.strictEqual(hasExtension('non-existent'), false);

const retrieved = getExtension('pharma-id');
assert.strictEqual(retrieved.id, 'pharma-id');
assert.strictEqual(retrieved.name, mockManifest.name);
console.log('  ✓ Extension registered and retrieved successfully.');

// 2. Listing Extensions
console.log('  [2/6] Testing listExtensions()...');
const list = listExtensions();
assert.strictEqual(list.length, 1);
assert.strictEqual(list[0].id, 'pharma-id');
assert.strictEqual(list[0].skillCount, 2);
assert.deepStrictEqual(list[0].engineNames, ['calculateBpomPnbp']);
console.log('  ✓ listExtensions() returned accurate extension summaries.');

// 3. Extension Skill & Engine Discovery
console.log('  [3/6] Testing getExtensionSkill, getExtensionEngine & executeExtensionEngine...');
const skill = getExtensionSkill('bpom-nie-navigator');
assert.ok(skill);
assert.strictEqual(skill.id, 'bpom-nie-navigator');
assert.strictEqual(skill.extensionId, 'pharma-id');

const missingSkill = getExtensionSkill('non-existent-skill');
assert.strictEqual(missingSkill, null);

const engineFn = getExtensionEngine('calculateBpomPnbp');
assert.strictEqual(typeof engineFn, 'function');
assert.strictEqual(engineFn('NEW_DRUG'), 100000000);

const execResult = executeExtensionEngine('calculateBpomPnbp', 'NEW_DRUG');
assert.strictEqual(execResult, 100000000);

assert.throws(() => {
  executeExtensionEngine('nonExistentEngine');
}, /not found in any registered extension/);
console.log('  ✓ Dynamic skill and engine discovery & execution passed.');

// 4. Duplicate Registration Prevention
console.log('  [4/6] Testing duplicate ID collision rejection...');
assert.throws(() => {
  registerExtension(mockManifest);
}, /already registered/);
console.log('  ✓ Duplicate registration rejected with clear error.');

// 5. Schema Validation Boundaries (Fail-Closed)
console.log('  [5/6] Testing manifest schema boundary validations (fail-closed)...');
assert.throws(() => registerExtension(null), /non-null object/);
assert.throws(() => registerExtension({}), /Invalid extension ID/);
assert.throws(() => registerExtension({ id: 'Invalid ID' }), /Invalid extension ID/);
assert.throws(() => registerExtension({ id: 'valid-id' }), /name/);
assert.throws(() => registerExtension({ id: 'valid-id', name: 'Valid' }), /version/);
assert.throws(() => registerExtension({ id: 'valid-id', name: 'Valid', version: '1.0.0' }), /domain/);
assert.throws(() => registerExtension({ id: 'valid-id', name: 'Valid', version: '1.0.0', domain: 'test' }), /skills/);
assert.throws(() => registerExtension({
  id: 'valid-id',
  name: 'Valid',
  version: '1.0.0',
  domain: 'test',
  skills: [{ id: 'test' }] // missing description
}), /description/);
assert.throws(() => registerExtension({
  id: 'valid-id',
  name: 'Valid',
  version: '1.0.0',
  domain: 'test',
  skills: [{ id: 'test', description: 'test' }],
  engines: { invalidEngine: 'not-a-function' }
}), /must be a function/);
console.log('  ✓ All fail-closed schema checks passed.');

// 6. Unregister & Clear
console.log('  [6/6] Testing unregisterExtension & clearExtensions...');
assert.strictEqual(unregisterExtension('pharma-id'), true);
assert.strictEqual(hasExtension('pharma-id'), false);
assert.strictEqual(listExtensions().length, 0);
assert.strictEqual(unregisterExtension('pharma-id'), false); // already removed

// Re-register and clear
registerExtension(mockManifest);
assert.strictEqual(hasExtension('pharma-id'), true);
clearExtensions();
assert.strictEqual(hasExtension('pharma-id'), false);
assert.strictEqual(listExtensions().length, 0);
console.log('  ✓ Unregister and clear cycle verified cleanly.');

console.log('\n✅ All Extension Registry Tests PASSED 100%!\n');
