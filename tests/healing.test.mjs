import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance} from '../packages/game-core/world.ts';
const hurt=()=>({...initialState(),hp:30});
test('medkit channels, consumes exactly once and enforces cooldown',()=>{
 let s=advance(hurt(),{type:'heal'},0,20000);
 assert.equal(s.hp,30);assert.equal(s.medkits,2);
 s=advance(s,{type:'tick'},1000,21000);assert.equal(s.hp,30);
 s=advance(s,{type:'tick'},500,21500);assert.equal(s.hp,80);assert.equal(s.medkits,1);
 s=advance(s,{type:'heal'},100,21600);assert.equal(s.healing,undefined);assert.equal(s.medkits,1);
});
test('attack cancels a mature channel without consuming medkit',()=>{
 let s=advance(hurt(),{type:'heal'},0,20000);
 s=advance(s,{type:'attack'},1500,21500);
 assert.equal(s.hp,30);assert.equal(s.medkits,2);assert.equal(s.healing,undefined);
});
test('full health never consumes or starts a medkit',()=>{
 const s=advance(initialState(),{type:'heal'},0,20000);
 assert.equal(s.medkits,2);assert.equal(s.healing,undefined);
});
test('rest waits ten seconds, is bounded and cannot occur in sewers',()=>{
 let s=advance(hurt(),{type:'tick'},0,20000);
 s=advance(s,{type:'tick'},9000,29000);assert.equal(s.hp,30);
 s=advance(s,{type:'tick'},1000,30000);assert.equal(s.hp,32);
 s.interior=11;s.dungeon={monsters:[],cleared:false,run:1};
 s=advance(s,{type:'tick'},100000,130000);assert.equal(s.hp,32);
});
test('boss slam interrupts healing and records combat time',()=>{
 let s=hurt();s.interior=11;s.x=1200;s.y=245;
 s.dungeon={run:1,cleared:false,monsters:[{id:106,kind:'boss',x:1200,y:245,hp:450,respawn:0,slamAt:21500}]};
 s.healing={startedAt:20000,readyAt:21500};
 s=advance(s,{type:'tick'},500,21500);
 assert.equal(s.hp,2);assert.equal(s.lastDamage,21500);assert.equal(s.medkits,2);assert.equal(s.healing,undefined);
});
