import assert from 'node:assert/strict';
import test from 'node:test';
import { recommend, scoreCareerDetailed, type CareerLike } from '../lib/recommendation-engine.ts';

const career = (overrides: Partial<CareerLike>): CareerLike => ({
  id:'1',slug:'career',title:'Career',category:'Công nghệ',description:'',salaryMin:20,salaryMax:35,
  demand:90,creativity:70,logic:90,communication:65,tags:'technology,coding,logic',roadmap:'A|B',
  ...overrides,
});

test('recommendations rank a matching technology career first', () => {
  const ranked = recommend([
    career({id:'tech',slug:'tech',title:'Tech'}),
    career({id:'creative',slug:'creative',title:'Creative',tags:'creative,content',logic:55,demand:70}),
  ], {interests:['technology'],skills:{coding:90},goals:['career-growth']});
  assert.equal(ranked[0].id,'tech');
  assert.ok(ranked[0].match > ranked[1].match);
});

test('score breakdown remains inside the 0-100 range', () => {
  const result=scoreCareerDetailed(career({}),{interests:['technology'],skills:{coding:75},goals:['good-job']});
  assert.ok(result.score>=0&&result.score<=100);
  for(const value of Object.values(result.breakdown))assert.ok(value>=0&&value<=100);
});
