const fs = require('fs');
const path = require('path');

function discoverPlugins(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const plugins = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !['engines', 'scripts', 'tests', 'fixtures', 'docs', '.git', '.github', 'node_modules'].includes(entry.name)) {
      const manifestPath = path.join(rootDir, entry.name, '.claude-plugin', 'plugin.json');
      if (fs.existsSync(manifestPath)) {
        plugins.push(entry.name);
      }
    }
  }

  return plugins;
}

function parseYamlFrontmatter(yamlStr) {
  const lines = yamlStr.split('\n');
  const result = {};
  let currentTopKey = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const isIndented = /^\s+/.test(rawLine);

    if (isIndented && currentTopKey) {
      // Sub-key inside current top key object
      const trimmed = rawLine.trim();
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const subKey = trimmed.slice(0, colonIdx).trim();
        const rawSubVal = trimmed.slice(colonIdx + 1).trim();

        // Strict YAML syntax check for flow sequences with illegal nested brackets
        if (rawSubVal.startsWith('[') && rawSubVal.endsWith(']')) {
          const inner = rawSubVal.slice(1, -1).trim();
          // detect illegal unquoted nested brackets like [<a b> [c]] without comma or quotes
          if (/\[[^\]]*\]/.test(inner) && !/^\s*"/.test(inner) && !/^\s*'/.test(inner) && !inner.includes('","') && !inner.includes("','")) {
            throw new Error(`Invalid YAML flow sequence at line ${i + 1}: unquoted nested bracket detected in "${trimmed}"`);
          }
        }

        const subVal = rawSubVal.replace(/^['"]|['"]$/g, '');
        if (typeof result[currentTopKey] !== 'object' || result[currentTopKey] === null) {
          result[currentTopKey] = {};
        }
        result[currentTopKey][subKey] = subVal;
      }
      continue;
    }

    const trimmed = rawLine.trim();
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const rawVal = trimmed.slice(colonIdx + 1).trim();

    // Strict YAML syntax check: unquoted colons in values (e.g. key: <foo: bar>)
    if (rawVal && !rawVal.startsWith('"') && !rawVal.startsWith("'") && !rawVal.startsWith('[') && rawVal.includes(': ')) {
      throw new Error(`Invalid YAML scalar at line ${i + 1}: unquoted colon in value "${trimmed}"`);
    }

    const value = rawVal.replace(/^['"]|['"]$/g, '');

    if (key) {
      currentTopKey = key;
      result[key] = value || {};
    }
  }

  return result;
}

function validate() {
  console.log("🔍 Running Dynamic Plugin & Skill Schema Validation...\n");
  let errors = 0;
  let totalSkills = 0;
  const skillCountByPlugin = {};

  const rootDir = path.join(__dirname, '../..');
  const plugins = discoverPlugins(rootDir);

  if (plugins.length === 0) {
    console.error("❌ No plugin directories discovered!");
    process.exit(1);
  }

  console.log(`  Discovered ${plugins.length} plugin(s): ${plugins.join(', ')}`);

  plugins.forEach(plugin => {
    const pluginDir = path.join(rootDir, plugin);

    // Validate plugin.json Manifest Schema
    const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Strict Manifest Keys Validation
      if (!manifest.name || typeof manifest.name !== 'string' || manifest.name.trim() === '') {
        console.error(`❌ Manifest Schema Violation in ${manifestPath}: 'name' is required and must be a non-empty string.`);
        errors++;
      }
      
      if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
        console.error(`❌ Manifest Schema Violation in ${manifestPath}: 'version' must follow strict SemVer formatting (e.g. 1.0.0). Got: "${manifest.version}"`);
        errors++;
      }
      
      if (!manifest.description || typeof manifest.description !== 'string' || manifest.description.length < 10) {
        console.error(`❌ Manifest Schema Violation in ${manifestPath}: 'description' is too short or missing.`);
        errors++;
      }

      if (!manifest.author || typeof manifest.author !== 'object' || !manifest.author.name) {
        console.error(`❌ Manifest Schema Violation in ${manifestPath}: 'author.name' is required.`);
        errors++;
      }
    } catch (e) {
      console.error(`❌ JSON syntax error in ${manifestPath}: ${e.message}`);
      errors++;
    }

    // Validate Skills Frontmatter Schemas
    const skillsDir = path.join(pluginDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir);
      skills.forEach(skillDirName => {
        const skillFilePath = path.join(skillsDir, skillDirName, 'SKILL.md');
        if (!fs.existsSync(skillFilePath)) {
          console.error(`❌ Missing SKILL.md for skill: ${skillDirName} in ${plugin}`);
          errors++;
          return;
        }

        const content = fs.readFileSync(skillFilePath, 'utf8');
        if (!content.startsWith('---')) {
          console.error(`❌ Missing YAML frontmatter block in ${skillFilePath}`);
          errors++;
          return;
        }

        const parts = content.split('---');
        if (parts.length < 3) {
          console.error(`❌ Invalid YAML frontmatter delimiters in ${skillFilePath}`);
          errors++;
          return;
        }

        // Strict YAML Frontmatter & Agent Skills Standard Specification Parser
        try {
          const frontmatter = parseYamlFrontmatter(parts[1]);
          
          // 1. Name validation: required, <= 64 chars, lowercase kebab-case, must match directory name
          if (!frontmatter.name || frontmatter.name.trim() === '') {
            console.error(`❌ Skill Schema Violation in ${skillFilePath}: 'name' must be a non-empty string in frontmatter.`);
            errors++;
          } else {
            if (frontmatter.name.length > 64) {
              console.error(`❌ Skill Schema Violation in ${skillFilePath}: 'name' exceeds 64 characters (${frontmatter.name.length}).`);
              errors++;
            }
            if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
              console.error(`❌ Skill Schema Violation in ${skillFilePath}: 'name' must be lowercase kebab-case. Got: "${frontmatter.name}"`);
              errors++;
            }
            if (frontmatter.name !== skillDirName) {
              console.error(`❌ Skill Schema Violation in ${skillFilePath}: 'name' ("${frontmatter.name}") does not match directory name ("${skillDirName}").`);
              errors++;
            }
          }
          
          // 2. Description validation: required, 10 to 1024 chars
          if (!frontmatter.description || frontmatter.description.trim() === '') {
            console.error(`❌ Skill Schema Violation in ${skillFilePath}: 'description' must be a non-empty string in frontmatter.`);
            errors++;
          } else {
            if (frontmatter.description.length < 10 || frontmatter.description.length > 1024) {
              console.error(`❌ Skill Schema Violation in ${skillFilePath}: 'description' length must be between 10 and 1024 characters. Got ${frontmatter.description.length}.`);
              errors++;
            }
          }

          // 3. Frontmatter Keys & Capability Contract Validation
          const ALLOWED_KEYS = ['name', 'description', 'argument-hint', 'risk_level', 'rule_type', 'quality_tier', 'metadata', 'allowed-tools', 'license', 'compatibility', 'capability'];
          Object.keys(frontmatter).forEach(key => {
            if (!ALLOWED_KEYS.includes(key)) {
              console.warn(`⚠️ Warning in ${skillFilePath}: non-standard frontmatter key '${key}'. Custom metadata should be placed inside 'metadata:'.`);
            }
          });

          // 4. Agent Capability Contract Validation
          if (!frontmatter.capability || typeof frontmatter.capability !== 'object') {
            console.error(`❌ Agent Capability Contract Violation in ${skillFilePath}: 'capability' metadata block missing or invalid.`);
            errors++;
          } else {
            if (!frontmatter.capability.requires) {
              console.error(`❌ Agent Capability Contract Violation in ${skillFilePath}: 'capability.requires' is required.`);
              errors++;
            }
            if (!frontmatter.capability.produces) {
              console.error(`❌ Agent Capability Contract Violation in ${skillFilePath}: 'capability.produces' is required.`);
              errors++;
            }
          }
        } catch (err) {
          console.error(`❌ YAML Frontmatter parse error in ${skillFilePath}: ${err.message}`);
          errors++;
        }

        totalSkills++;
      });
      skillCountByPlugin[plugin] = skills.filter(s => fs.existsSync(path.join(skillsDir, s, 'SKILL.md'))).length;
    }
  });

  // Validate registry/index.json machine-readable index
  const registryPath = path.join(rootDir, 'registry', 'index.json');
  const packagePath = path.join(rootDir, 'package.json');
  const packageLockPath = path.join(rootDir, 'package-lock.json');
  let loadedRegistry = null;

  if (fs.existsSync(registryPath) && fs.existsSync(packagePath)) {
    try {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      loadedRegistry = registry;
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const packageLockJson = fs.existsSync(packageLockPath) ? JSON.parse(fs.readFileSync(packageLockPath, 'utf8')) : null;

      // Automated Version & Header Consistency Enforcer
      if (registry.version !== packageJson.version) {
        console.error(`❌ Registry Version Mismatch: registry index version ("${registry.version}") does not match package.json version ("${packageJson.version}").`);
        errors++;
      }

      if (packageLockJson && packageLockJson.version !== packageJson.version) {
        console.error(`❌ Lockfile Version Mismatch: package-lock.json version ("${packageLockJson.version}") does not match package.json version ("${packageJson.version}").`);
        errors++;
      }

      if (registry.total_skills !== totalSkills) {
        console.error(`❌ Registry Skill Count Mismatch: registry header total_skills is ${registry.total_skills}, but discovered ${totalSkills} skill files.`);
        errors++;
      }

      if (!registry.skills || !Array.isArray(registry.skills)) {
        console.error(`❌ Machine-Readable Registry Violation in ${registryPath}: 'skills' array is required.`);
        errors++;
      } else if (registry.skills.length !== totalSkills) {
        console.error(`❌ Machine-Readable Registry Mismatch: registry index array has ${registry.skills.length} skills, but discovered ${totalSkills} skill files.`);
        errors++;
      } else {
        console.log(`  Machine-readable skill registry verified (${registry.skills.length} registered skills, version ${registry.version}).`);
      }

      // Cross-field registry validation: every entry must resolve to a real skill file
      const seenIds = new Set();
      registry.skills.forEach(entry => {
        const entryLabel = `registry entry "${entry.id || entry.name || '(unnamed)'}"`;

        if (typeof entry.id !== 'string' || entry.id.trim() === '') {
          console.error(`❌ Registry Violation: ${entryLabel} must have a non-empty string 'id'.`);
          errors++;
          return;
        }
        if (seenIds.has(entry.id)) {
          console.error(`❌ Registry Violation: duplicate skill id "${entry.id}" in registry/index.json.`);
          errors++;
          return;
        }
        seenIds.add(entry.id);

        if (entry.name !== entry.id) {
          console.error(`❌ Registry Violation: ${entryLabel} has 'name' ("${entry.name}") that does not match its 'id' ("${entry.id}").`);
          errors++;
        }

        if (typeof entry.plugin !== 'string' || !plugins.includes(entry.plugin)) {
          console.error(`❌ Registry Violation: ${entryLabel} references unknown plugin "${entry.plugin}".`);
          errors++;
          return;
        }

        const skillFilePath = path.join(rootDir, entry.plugin, 'skills', entry.id, 'SKILL.md');
        if (!fs.existsSync(skillFilePath)) {
          console.error(`❌ Registry Violation: ${entryLabel} has no matching skill file at ${entry.plugin}/skills/${entry.id}/SKILL.md.`);
          errors++;
          return;
        }

        const content = fs.readFileSync(skillFilePath, 'utf8');
        const parts = content.split('---');
        if (parts.length < 3) {
          console.error(`❌ Registry Violation: ${entryLabel} skill file has invalid frontmatter delimiters.`);
          errors++;
          return;
        }
        const frontmatter = parseYamlFrontmatter(parts[1]);

        if (frontmatter.name !== entry.id) {
          console.error(`❌ Registry Violation: ${entryLabel} frontmatter name ("${frontmatter.name}") does not match registry id.`);
          errors++;
        }
        if (frontmatter.risk_level && frontmatter.risk_level !== entry.risk_level) {
          console.error(`❌ Registry Violation: ${entryLabel} frontmatter risk_level ("${frontmatter.risk_level}") does not match registry entry ("${entry.risk_level}").`);
          errors++;
        }
        if (frontmatter.rule_type && frontmatter.rule_type !== entry.rule_type) {
          console.error(`❌ Registry Violation: ${entryLabel} frontmatter rule_type ("${frontmatter.rule_type}") does not match registry entry ("${entry.rule_type}").`);
          errors++;
        }
        if (frontmatter.quality_tier && frontmatter.quality_tier !== entry.quality_tier) {
          console.error(`❌ Registry Violation: ${entryLabel} frontmatter quality_tier ("${frontmatter.quality_tier}") does not match registry entry ("${entry.quality_tier}").`);
          errors++;
        }

        if (entry.engine && typeof entry.engine === 'string') {
          if (!fs.existsSync(path.join(rootDir, entry.engine))) {
            console.error(`❌ Registry Violation: ${entryLabel} references missing engine file "${entry.engine}".`);
            errors++;
          }
        } else if (entry.engine !== null && entry.engine !== undefined) {
          console.error(`❌ Registry Violation: ${entryLabel} 'engine' must be a string path or null. Got: ${JSON.stringify(entry.engine)}`);
          errors++;
        }
      });
    } catch (e) {
      console.error(`❌ Machine-Readable Registry JSON error in ${registryPath}: ${e.message}`);
      errors++;
    }
  }

  // Validate README plugin inventory counts against discovered skills (prevents stale catalog)
  const readmePath = path.join(rootDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const countByPlugin = {};
    plugins.forEach(p => { countByPlugin[p] = 0; });

    // ### N. `plugin-name`: Title (X Skills)
    const inventoryRegex = /^### \d+\. `([a-z0-9-]+)`:[^(]*\((\d+) Skills?\)$/gm;
    let match;
    while ((match = inventoryRegex.exec(readme)) !== null) {
      const pluginName = match[1];
      const claimedCount = parseInt(match[2], 10);
      if (!countByPlugin.hasOwnProperty(pluginName)) {
        console.error(`❌ README Inventory Violation: section lists unknown plugin "${pluginName}".`);
        errors++;
        continue;
      }
      countByPlugin[pluginName]++;
      if (claimedCount !== skillCountByPlugin[pluginName]) {
        console.error(`❌ README Inventory Violation: ${pluginName} claims ${claimedCount} skills but ${skillCountByPlugin[pluginName]} discovered on disk.`);
        errors++;
      }
    }
    const listed = Object.keys(countByPlugin).filter(p => !countByPlugin[p]);
    if (listed.length > 0) {
      console.error(`❌ README Inventory Violation: no inventory section found for plugin(s): ${listed.join(', ')}.`);
      errors++;
    }
    // Strict Plugin Section Non-Empty Content Enforcer
    plugins.forEach(p => {
      const pluginHeaderRegex = new RegExp(`### \\d+\\.\\s+\`?${p}\`?:[^\n]+\n([\\s\\S]*?)(?=\n### |\\n---|$)`);
      const sectionMatch = readme.match(pluginHeaderRegex);
      if (!sectionMatch) {
        console.error(`❌ README Layout Violation: Missing section header for plugin "${p}".`);
        errors++;
      } else {
        const sectionContent = sectionMatch[1];
        const bulletCount = (sectionContent.match(/^\*\s+`[a-z0-9-]+`/gm) || []).length;
        if (bulletCount !== skillCountByPlugin[p]) {
          console.error(`❌ README Layout Violation: Plugin "${p}" header has ${bulletCount} listed skills in README body, but ${skillCountByPlugin[p]} exist on disk.`);
          errors++;
        }
      }
    });

    // Strict Stale Taxonomy Enforcer: Reject old plugin names across docs & manifests
    const STALE_PLUGINS = ['tax-payroll-id', 'ecommerce-id', 'content-lokal-id'];
    STALE_PLUGINS.forEach(stale => {
      if (readme.includes(stale)) {
        console.error(`❌ Stale Taxonomy Violation: README.md still contains reference to deleted plugin "${stale}".`);
        errors++;
      }
    });

    // Strict Overview Narrative Sync Enforcer
    const overviewSkillsMatch = readme.match(/integrates \*\*(\d+) Agent Skills\*\*/);
    if (overviewSkillsMatch) {
      const overviewSkillsCount = parseInt(overviewSkillsMatch[1], 10);
      if (overviewSkillsCount !== totalSkills) {
        console.error(`❌ README Overview Violation: Overview claims ${overviewSkillsCount} Agent Skills, but discovered ${totalSkills} skill files.`);
        errors++;
      }
    }

    const overviewEnginesMatch = readme.match(/with \*\*(\d+) Deterministic Computational & Regulatory Diff Engines\*\*/);
    if (overviewEnginesMatch) {
      const overviewEnginesCount = parseInt(overviewEnginesMatch[1], 10);
      const expectedEngines = loadedRegistry ? loadedRegistry.total_engines : 27;
      if (overviewEnginesCount !== expectedEngines) {
        console.error(`❌ README Overview Violation: Overview claims ${overviewEnginesCount} engines, but registry lists ${expectedEngines} total_engines.`);
        errors++;
      }
    }
  }

  if (errors > 0) {
    console.error(`\n❌ Schema Validation failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    console.log(`✅ Schema Validation Passed: Discovered ${plugins.length} plugins & ${totalSkills} skills verified against strict schemas.`);
  }
}

validate();
