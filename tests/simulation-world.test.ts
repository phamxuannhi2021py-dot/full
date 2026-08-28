import assert from 'node:assert/strict';
import test from 'node:test';
import { buildTemplateWorld, scoreWorldDecisions } from '../lib/simulation-world.ts';

test('simulation worlds differ by profession', () => {
  const data = buildTemplateWorld({
    title: 'Data Analyst',
    category: 'Data',
    description: 'Analyze business data',
    tags: 'data,analysis,logic',
    requiredSkills: 'SQL,Excel,Statistics',
  });
  const security = buildTemplateWorld({
    title: 'Cybersecurity Analyst',
    category: 'Information Technology',
    description: 'Investigate security alerts',
    tags: 'security,logs,incident',
    requiredSkills: 'SIEM,Networking,Linux',
  });
  assert.notEqual(data.scenario, security.scenario);
  assert.ok(security.artifacts.some((artifact) => artifact.type === 'alert'));
});

test('branching decisions affect deterministic score', () => {
  const world = buildTemplateWorld({
    title: 'Cybersecurity Analyst',
    category: 'Information Technology',
    description: 'Investigate security alerts',
    tags: 'security,logs,incident',
    requiredSkills: 'SIEM,Networking,Linux',
  });
  const weak = scoreWorldDecisions(world, ['ignore', 'vague']);
  const strong = scoreWorldDecisions(world, ['investigate', 'evidence']);
  assert.ok(strong.score > weak.score);
  assert.ok(strong.consequences.length > 0);
});
