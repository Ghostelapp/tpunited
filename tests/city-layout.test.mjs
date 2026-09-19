import test from 'node:test';
import assert from 'node:assert/strict';
import {BUILDINGS,NPCS,CACHES,WORLD,blocked,buildingDoor,initialState,migrateTown,SEWER_DOOR} from '../packages/game-core/world.ts';
import {TOWN_PROPS} from '../packages/game-core/town-scenery.ts';

function clearWalkingPath(a,b){const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4);for(let i=1;i<=steps;i++)if(blocked(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true;}

test('all city services and entrances remain reachable from spawn after resizing',()=>{
 const step=20,queue=[WORLD.spawn],seen=new Set([`${WORLD.spawn.x},${WORLD.spawn.y}`]);
 for(let i=0;i<queue.length;i++){
  const p=queue[i];
  for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
   const q={x:p.x+dx,y:p.y+dy},key=`${q.x},${q.y}`;
   if(q.x>2320||seen.has(key)||blocked(q.x,q.y)||!clearWalkingPath(p,q))continue;
   seen.add(key);queue.push(q);
  }
 }
 const targets=[...BUILDINGS.map((b,i)=>({...buildingDoor(i),name:b.name})),...NPCS.filter(n=>n.id!=='ranger'),...CACHES.filter(c=>c.x<2300),SEWER_DOOR];
 for(const target of targets){assert.equal(blocked(target.x,target.y),false,`blocked ${JSON.stringify(target)}`);assert.ok(queue.some(p=>Math.hypot(p.x-target.x,p.y-target.y)<30&&clearWalkingPath(p,target)),`unreachable ${JSON.stringify(target)}`);}
});
test('new furniture blocks movement and old saves inside it relocate without losing progress',()=>{
 for(const prop of TOWN_PROPS.filter(p=>p.solid))assert.ok(blocked(prop.x,prop.y-8));
 const s=initialState();Object.assign(s,{townLayout:2,x:180,y:742,scrap:123,xp:777});
 const migrated=migrateTown(s);assert.equal(migrated.townLayout,3);assert.equal(blocked(migrated.x,migrated.y),false);assert.equal(migrated.scrap,123);assert.equal(migrated.xp,777);
 const safe={...s,x:1150,y:880};assert.equal(migrateTown(safe).x,safe.x);
 const indoor={...s,interior:0,x:400,y:300};assert.equal(migrateTown(indoor).x,400);
});
