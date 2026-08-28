import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateSkillGap, learningSequenceFromGap } from '../lib/skill-gap.ts';

test('skill gap ranks missing important skills first', () => {
  const gaps = calculateSkillGap(
    [
      { key: 'sql', name: 'SQL', importance: 90 },
      { key: 'excel', name: 'Excel', importance: 70 },
    ],
    [{ key: 'excel', level: 80 }],
  );
  assert.equal(gaps[0].key, 'sql');
  assert.equal(gaps[0].status, 'missing');
  assert.equal(gaps[1].status, 'strong');
});

test('learning sequence excludes already strong skills', () => {
  const sequence = learningSequenceFromGap(calculateSkillGap(
    [
      { key: 'sql', name: 'SQL', importance: 90 },
      { key: 'excel', name: 'Excel', importance: 70 },
    ],
    [{ key: 'excel', level: 80 }],
  ));
  assert.equal(sequence.length, 1);
  assert.equal(sequence[0].skill, 'SQL');
});
