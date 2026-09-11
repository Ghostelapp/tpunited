import test from 'node:test';
import assert from 'node:assert/strict';
import {parcelScenery,PARCEL_TILE} from '../packages/game-core/parcel-scenery.ts';
test('each parcel has reproducible, distinct scenery with clear walking routes',()=>{
 const signatures=new Set();
 for(let id=1;id<=100;id++){
  const props=parcelScenery(id,32,32);
  assert.deepEqual(props,parcelScenery(id,32,32));
  signatures.add(JSON.stringify(props));
  assert.ok(props.length>=18);
  for(const p of props){assert.ok(p.x>=2&&p.x<30&&p.y>=2&&p.y<27);assert.ok(Math.abs(p.x-16)>=2&&Math.abs(p.y-16)>=2)}
 }
 assert.equal(signatures.size,100);
 assert.equal(PARCEL_TILE,32);
});
