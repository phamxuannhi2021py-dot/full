import assert from 'node:assert/strict';
import test from 'node:test';
import { scoreSimulation, simulationQuestions } from '../lib/simulation-engine.ts';

test('simulation score is derived from answers',()=>{
  const high=scoreSimulation(simulationQuestions.map((question)=>({questionId:question.id,value:90})));
  const low=scoreSimulation(simulationQuestions.map((question)=>({questionId:question.id,value:30})));
  assert.equal(high.score,90);assert.equal(low.score,30);assert.ok(high.score>low.score);
});
