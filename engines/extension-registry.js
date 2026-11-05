/**
 * Indonesia Business Agent Skills — Extension Registry Engine
 *
 * Provides a pure Node.js, zero-dependency, pluggable interface for
 * domain-specific vertical extensions (e.g., Pharma, Logistics, Mining)
 * while preserving the clean, lightweight, non-bloated core architecture.
 */

const registeredExtensions = new Map();

/**
 * Validate an extension manifest against strict contract schema.
 * @param {Object} manifest
 */
function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Extension manifest must be a non-null object.');
  }

  const { id, name, version, domain, skills, engines, rules } = manifest;

  if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(
      `Invalid extension ID "${id}". ID must be a kebab-case string (e.g., "pharma-id", "logistics-id").`
    );
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Extension "name" must be a non-empty string.');
  }

  if (typeof version !== 'string' || version.trim().length === 0) {
    throw new Error('Extension "version" must be a non-empty string.');
  }

  if (typeof domain !== 'string' || domain.trim().length === 0) {
    throw new Error('Extension "domain" must be a non-empty string.');
  }

  if (!Array.isArray(skills)) {
    throw new Error('Extension "skills" must be an array of skill definitions.');
  }

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    if (!skill || typeof skill !== 'object') {
      throw new Error(`Extension skill at index ${i} must be a valid object.`);
    }
    const skillId = skill.id || skill.name;
    if (typeof skillId !== 'string' || skillId.trim().length === 0) {
      throw new Error(`Extension skill at index ${i} must have an "id" or "name" string.`);
    }
    if (typeof skill.description !== 'string' || skill.description.trim().length === 0) {
      throw new Error(`Extension skill "${skillId}" must have a non-empty "description".`);
    }
  }

  if (engines !== undefined && engines !== null) {
    if (typeof engines !== 'object' || Array.isArray(engines)) {
      throw new Error('Extension "engines" must be a key-value object of functions.');
    }
    for (const [engineName, fn] of Object.entries(engines)) {
      if (typeof fn !== 'function') {
        throw new Error(`Extension engine "${engineName}" must be a function.`);
      }
    }
  }

  if (rules !== undefined && rules !== null) {
    if (typeof rules !== 'object' || Array.isArray(rules)) {
      throw new Error('Extension "rules" must be a key-value object.');
    }
  }
}

/**
 * Register a new extension into the core runtime.
 * @param {Object} manifest Extension manifest
 * @returns {Object} Registration receipt
 */
function registerExtension(manifest) {
  validateManifest(manifest);

  if (registeredExtensions.has(manifest.id)) {
    throw new Error(
      `Extension with ID "${manifest.id}" is already registered. Call unregisterExtension("${manifest.id}") first if updating.`
    );
  }

  // Clone manifest shallowly to freeze metadata
  const storedManifest = {
    ...manifest,
    registeredAt: new Date().toISOString()
  };

  registeredExtensions.set(manifest.id, storedManifest);

  return {
    success: true,
    extensionId: manifest.id,
    name: manifest.name,
    version: manifest.version,
    domain: manifest.domain,
    skillCount: manifest.skills.length,
    engineCount: manifest.engines ? Object.keys(manifest.engines).length : 0,
    registeredAt: storedManifest.registeredAt
  };
}

/**
 * Retrieve a registered extension by ID.
 * @param {string} id
 * @returns {Object|null}
 */
function getExtension(id) {
  if (typeof id !== 'string') return null;
  return registeredExtensions.get(id) || null;
}

/**
 * Check if an extension is registered.
 * @param {string} id
 * @returns {boolean}
 */
function hasExtension(id) {
  if (typeof id !== 'string') return false;
  return registeredExtensions.has(id);
}

/**
 * List all currently registered extensions.
 * @returns {Array<Object>}
 */
function listExtensions() {
  const list = [];
  for (const [id, ext] of registeredExtensions.entries()) {
    list.push({
      id: ext.id,
      name: ext.name,
      version: ext.version,
      domain: ext.domain,
      author: ext.author || null,
      license: ext.license || 'AGPL-3.0-or-later',
      skillCount: ext.skills.length,
      engineNames: ext.engines ? Object.keys(ext.engines) : [],
      skills: ext.skills.map(s => ({
        id: s.id || s.name,
        name: s.name || s.id,
        description: s.description
      })),
      registeredAt: ext.registeredAt
    });
  }
  return list;
}

/**
 * Unregister an extension by ID.
 * @param {string} id
 * @returns {boolean}
 */
function unregisterExtension(id) {
  if (typeof id !== 'string') return false;
  return registeredExtensions.delete(id);
}

/**
 * Clear all registered extensions (primarily for testing and resets).
 */
function clearExtensions() {
  registeredExtensions.clear();
}

/**
 * Find a skill across all registered extensions.
 * @param {string} skillId
 * @returns {Object|null}
 */
function getExtensionSkill(skillId) {
  if (typeof skillId !== 'string') return null;
  for (const ext of registeredExtensions.values()) {
    const found = ext.skills.find(s => (s.id || s.name) === skillId);
    if (found) {
      return {
        ...found,
        extensionId: ext.id,
        extensionName: ext.name
      };
    }
  }
  return null;
}

/**
 * Find an engine function across all registered extensions.
 * @param {string} engineName
 * @returns {Function|null}
 */
function getExtensionEngine(engineName) {
  if (typeof engineName !== 'string') return null;
  for (const ext of registeredExtensions.values()) {
    if (ext.engines && typeof ext.engines[engineName] === 'function') {
      return ext.engines[engineName];
    }
  }
  return null;
}

/**
 * Execute an extension engine by name.
 * @param {string} engineName
 * @param  {...any} args
 * @returns {any}
 */
function executeExtensionEngine(engineName, ...args) {
  const fn = getExtensionEngine(engineName);
  if (!fn) {
    throw new Error(`Extension engine "${engineName}" not found in any registered extension.`);
  }
  return fn(...args);
}

module.exports = {
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
};
