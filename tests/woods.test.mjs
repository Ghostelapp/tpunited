import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,movePosition,blocked,monsterHome,clearMonsterPath} from '../packages/game-core/world.ts';
import {WOODS_LANDMARKS,WOODS_SPAWNS,WOODS_TREES,seedWoods,woodsMonsterHealth,woodsMonsterName} from '../packages/game-core/woods.ts';
import {stepWorld} from '../packages/realtime/world.ts';

test('forest joins the eastern road and tree trunks block movement',()=>{
 const p=movePosition({x:2330,y:760},{dx:1,dy:0,ms:1000});
 assert.ok(p.x>2400);
 assert.ok(WOODS_TREES.length>=40);
 for(const tree of WOODS_TREES)assert.equal(blocked(tree.x,tree.y),true);
 for(const m of WOODS_SPAWNS){assert.equal(blocked(m.x,m.y),false);assert.deepEqual(monsterHome(m.id),{x:m.x,y:m.y});}
 assert.equal(clearMonsterPath({x:2330,y:760},{x:2700,y:760}),true);
});

test('forest transition keeps a broad playable corridor from town to the first clearing',()=>{
 const samples=[
  [2300,740],[2380,740],[2460,750],[2540,760],[2620,770],[2700,780],
  [2300,780],[2380,780],[2460,790],[2540,800],[2620,810],[2700,820],
 ];
 for(const [x,y] of samples)assert.equal(blocked(x,y),false,`road corridor blocked at ${x},${y}`);
 assert.equal(clearMonsterPath({x:2380,y:760},{x:2700,y:780}),true);
});

test('forest groves leave spawn points and ranger camp usable',()=>{
 const safePoints=[[2470,760],[2780,540],[2880,980],[3040,480],[3090,1160],[3310,530],[3370,1150],[3540,820]];
 for(const [x,y] of safePoints)assert.equal(blocked(x,y),false,`important forest point blocked at ${x},${y}`);
});

test('forest roster has distinct encounter identities and navigation landmarks',()=>{
 assert.equal(WOODS_SPAWNS.length,7);
 assert.equal(new Set(WOODS_SPAWNS.map(m=>m.species)).size,7);
 assert.equal(new Set(WOODS_SPAWNS.map(m=>woodsMonsterName(m.id))).size,7);
 assert.deepEqual(WOODS_LANDMARKS.map(l=>l.id),['trail-camp','whisper-grove','rust-wreck','ironroot']);
 assert.ok(WOODS_SPAWNS[1].hp>WOODS_SPAWNS[0].hp);
 assert.ok(WOODS_SPAWNS[5].hp>WOODS_SPAWNS[4].hp);
});

test('world migration adds forest enemies once and preserves existing damage and respawn',()=>{
 const old=initialState().monsters;old[0].hp=7;
 const seeded=seedWoods(old);assert.equal(seeded.length,old.length+7);assert.equal(seeded[0].hp,7);
 const boss=seeded.find(m=>m.id===26);boss.hp=-2;boss.respawn=900000;
 const again=seedWoods(seeded);assert.equal(again.length,seeded.length);
 assert.equal(again.find(m=>m.id===26).hp,-2);assert.equal(again.find(m=>m.id===26).respawn,900000);
 assert.equal(WOODS_SPAWNS[6].hp,700);
});

test('Moss quest requires proximity, six forest kills and a boss, and pays once',()=>{
 let s=initialState();s.monsters=[];
 s=advance(s,{type:'interact',target:'ranger'},0,100000);assert.equal(s.woodsQuest,undefined);
 s.x=2470;s.y=760;s=advance(s,{type:'interact',target:'ranger'},0,100000);
 assert.equal(s.woodsQuest,'active');
 let n=advance(s,{type:'interact',target:'ranger'},0,100000);assert.equal(n.scrap,0);
 s.woodsKills=6;s.woodsBoss=true;n=advance(s,{type:'interact',target:'ranger'},0,100000);
 assert.equal(n.woodsQuest,'complete');assert.equal(n.scrap,200);assert.equal(n.xp,200);assert.equal(n.medkits,4);
 n=advance(n,{type:'interact',target:'ranger'},0,100000);assert.equal(n.scrap,200);assert.equal(n.xp,200);
});

test('shared forest boss awards one kill, preserves sewer state, and respawns at full health',()=>{
 const now=100000,boss={...WOODS_SPAWNS[6],hp:20};
 const s={...initialState(),x:boss.x-40,y:boss.y,woodsQuest:'active',woodsKills:6,
  dungeon:{monsters:[],cleared:false,run:1,hits:0,deaths:0},
  strike:{at:now,dx:1,dy:0,kind:'blade',damage:30}};
 const result=stepWorld([boss],[{id:'a',state:s},{id:'b',state:structuredClone(s)}],0,now);
 const players=[...result.players.values()];
 assert.equal(players.reduce((sum,p)=>sum+p.kills,0),1);
 assert.equal(players.filter(p=>p.woodsBoss).length,1);
 for(const p of players){assert.equal(p.dungeon.cleared,false);assert.equal(p.legacy.deathless,false);}
 assert.equal(result.monsters[0].respawn,now+120000);
 const next=stepWorld(result.monsters,[{id:'a',state:players[0]}],0,now+120000);
 assert.equal(next.monsters[0].hp,woodsMonsterHealth(26));
 assert.deepEqual(next.players.get('a').monsters,next.monsters);
});

test('forest creature kills advance only the forest quest',()=>{
 const m={...WOODS_SPAWNS[0],hp:1},now=100000;
 const s={...initialState(),x:m.x-40,y:m.y,quest:'active',woodsQuest:'active',monsters:[m],strike:{at:now,dx:1,dy:0,kind:'blade',damage:30}};
 const n=advance(s,{type:'tick'},0,now);
 assert.equal(n.woodsKills,1);assert.equal(n.questKills,0);
});
