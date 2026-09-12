import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,WEAPONS} from '../packages/game-core/world.ts';
import {initialMonsters,stepWorld} from '../packages/realtime/world.ts';
import {inputSchema} from '../packages/realtime/protocol.ts';

const now=100000;
test('two simultaneous finishing blows produce one kill and one base reward',()=>{
 const mobs=initialMonsters();mobs[0].hp=20;
 const a={...initialState(),x:mobs[0].x-40,y:mobs[0].y,quest:'active' as const,strike:{at:now,dx:1,dy:0,kind:'blade' as const,damage:30}};
 const r=stepWorld(mobs,[{id:'a',state:a},{id:'b',state:structuredClone(a)}],100,now);
 const values=[...r.players.values()];
 assert.equal(values.reduce((n,p)=>n+p.kills,0),1);
 assert.equal(values.reduce((n,p)=>n+p.xp,0),20);
 assert.equal(values.reduce((n,p)=>n+p.circuits,0),1);
 assert.equal(values.reduce((n,p)=>n+p.questKills,0),1);
 assert.ok(r.monsters[0].hp<=0);
 assert.deepEqual(values[0].monsters,values[1].monsters);
 assert.equal(mobs[0].hp,20,'input world is not mutated before commit');
});
test('enemy simulation speed does not multiply with connected players',()=>{
 const state=initialState(),mobs=initialMonsters();
 const one=stepWorld(mobs,[{id:'a',state}],100,now);
 const many=stepWorld(mobs,Array.from({length:30},(_,i)=>({id:String(i),state:initialState()})),100,now);
 assert.deepEqual(one.monsters,many.monsters);
});
test('enemy attacks the nearest player and attacks advance without player input',()=>{
 const mobs=initialMonsters();mobs[0].windup={at:now,x:mobs[0].x-20,y:mobs[0].y};
 const near={...initialState(),x:mobs[0].x-20,y:mobs[0].y};
 const r=stepWorld(mobs,[{id:'far',state:initialState()},{id:'near',state:near}],100,now);
 assert.ok(r.players.get('near')!.hp<100);assert.equal(r.players.get('far')!.hp,100);
});
test('movement is bounded by server credit and is not applied twice',()=>{
 const state={...initialState(),motionCredit:0};
 const input=inputSchema.parse({type:'input',seq:1,scene:-1,action:{type:'move',dx:1,dy:0},motion:Array.from({length:25},()=>({dx:1,dy:0,ms:40}))});
 const r=stepWorld(initialMonsters(),[{id:'a',state,input}],100,now).players.get('a')!;
 assert.ok(Math.abs(r.x-state.x-19)<.001);assert.equal(r.y,state.y);
});
test('stale scene packet cannot attack or move in a different room',()=>{
 const state={...initialState(),interior:1,x:400,y:480};
 const input=inputSchema.parse({type:'input',seq:1,scene:-1,action:{type:'attack'},motion:[{dx:1,dy:0,ms:40}]});
 const r=stepWorld(initialMonsters(),[{id:'a',state,input}],100,now).players.get('a')!;
 assert.equal(r.x,400);assert.equal(r.strike,undefined);
});
test('cooldowns cannot be bypassed by consecutive packets',()=>{
 let state={...initialState(),x:1900,y:480};
 const input=inputSchema.parse({type:'input',seq:1,scene:-1,action:{type:'attack'},motion:[]});
 state=stepWorld(initialMonsters(),[{id:'a',state,input}],100,now).players.get('a')!;
 const energy=state.energy;
 state=stepWorld(state.monsters,[{id:'a',state,input:{...input,seq:2}}],100,now+100).players.get('a')!;
 assert.equal(state.lastAttack,now);assert.ok(state.strike);assert.ok(WEAPONS.blade.cooldown>100);assert.equal(state.energy,energy);
});
test('malformed, forged identity, nonfinite and oversized inputs are rejected',()=>{
 const input={type:'input',seq:1,scene:-1,action:{type:'tick'},motion:[]};
 assert.ok(inputSchema.safeParse(input).success);
 for(const patch of [{userId:'admin'},{seq:0},{scene:12},{action:{type:'attack',damage:9999}},{motion:[{dx:Infinity,dy:0,ms:20}]},{motion:Array.from({length:41},()=>({dx:0,dy:0,ms:20}))}])assert.equal(inputSchema.safeParse({...input,...patch}).success,false);
});
test('respawn is shared and a personal save cannot resurrect an enemy',()=>{
 const mobs=initialMonsters();mobs[0].hp=0;mobs[0].respawn=now+25000;
 const r=stepWorld(mobs,[{id:'rejoined',state:initialState()}],100,now);
 assert.equal(r.players.get('rejoined')!.monsters[0].hp,0);
 const respawn=stepWorld(r.monsters,[{id:'a',state:initialState()},{id:'b',state:initialState()}],100,now+25001);
 assert.equal(respawn.monsters[0].hp,60);
});
