import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,movePosition,blocked,monsterHome,clearMonsterPath} from '../packages/game-core/world.ts';
import {WOODS_ALL_SPAWNS,WOODS_ELITE_SPAWNS,WOODS_ENCOUNTER_DETAILS,WOODS_EVENTS,WOODS_LANDMARKS,WOODS_PROFILES,WOODS_SPAWNS,WOODS_TREES,isWoodsElite,seedWoods,woodsEvent,woodsKillReward,woodsMonsterHealth,woodsMonsterName,woodsMonsterProfile,woodsRespawnDelay} from '../packages/game-core/woods.ts';
import {woodsAttackVariant,woodsBossPhase,woodsSkillSpec} from '../packages/game-core/woods-combat.ts';
import {WOODS_MONSTER_ATLAS,woodsMonsterAtlasFrame,woodsMonsterPoseFrame} from '../components/tpu/woods-monsters.ts';
import {stepWorld} from '../packages/realtime/world.ts';

test('forest joins the eastern road and tree trunks block movement',()=>{
 const p=movePosition({x:2330,y:760},{dx:1,dy:0,ms:1000});
 assert.ok(p.x>2400);
 assert.ok(WOODS_TREES.length>=40);
 for(const tree of WOODS_TREES)assert.equal(blocked(tree.x,tree.y),true);
 for(const m of WOODS_ALL_SPAWNS){assert.equal(blocked(m.x,m.y),false);assert.deepEqual(monsterHome(m.id),{x:m.x,y:m.y});}
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

test('forest groves leave spawn points, elite arenas and ranger camp usable',()=>{
 const safePoints=[[2470,760],...WOODS_ALL_SPAWNS.map(m=>[m.x,m.y])];
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

test('normal forest encounters keep their seven authored monster families',()=>{
 const profiles=WOODS_SPAWNS.map(m=>woodsMonsterProfile(m.id));
 assert.ok(profiles.every(Boolean));
 assert.equal(new Set(profiles.map(p=>p.atlasMonster)).size,7);
 assert.deepEqual(profiles.map(p=>p.name),['SAP EEL','MIRE HOUND','BRAMBLE BAT','ASH ROACH','RUST WASP','CABLE SERPENT','IRONROOT GOLEM']);
 assert.equal(Object.keys(WOODS_PROFILES).length,9);
 assert.equal(WOODS_ENCOUNTER_DETAILS.length,7);
 assert.equal(new Set(WOODS_ENCOUNTER_DETAILS.map(e=>e.marker)).size,7);
});

test('Whisper Grove and Rust Hauler add two real authored elite encounters',()=>{
 assert.deepEqual(WOODS_ELITE_SPAWNS.map(m=>m.id),[27,28]);
 assert.deepEqual(WOODS_ELITE_SPAWNS.map(m=>woodsMonsterName(m.id)),['WHISPER PLAGUEWING','HAULER SENTINEL']);
 assert.deepEqual(WOODS_ELITE_SPAWNS.map(m=>woodsMonsterProfile(m.id).atlasMonster),['plague-pigeon','riot-bot']);
 assert.equal(isWoodsElite(27),true);assert.equal(isWoodsElite(28),true);assert.equal(isWoodsElite(26),false);
 assert.equal(woodsRespawnDelay(27),300000);assert.equal(woodsRespawnDelay(28),300000);
 assert.deepEqual(WOODS_EVENTS.map(e=>e.id),['whisper-purge','hauler-recovery']);
 assert.equal(woodsEvent('whisper-purge')?.eliteId,27);
 assert.equal(woodsEvent('hauler-recovery')?.eliteId,28);
});

test('all forest atlas poses stay inside sheet 9',()=>{
 for(const spawn of WOODS_ALL_SPAWNS){
  const profile=woodsMonsterProfile(spawn.id),entry=WOODS_MONSTER_ATLAS[profile.atlasMonster];
  const frames=[entry.idle,...entry.move,...entry.attack,entry.hurt,entry.death,
   woodsMonsterAtlasFrame(spawn.id,false,0),woodsMonsterAtlasFrame(spawn.id,true,0),
   woodsMonsterPoseFrame(spawn.id,'attack',0,0),woodsMonsterPoseFrame(spawn.id,'hurt'),woodsMonsterPoseFrame(spawn.id,'death')].filter(Boolean);
  for(const [sx,sy,sw,sh] of frames){
   assert.ok(sx>=0&&sy>=0&&sw>0&&sh>0);
   assert.ok(sx+sw<=1254&&sy+sh<=1254,`${profile.name} crop escaped sheet 9`);
  }
  assert.ok(entry.attack.length>=1,`${profile.name} has no authored attack pose`);
 }
});

test('forest species expose tuned salvage bonuses',()=>{
 const rewards=WOODS_ALL_SPAWNS.map(m=>woodsKillReward(m.id));
 assert.ok(rewards.every(Boolean));
 assert.equal(new Set(rewards.map(r=>r.label)).size,9);
 assert.deepEqual(woodsKillReward(20),{scrap:4,circuits:0,xp:3,label:'Sap resin'});
 assert.deepEqual(woodsKillReward(25),{scrap:4,circuits:2,xp:6,label:'Live cable'});
 assert.deepEqual(woodsKillReward(26),{scrap:30,circuits:2,xp:25,label:'Ironroot core'});
 assert.deepEqual(woodsKillReward(27),{scrap:18,circuits:2,xp:18,label:'Plaguewing cache'});
 assert.deepEqual(woodsKillReward(28),{scrap:24,circuits:3,xp:24,label:'Sentinel cache'});
 assert.equal(woodsKillReward(999),undefined);
});

test('normal forest monsters have distinct server-authoritative skills and engagement styles',()=>{
 const specs=WOODS_SPAWNS.slice(0,6).map(m=>woodsSkillSpec(m.id));
 assert.ok(specs.every(Boolean));
 assert.equal(new Set(specs.map(s=>s.skill)).size,6);
 assert.equal(new Set(specs.map(s=>s.label)).size,6);
 assert.equal(woodsSkillSpec(22).moveSpeed,108);
 assert.equal(woodsSkillSpec(24).stopDistance,152);
 assert.equal(woodsSkillSpec(25).telegraph,'ring');
 assert.equal(woodsAttackVariant(20,'eel-shock'),1);
 assert.equal(woodsAttackVariant(26,'root-burst'),1);
});

test('elite encounters have distinct high-value combat skills',()=>{
 const plague=woodsSkillSpec(27),sentinel=woodsSkillSpec(28);
 assert.equal(plague.skill,'plague-drop');assert.equal(plague.telegraph,'circle');assert.equal(plague.stopDistance,165);
 assert.equal(sentinel.skill,'sentinel-charge');assert.equal(sentinel.telegraph,'line');assert.equal(sentinel.attackVariant,1);
 assert.ok(sentinel.damage>plague.damage);
});

test('Ironroot Golem has three increasingly aggressive combat phases',()=>{
 const p1=woodsBossPhase(700),p2=woodsBossPhase(400),p3=woodsBossPhase(120);
 assert.deepEqual([p1.phase,p2.phase,p3.phase],[1,2,3]);
 assert.ok(p2.speedMultiplier>p1.speedMultiplier);
 assert.ok(p3.speedMultiplier>p2.speedMultiplier);
 assert.ok(p3.slamRadius>p1.slamRadius);
 assert.ok(p3.slamDamage>p1.slamDamage);
 assert.ok(p2.rootRadius>0&&p3.rootRadius>p2.rootRadius);
 assert.ok(p3.cooldown<p1.cooldown);
});

test('forest skill windups are scheduled by the authoritative simulation',()=>{
 const now=100000,spawn=WOODS_SPAWNS[0];
 const s={...initialState(),x:spawn.x+100,y:spawn.y,monsters:[{...spawn,lastSkill:0,mode:'chase'}]};
 const n=advance(s,{type:'tick'},0,now);
 const eel=n.monsters.find(m=>m.id===20);
 assert.equal(eel.windup?.skill,'eel-shock');
 assert.equal(eel.windup?.at,now+woodsSkillSpec(20).windup);
});

test('targeted forest skill deals damage only after its telegraph and dodge avoids it',()=>{
 const now=100000,spawn=WOODS_SPAWNS[3],spec=woodsSkillSpec(23),target={x:spawn.x+35,y:spawn.y};
 const monster={...spawn,windup:{skill:spec.skill,at:now,...target},mode:'chase'};
 const base={...initialState(),...target,hp:100,monsters:[monster]};
 const hit=advance(structuredClone(base),{type:'tick'},0,now);
 assert.ok(hit.hp<100);assert.ok(hit.events.some(e=>e.includes('ASH SPIT')));
 const dodged=advance({...structuredClone(base),dodgeUntil:now+100},{type:'tick'},0,now);
 assert.equal(dodged.hp,100);
});

test('phase two root burst and phase three enlarged slam use boss-specific damage zones',()=>{
 const now=100000,boss=WOODS_SPAWNS[6];
 const rootTarget={x:boss.x+70,y:boss.y};
 const rootState={...initialState(),...rootTarget,hp:100,monsters:[{...boss,hp:400,mode:'chase',windup:{skill:'root-burst',at:now,...rootTarget}}]};
 const rooted=advance(rootState,{type:'tick'},0,now);
 assert.ok(rooted.hp<100);assert.ok(rooted.events.some(e=>e.includes('roots erupted')));
 const slamState={...initialState(),x:boss.x+165,y:boss.y,hp:100,monsters:[{...boss,hp:120,mode:'chase',slamAt:now,lastSkill:now-10000}]};
 const slammed=advance(slamState,{type:'tick'},0,now);
 assert.ok(slammed.hp<100);assert.ok(slammed.events.some(e=>e.includes('phase 3')));
});

test('world migration appends normal and elite forest enemies once while preserving saved combat state',()=>{
 const old=initialState().monsters;old[0].hp=7;
 const seeded=seedWoods(old);assert.equal(seeded.length,old.length+9);assert.equal(seeded[0].hp,7);
 const boss=seeded.find(m=>m.id===26);boss.hp=-2;boss.respawn=900000;
 const elite=seeded.find(m=>m.id===27);elite.hp=-5;elite.respawn=800000;
 const again=seedWoods(seeded);assert.equal(again.length,seeded.length);
 assert.equal(again.find(m=>m.id===26).hp,-2);assert.equal(again.find(m=>m.id===26).respawn,900000);
 assert.equal(again.find(m=>m.id===27).hp,-5);assert.equal(again.find(m=>m.id===27).respawn,800000);
 assert.equal(WOODS_SPAWNS[6].hp,700);
});

test('Moss quest requires proximity, six standard forest kills and a boss, and pays once',()=>{
 let s=initialState();s.monsters=[];
 s=advance(s,{type:'interact',target:'ranger'},0,100000);assert.equal(s.woodsQuest,undefined);
 s.x=2470;s.y=760;s=advance(s,{type:'interact',target:'ranger'},0,100000);
 assert.equal(s.woodsQuest,'active');
 assert.match(s.events.join(' '),/Ironroot Golem/);
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
 const rewarded=players.find(p=>p.kills===1);
 assert.equal(rewarded.scrap,42);assert.equal(rewarded.circuits,3);assert.equal(rewarded.xp,45);
 assert.ok(rewarded.events.some(e=>e.includes('Ironroot core')));
 for(const p of players){assert.equal(p.dungeon.cleared,false);assert.equal(p.legacy.deathless,false);}
 assert.equal(result.monsters[0].respawn,now+120000);
 const next=stepWorld(result.monsters,[{id:'a',state:players[0]}],0,now+120000);
 assert.equal(next.monsters[0].hp,woodsMonsterHealth(26));
 assert.deepEqual(next.players.get('a').monsters,next.monsters);
});

test('forest creature kills advance only the forest quest and pay species salvage',()=>{
 const m={...WOODS_SPAWNS[0],hp:1},now=100000;
 const s={...initialState(),x:m.x-40,y:m.y,quest:'active',woodsQuest:'active',monsters:[m],strike:{at:now,dx:1,dy:0,kind:'blade',damage:30}};
 const n=advance(s,{type:'tick'},0,now);
 assert.equal(n.woodsKills,1);assert.equal(n.questKills,0);
 assert.equal(n.scrap,16);assert.equal(n.circuits,1);assert.equal(n.xp,23);
 assert.ok(n.events.some(e=>e.includes('Sap resin')));
});

test('elite finishing blows grant tuned salvage, guaranteed rare gear and five-minute shared respawn',()=>{
 const now=100000,elite={...WOODS_ELITE_SPAWNS[0],hp:1};
 const s={...initialState(),x:elite.x-40,y:elite.y,woodsQuest:'active',monsters:[elite],strike:{at:now,dx:1,dy:0,kind:'blade',damage:30}};
 const n=advance(s,{type:'tick'},0,now);
 assert.equal(n.scrap,30);assert.equal(n.circuits,3);assert.equal(n.xp,38);
 assert.equal(n.monsters[0].respawn,now+300000);
 assert.ok(n.events.some(e=>e.includes('Plaguewing cache')));
 assert.ok(n.events.some(e=>e.includes('ELITE RARE LOOT')));
 assert.ok(n.loot?.some(item=>item.key==='reinforced_vest'));
 // Optional elites do not replace the six standard-creature requirement for Roots of Rust.
 assert.equal(n.woodsKills??0,0);
});

test('Hauler Sentinel guarantees the rare forest weapon',()=>{
 const now=100000,elite={...WOODS_ELITE_SPAWNS[1],hp:1};
 const s={...initialState(),x:elite.x-40,y:elite.y,monsters:[elite],strike:{at:now,dx:1,dy:0,kind:'blade',damage:30}};
 const n=advance(s,{type:'tick'},0,now);
 assert.equal(n.scrap,36);assert.equal(n.circuits,4);assert.equal(n.xp,44);
 assert.ok(n.loot?.some(item=>item.key==='neon_blade'));
 assert.equal(n.monsters[0].respawn,now+300000);
});

test('landmark recovery unlocks only while its elite is defeated and pays once per UTC day',()=>{
 const now=Date.UTC(2026,8,15,12),event=woodsEvent('whisper-purge'),elite={...WOODS_ELITE_SPAWNS[0],hp:-1,respawn:now+300000};
 let s={...initialState(),x:event.x,y:event.y,monsters:[elite]};
 s=advance(s,{type:'woods_event',target:event.id},0,now);
 assert.equal(s.scrap,40);assert.equal(s.circuits,2);assert.equal(s.xp,45);
 assert.ok(s.daily.caches.includes(event.claimKey));assert.ok(s.events.some(e=>e.includes('Whisper Grove Purge complete')));
 s=advance(s,{type:'woods_event',target:event.id},0,now+1000);
 assert.equal(s.scrap,40);assert.equal(s.circuits,2);assert.equal(s.xp,45);
 assert.ok(s.events.some(e=>e.includes('already recovered today')));
 const alive={...initialState(),x:event.x,y:event.y,monsters:[{...WOODS_ELITE_SPAWNS[0],hp:100}]};
 const locked=advance(alive,{type:'woods_event',target:event.id},0,now);
 assert.equal(locked.scrap,0);assert.ok(locked.events.some(e=>e.includes('elite threat still active')));
});

test('shared elite death is authoritative and only the finishing player gets rare loot',()=>{
 const now=100000,elite={...WOODS_ELITE_SPAWNS[1],hp:20};
 const state={...initialState(),x:elite.x-40,y:elite.y,strike:{at:now,dx:1,dy:0,kind:'blade',damage:30}};
 const result=stepWorld([elite],[{id:'a',state},{id:'b',state:structuredClone(state)}],0,now);
 const players=[...result.players.values()],winner=players.find(p=>p.kills===1);
 assert.equal(players.reduce((sum,p)=>sum+p.kills,0),1);
 assert.ok(winner?.loot?.some(item=>item.key==='neon_blade'));
 assert.equal(result.monsters[0].respawn,now+300000);
 for(const player of players)assert.deepEqual(player.monsters,result.monsters);
});
