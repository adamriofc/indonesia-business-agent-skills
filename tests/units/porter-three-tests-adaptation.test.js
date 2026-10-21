const assert = require('assert');
const { checkFrameworkApplicability } = require('../../engines/framework-applicability');
const { applyStrategicProtocol } = require('../../engines/strategic-protocol');

function runPorterThreeTestsAdaptationTests() {
  console.log("🎓 Running Porter's Three Tests Capacity & Digital Service Adaptation Tests...\n");

  // 1. Capacity Service (EdTech / Bimbel / Kursus: KBLI 85499)
  // Adapted to Platform Setup Cost vs Slot/Capacity Utilization Model
  const capacityRes = checkFrameworkApplicability({
    frameworkName: 'porter-three-tests',
    kbliCode: '85499'
  });
  assert.strictEqual(capacityRes.businessArchetype, 'CAPACITY_SERVICE');
  assert.strictEqual(capacityRes.applicabilityStatus, 'ADAPTABLE');
  assert.strictEqual(capacityRes.recommendationLevel, 'ADAPTABLE');
  assert.strictEqual(capacityRes.unitOfAnalysis, 'TECH_PLATFORM_VS_CAPACITY_SLOT');
  assert.ok(capacityRes.recommendedMetric.includes('Capacity Utilization Model'));

  // 2. Product Manufacturing (KBLI 10799)
  // Native physical plant scale & asset acquisition premium
  const productRes = checkFrameworkApplicability({
    frameworkName: 'porter-three-tests',
    kbliCode: '10799'
  });
  assert.strictEqual(productRes.businessArchetype, 'PRODUCT_MANUFACTURING');
  assert.strictEqual(productRes.applicabilityStatus, 'NATIVE');
  assert.strictEqual(productRes.unitOfAnalysis, 'PHYSICAL_ASSET_AND_PLANT_LINE');

  // 3. Strategic Protocol Execution for porter-three-tests
  const protocolRes = applyStrategicProtocol({
    frameworkName: 'porter-three-tests',
    kbliCode: '85499',
    activityName: 'Jasa Bimbingan Belajar dan Kursus Online'
  });
  assert.strictEqual(protocolRes.applicability.status, 'ADAPTABLE');
  assert.ok(protocolRes.applicability.applicabilityNote.includes('capacity utilization model'));

  // 4. Quantitative SWOT Applicability & Protocol Verification
  const swotMfg = checkFrameworkApplicability({
    frameworkName: 'quantitative-swot',
    kbliCode: '10710'
  });
  assert.strictEqual(swotMfg.businessArchetype, 'PRODUCT_MANUFACTURING');
  assert.strictEqual(swotMfg.applicabilityStatus, 'NATIVE');
  assert.strictEqual(swotMfg.unitOfAnalysis, 'PHYSICAL_PRODUCT_LINE');

  const swotServiceProto = applyStrategicProtocol({
    frameworkName: 'quantitative-swot',
    kbliCode: '70209',
    activityName: 'Konsultasi Manajemen'
  });
  assert.strictEqual(swotServiceProto.applicability.status, 'ADAPTABLE');

  // 5. Balanced Scorecard Applicability & Protocol Verification
  const bscMfg = checkFrameworkApplicability({
    frameworkName: 'balanced-scorecard',
    kbliCode: '10710'
  });
  assert.strictEqual(bscMfg.businessArchetype, 'PRODUCT_MANUFACTURING');
  assert.strictEqual(bscMfg.applicabilityStatus, 'NATIVE');
  assert.strictEqual(bscMfg.unitOfAnalysis, 'MANUFACTURING_OPERATIONS_SCORECARD');

  const bscServiceProto = applyStrategicProtocol({
    frameworkName: 'balanced-scorecard',
    kbliCode: '70209',
    activityName: 'Konsultasi Manajemen'
  });
  assert.strictEqual(bscServiceProto.applicability.status, 'ADAPTABLE');

  console.log("✅ Porter's Three Tests Adaptation Tests PASSED 100%!");
}

runPorterThreeTestsAdaptationTests();
