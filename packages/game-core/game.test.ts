import {test} from 'node:test';import assert from 'node:assert/strict';
import {advance as step,initialState,NPCS,BUILDINGS,blocked,type GameState,type Intent} from './world.ts';
function advance(s:GameState,a:Intent,elapsed:number,now:number){const n=step(s,a,elapsed,now);return a.type==='attack'&&n.strike&&n.strike.at>now?step(n,{type:'tick'},0,n.strike.at):n}
test('movement is bounded by time and diagonal normalized',()=>{const s=initialState();const n=advance(s,{type:'move',dx:1,dy:1},5000,100000);assert.ok(Math.hypot(n.x-s.x,n.y-s.y)<=190.01);assert.equal(s.x,1150)});
test('building collision blocks crossing and world bounds are enforced',()=>{const b=BUILDINGS[0];assert.equal(blocked(b.x+50,b.y+b.h-20),true);assert.equal(blocked(-5,100),true)});
test('quest reward requires acceptance and three legitimate kills; cannot be claimed twice',()=>{let s=initialState();s.x=NPCS[0].x;s.y=NPCS[0].y;s=advance(s,{type:'interact',target:'scrappy'},100,10000);assert.equal(s.quest,'active');s=advance(s,{type:'interact',target:'scrappy'},100,10200);assert.equal(s.scrap,0);let now=12000;for(let i=0;i<3;i++){s.monsters=[{id:i,x:s.x+50,y:s.y,hp:60,respawn:0}];for(let j=0;j<3;j++){now+=500;s=advance(s,{type:'attack'},100,now)}}assert.equal(s.questKills,3);assert.equal(s.scrap,36);s=advance(s,{type:'interact',target:'scrappy'},100,now+1000);assert.equal(s.scrap,136);s=advance(s,{type:'interact',target:'scrappy'},100,now+2000);assert.equal(s.scrap,136);assert.equal(s.quest,'complete')});
test('remote attack gives no loot, cooldown stops spam',()=>{let s=initialState();const before=s.scrap;s=advance(s,{type:'attack'},100,10000);assert.equal(s.scrap,before);s.monsters=[{id:0,x:s.x+50,y:s.y,hp:60,respawn:0}];s=advance(s,{type:'attack'},100,10100);assert.equal(s.monsters[0].hp,60)});
test('crafting requires location and resources',()=>{let s=initialState();s.scrap=20;s.circuits=2;s.x=0;s.y=0;s=advance(s,{type:'craft'},100,10000);assert.equal(s.medkits,2);s.x=NPCS[2].x;s.y=NPCS[2].y;s=advance(s,{type:'craft'},100,11000);assert.equal(s.medkits,3);assert.equal(s.scrap,0);assert.equal(s.circuits,0);s=advance(s,{type:'craft'},100,12000);assert.equal(s.medkits,3)});
test('healing cannot duplicate items or exceed max health',()=>{let s=initialState();s.hp=80;s=advance(s,{type:'heal'},100,10000);assert.equal(s.hp,80);s=advance(s,{type:'tick'},0,11500);assert.equal(s.hp,100);assert.equal(s.medkits,1);s=advance(s,{type:'heal'},100,11600);assert.equal(s.medkits,1)});
test('weapon upgrades require workshop, resources, and cap at level 3',()=>{let s=initialState();s.scrap=10000;s.circuits=1000;s=advance(s,{type:'upgrade'},100,10000);assert.equal(s.weaponLevel,0);s.x=NPCS[2].x;s.y=NPCS[2].y;for(let i=0;i<3;i++)s=advance(s,{type:'upgrade'},100,11000+i*1000);assert.equal(s.weaponLevel,3);const cost=s.scrap;s=advance(s,{type:'upgrade'},100,15000);assert.equal(s.weaponLevel,3);assert.equal(s.scrap,cost)});
test('vendor transactions conserve resources and require proximity',()=>{let s=initialState();s.scrap=30;s.circuits=1;s=advance(s,{type:'buy_medkit'},100,10000);assert.equal(s.medkits,2);const n=NPCS.find(n=>n.id==='merchant')!;s.x=n.x;s.y=n.y;s=advance(s,{type:'buy_medkit'},100,11000);assert.equal(s.scrap,0);assert.equal(s.medkits,3);s=advance(s,{type:'sell_circuit'},100,12000);assert.equal(s.scrap,4);assert.equal(s.circuits,0);s=advance(s,{type:'sell_circuit'},100,13000);assert.equal(s.scrap,4)});
test('salvage quest consumes six circuits and rewards only once',()=>{let s=initialState();s.x=NPCS[2].x;s.y=NPCS[2].y;s.circuits=6;s=advance(s,{type:'salvage_quest'},100,10000);assert.equal(s.salvageQuest,'active');s=advance(s,{type:'salvage_quest'},100,11000);assert.equal(s.salvageQuest,'complete');assert.equal(s.circuits,0);assert.equal(s.scrap,75);s=advance(s,{type:'salvage_quest'},100,12000);assert.equal(s.scrap,75)});
test('rat bounty does not count slimes or kills before acceptance',()=>{let s=initialState();s.x=NPCS[0].x;s.y=NPCS[0].y;s=advance(s,{type:'bounty_quest'},100,10000);s.monsters=[{id:0,kind:'slime',x:s.x+50,y:s.y,hp:20,respawn:0}];s=advance(s,{type:'attack'},100,11000);assert.equal(s.bountyKills,0);s.monsters=[{id:4,kind:'rat',x:s.x+50,y:s.y,hp:20,respawn:0}];s=advance(s,{type:'attack'},100,12000);assert.equal(s.bountyKills,1);s=advance(s,{type:'bounty_quest'},100,13000);assert.equal(s.bountyQuest,'active')});


test('prediction replays only unacknowledged input through a turn and release',async()=>{
 const {replayMotion,applyMotion}=await import('./world.ts');
 const start=initialState();const input=[{dx:1,dy:0,ms:40},{dx:1,dy:0,ms:40},{dx:0,dy:1,ms:40},{dx:0,dy:0,ms:40}];
 const local=replayMotion(start,input);const ack=applyMotion(start,input.slice(0,2),120,'a');
 assert.deepEqual(replayMotion(ack,input.slice(2)),local);
 const final=applyMotion(ack,input.slice(2),120,'b');assert.equal(final.x,local.x);assert.equal(final.y,local.y);
});
test('motion batches cannot create extra time or diagonal speed',async()=>{
 const {applyMotion}=await import('./world.ts');let s=initialState();const x=s.x,y=s.y;
 const flood=Array.from({length:150},()=>({dx:1,dy:1,ms:40}));
 s=applyMotion(s,flood,0,'a');s=applyMotion(s,flood,0,'b');
 assert.ok(Math.hypot(s.x-x,s.y-y)<=47.50001);
});
test('long movement cannot tunnel through a building foot collision',async()=>{
 const {movePosition}=await import('./world.ts');const p=movePosition({x:800,y:570},{dx:0,dy:1,ms:1000});assert.ok(p.y<=585);
});
test('delayed acknowledgements preserve position across different frame rates',async()=>{
 const {replayMotion,applyMotion}=await import('./world.ts');
 for(const fps of [30,60,144]){let s=initialState();let predicted={x:s.x,y:s.y};const queue=[];
 for(let i=0;i<fps;i++){const input={dx:i<fps/2?1:0,dy:i<fps/2?0:1,ms:1000/fps};queue.push(input);predicted=replayMotion(predicted,[input]);
 if(i%Math.round(fps/5)===0){const packet=queue.splice(0,Math.max(0,queue.length-3));s=applyMotion(s,packet,200,String(i));assert.deepEqual(replayMotion(s,queue),predicted);}}
 }
});


test('monsters patrol near home and respect species speed',()=>{
 let s=initialState();s.x=100;s.y=100;
 const before=structuredClone(s.monsters);s=advance(s,{type:'tick'},1000,10000);
 for(const m of s.monsters){const original=before.find(o=>o.id===m.id)!;const d=Math.hypot(m.x-original.x,m.y-original.y);assert.ok(d>0);assert.ok(d<=(m.kind==='rat'?40.5:23.4)+.001);assert.equal(m.mode,'patrol');}
});
test('chase stops at melee range without overshoot and leash returns home',()=>{
 let s=initialState();s.monsters=[s.monsters[0]];s.x=1840;s.y=550;
 s=advance(s,{type:'tick'},1000,10000);assert.equal(s.monsters[0].mode,'chase');assert.ok(Math.hypot(s.x-s.monsters[0].x,s.y-s.monsters[0].y)>=35.99);
 s.monsters[0].x=1250;s.monsters[0].y=880;s.x=1240;s.y=880;const old=s.monsters[0].x;
 s=advance(s,{type:'tick'},200,11000);assert.equal(s.monsters[0].mode,'return');assert.ok(s.monsters[0].x>old);
});
test('monster steering cannot cross clinic collision during a long server tick',()=>{
 let s=initialState();s.monsters=[{id:0,kind:'slime',x:1600,y:1090,hp:60,respawn:0,mode:'return'}];s.x=100;s.y=100;
 for(let i=0;i<20;i++){s=advance(s,{type:'tick'},1000,10000+i*1000);assert.equal(blocked(s.monsters[0].x,s.monsters[0].y),false);}
});

test('daily quests migrate old saves, reset at UTC midnight, and preserve permanent progress',()=>{
 const now=Date.UTC(2026,8,9,23,59,59);let s=initialState();s.quest='complete';s.scrap=125;s.xp=80;
 s=advance(s,{type:'tick'},0,now);assert.equal(s.daily?.day,'2026-09-09');s.daily!.kills=5;s.daily!.claimed=['patrol'];
 s=advance(s,{type:'tick'},0,now+1000);assert.equal(s.daily?.day,'2026-09-10');assert.equal(s.daily?.kills,0);assert.deepEqual(s.daily?.claimed,[]);assert.equal(s.quest,'complete');assert.equal(s.scrap,125);assert.equal(s.xp,80);
});
test('daily rewards require completion and cannot be claimed twice',()=>{
 const now=Date.UTC(2026,8,9);let s=advance(initialState(),{type:'daily_claim',target:'patrol'},0,now);assert.equal(s.scrap,0);
 s.daily!.kills=5;s=advance(s,{type:'daily_claim',target:'patrol'},0,now);assert.equal(s.scrap,60);assert.equal(s.xp,60);
 s=advance(s,{type:'daily_claim',target:'patrol'},0,now);assert.equal(s.scrap,60);s=advance(s,{type:'daily_claim',target:'invented'},0,now);assert.equal(s.scrap,60);
});
test('salvage caches enforce range, once per day loot and exploration progress',async()=>{
 const {CACHES}=await import('./world.ts');const now=Date.UTC(2026,8,9);let s=initialState();s.monsters=[];
 s=advance(s,{type:'cache',target:CACHES[0].id},0,now);assert.equal(s.scrap,0);
 for(const c of CACHES.slice(0,2)){assert.equal(blocked(c.x,c.y),false);s.x=c.x;s.y=c.y;s=advance(s,{type:'cache',target:c.id},0,now);}
 assert.equal(s.scrap,40);assert.equal(s.daily?.caches.length,2);s=advance(s,{type:'cache',target:CACHES[1].id},0,now);assert.equal(s.scrap,40);
 s=advance(s,{type:'daily_claim',target:'explore'},0,now);assert.equal(s.scrap,85);
 s=advance(s,{type:'cache',target:CACHES[1].id},0,now+86400000);assert.equal(s.scrap,105);assert.equal(s.daily?.caches.length,1);
});
test('only successful crafting and defeated monsters count toward daily tasks',()=>{
 const now=Date.UTC(2026,8,9);let s=advance(initialState(),{type:'craft'},0,now);assert.equal(s.daily?.crafted,0);
 s.x=NPCS[2].x;s.y=NPCS[2].y;s.scrap=20;s.circuits=2;s=advance(s,{type:'craft'},0,now);assert.equal(s.daily?.crafted,1);
 s.monsters=[{id:0,x:s.x+30,y:s.y,hp:25,respawn:0}];s=advance(s,{type:'attack'},0,now+500);assert.equal(s.daily?.kills,1);s=advance(s,{type:'attack'},0,now+1000);assert.equal(s.daily?.kills,1);
});

test('all public buildings require doorway proximity and return to the correct street door',async()=>{
 const {buildingDoor,ROOM}=await import('./world.ts');const now=Date.UTC(2026,8,9);
 let remote=advance(initialState(),{type:'enter',target:'1'},0,now);assert.equal(remote.interior,undefined);
 for(let i=0;i<BUILDINGS.length;i++){let s=initialState();s.monsters=[];Object.assign(s,buildingDoor(i));assert.equal(blocked(s.x,s.y),false);
 s=advance(s,{type:'enter',target:String(i)},0,now);assert.equal(s.interior,i);assert.equal(s.x,ROOM.spawn.x);
 s=advance(s,{type:'exit'},0,now);assert.equal(s.interior,undefined);assert.deepEqual({x:s.x,y:s.y},buildingDoor(i));}
 remote=advance(initialState(),{type:'enter',target:'999'},0,now);assert.equal(remote.interior,undefined);
});
test('interior movement and pending-input replay share wall and furniture collision',async()=>{
 const {applyMotion,replayMotion,ROOM,sceneBlocked}=await import('./world.ts');let s=initialState();s.interior=1;Object.assign(s,ROOM.spawn);
 const input=[{dx:0,dy:1,ms:1000}];const predicted=replayMotion(s,input);s=applyMotion(s,input,1000,'room');assert.deepEqual({x:s.x,y:s.y},predicted);assert.ok(s.y<=545);
 assert.equal(sceneBlocked(120,200,1),true);assert.equal(sceneBlocked(400,400,1),false);
});
test('indoors blocks street combat and cache looting but permits the correct local service',()=>{
 const now=Date.UTC(2026,8,9);let s=initialState();s.interior=1;s.x=400;s.y=245;s.hp=70;s.scrap=100;s.circuits=10;s.monsters=[{id:0,x:405,y:245,hp:25,respawn:0}];
 s=advance(s,{type:'attack'},1000,now);assert.equal(s.hp,70);assert.equal(s.monsters[0].hp,25);
 s=advance(s,{type:'buy_medkit'},0,now);assert.equal(s.medkits,2);s=advance(s,{type:'craft'},0,now);assert.equal(s.medkits,3);assert.equal(s.scrap,80);
 s.x=185;s.y=600;s=advance(s,{type:'cache',target:'west'},0,now);assert.equal(s.scrap,80);
 s.interior=4;s.x=400;s.y=245;s=advance(s,{type:'interact',target:'patch'},0,now);assert.equal(s.hp,100);assert.equal(s.scrap,65);
});
test('exiting requires the interior exit and repeated entry cannot teleport between rooms',()=>{
 const now=Date.UTC(2026,8,9);let s=initialState();s.interior=2;s.x=400;s.y=245;
 s=advance(s,{type:'exit'},0,now);assert.equal(s.interior,2);
 s=advance(s,{type:'enter',target:'1'},0,now);assert.equal(s.interior,2);
 const restored=JSON.parse(JSON.stringify(s));assert.equal(restored.interior,2);
});

test('equipment requires owned gear, changes stats and salvage cannot duplicate or remove equipped gear',async()=>{
 const {gearStats}=await import('./world.ts');let s=initialState();s.monsters=[];s.loot=[{id:'blade',key:'neon_blade'},{id:'vest',key:'reinforced_vest'}];const now=Date.UTC(2026,8,9);
 s=advance(s,{type:'equip',target:'forged'},0,now);assert.equal(gearStats(s).damage,25);
 s=advance(s,{type:'equip',target:'blade'},0,now);s=advance(s,{type:'equip',target:'vest'},0,now);assert.deepEqual(gearStats(s),{damage:37,armor:4});
 s=advance(s,{type:'salvage',target:'blade'},0,now);assert.equal(s.scrap,0);assert.equal(s.loot?.length,2);
 s=advance(s,{type:'unequip',target:'weapon'},0,now);s=advance(s,{type:'salvage',target:'blade'},0,now);assert.equal(s.scrap,15);assert.equal(gearStats(s).damage,25);
 s=advance(s,{type:'salvage',target:'blade'},0,now);assert.equal(s.scrap,15);
});
test('dungeon requires hatch proximity, preserves unfinished run and has reachable rooms',async()=>{
 const {SEWER_DOOR,DUNGEON,DUNGEON_SPAWNS,dungeonWalkable}=await import('./world.ts');const now=Date.UTC(2026,8,9);let s=advance(initialState(),{type:'dungeon_enter'},0,now);assert.equal(s.interior,undefined);
 Object.assign(s,SEWER_DOOR);s=advance(s,{type:'dungeon_enter'},0,now);assert.equal(s.interior,11);assert.equal(s.dungeon?.monsters.length,7);s.dungeon!.monsters[0].hp=0;
 Object.assign(s,DUNGEON.exit);s=advance(s,{type:'exit'},0,now);assert.deepEqual({x:s.x,y:s.y},SEWER_DOOR);s=advance(s,{type:'dungeon_enter'},0,now);assert.equal(s.dungeon?.monsters[0].hp,0);
 const queue=[[180,820]],seen=new Set(['180,820']);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[20,0],[-20,0],[0,20],[0,-20]]){const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(!seen.has(key)&&dungeonWalkable(nx,ny)){seen.add(key);queue.push([nx,ny]);}}}
 for(const p of DUNGEON_SPAWNS)assert.ok(queue.some(([x,y])=>Math.hypot(p.x-x,p.y-y)<30));
});
test('boss defeat awards one epic and completion reward, dead dungeon enemies do not respawn',async()=>{
 const {GEAR,newDungeonMonsters,DUNGEON,SEWER_DOOR}=await import('./world.ts');const now=Date.UTC(2026,8,9);let s=initialState();s.interior=11;s.x=1180;s.y=245;s.dungeon={run:1,cleared:false,monsters:[newDungeonMonsters()[6]]};s.dungeon.monsters[0].hp=25;
 s=advance(s,{type:'attack'},0,now);assert.equal(s.dungeon?.cleared,true);assert.equal(s.scrap,162);assert.equal(s.medkits,4);assert.equal(s.loot?.length,1);assert.equal(GEAR[s.loot![0].key].rarity,'epic');
 s=advance(s,{type:'attack'},0,now+60000);assert.equal(s.scrap,162);assert.equal(s.loot?.length,1);assert.ok(s.dungeon!.monsters[0].hp<=0);
 Object.assign(s,DUNGEON.exit);s=advance(s,{type:'exit'},0,now+61000);Object.assign(s,SEWER_DOOR);s=advance(s,{type:'dungeon_enter'},0,now+62000);assert.equal(s.dungeon?.run,2);assert.equal(s.dungeon?.cleared,false);
});
test('boss slam is telegraphed and can be dodged; armor reduces contact damage',async()=>{
 const {newDungeonMonsters}=await import('./world.ts');const now=Date.UTC(2026,8,9);let s=initialState();s.interior=11;s.x=1200;s.y=365;s.dungeon={run:1,cleared:false,monsters:[newDungeonMonsters()[6]]};
 s=advance(s,{type:'tick'},0,now);assert.equal(s.dungeon?.monsters[0].slamAt,now+1100);assert.equal(s.hp,100);
 const hit=advance(s,{type:'tick'},0,now+1200);assert.equal(hit.hp,72);
 s.x=1200;s.y=450;s=advance(s,{type:'tick'},0,now+1200);assert.equal(s.hp,100);
 s.x=1200;s.y=245;s.loot=[{id:'armor',key:'reinforced_vest'}];s.equipment={armor:'armor'};s=advance(s,{type:'tick'},0,now+2400);assert.equal(s.hp,88);
});

test('navigation finds a clear route around the clinic instead of oscillating against its wall',async()=>{
 const {findMonsterPath,clearMonsterPath}=await import('./world.ts');const b=BUILDINGS[4];let p={x:b.x+b.w/2,y:b.y+b.h+45};const goal={x:b.x+b.w/2,y:b.y+b.h-100};assert.equal(clearMonsterPath(p,goal),false);const path=findMonsterPath(p,goal);assert.ok(path.length>1);for(const waypoint of path){assert.equal(clearMonsterPath(p,waypoint),true);p=waypoint;}assert.deepEqual(p,goal);
});
test('navigation follows sewer corridors between separated chambers',async()=>{
 const {findMonsterPath,clearMonsterPath}=await import('./world.ts');let p={x:180,y:820};const goal={x:1200,y:245},path=findMonsterPath(p,goal,11);assert.ok(path.length>1);for(const waypoint of path){assert.equal(clearMonsterPath(p,waypoint,11),true);p=waypoint;}assert.deepEqual(p,goal);
});
test('melee attacks cannot damage creatures through a building wall',()=>{
 const b=BUILDINGS[4];let s=initialState();s.x=b.x+b.w/2;s.y=b.y+b.h+30;s.monsters=[{id:6,kind:'bug',x:s.x,y:b.y+b.h-80,hp:20,respawn:0}];s=advance(s,{type:'attack'},0,Date.UTC(2026,8,9));assert.equal(s.monsters[0].hp,20);assert.equal(s.scrap,0);
});

test('town migration preserves progression and interiors while relocating old outdoor saves',async()=>{
 const {migrateTown,WORLD}=await import('./world.ts');const s=initialState();delete s.townLayout;s.x=800;s.y=600;s.scrap=231;s.quest='complete';s.monsters[0].hp=0;
 const n=migrateTown(s);assert.deepEqual({x:n.x,y:n.y},WORLD.spawn);assert.equal(n.scrap,231);assert.equal(n.quest,'complete');assert.equal(n.monsters[0].hp,0);assert.ok(n.monsters.every(m=>m.x>=1930));assert.equal(n.townLayout,2);
 s.interior=4;const room=migrateTown(s);assert.equal(room.interior,4);assert.equal(room.x,800);assert.equal(room.y,600);n.x=1200;assert.equal(migrateTown(n).x,1200);
});

test('hit feedback reports actual health removed, disappears on next tick and ignores cooldown attacks',()=>{
 const now=Date.UTC(2026,8,9);let s=initialState();s.monsters=[{id:0,x:s.x+50,y:s.y,hp:60,respawn:0}];s=advance(s,{type:'attack'},0,now);assert.equal(s.hitFeedback?.amount,25);assert.equal(s.hitFeedback?.x,s.x+50);
 const cooldown=advance(s,{type:'attack'},0,now+100);assert.equal(cooldown.hitFeedback,undefined);assert.equal(cooldown.monsters[0].hp,35);
 s.monsters[0].hp=7;s=advance(s,{type:'attack'},0,now+500);assert.equal(s.hitFeedback?.amount,7);s=advance(s,{type:'tick'},0,now+600);assert.equal(s.hitFeedback,undefined);
});

