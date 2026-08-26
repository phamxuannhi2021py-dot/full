import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateReadiness } from '../lib/readiness.ts';

test('readiness increases as the profile is completed',()=>{
  const empty=calculateReadiness({profile:{},interests:[],skills:[],goals:[],simulations:[]});
  const complete=calculateReadiness({profile:{city:'HCM',school:'A',birthDate:'2000'},interests:[1,2,3],skills:[1,2,3,4],goals:[1],simulations:[1]});
  assert.ok(complete>empty);assert.ok(complete<=100);
});
