import test from 'node:test';import assert from 'node:assert/strict';
import {advance,initialState,playerStats,gearStats,assistAim,lootKey,LOOT_CHANCE,WORLD_LIMITS,NPCS,BUILDINGS} from '../packages/game-core/world.ts';
import {fitHud} from '../components/tpu/hud-geometry.ts';
test('levels increase health, stamina, energy, damage and armor',()=>{const s=initialState();s.xp=500;assert.deepEqual(playerStats(s),{level:6,hp:150,stamina:110,energy:110,damage:10,armor:1});assert.deepEqual(gearStats(s),{damage:35,armor:1});});
test('medkits and clinic heal above 100 HP',()=>{let s=initialState();s.xp=500;s.hp=100;s=advance(s,{type:'heal'},0,100000);s=advance(s,{type:'tick'},0,101500);assert.equal(s.hp,150);assert.equal(s.medkits,1);s.hp=120;s.scrap=15;s.x=NPCS[1].x;s.y=NPCS[1].y;s=advance(s,{type:'interact',target:'patch'},0,102000);assert.equal(s.hp,150);assert.equal(s.scrap,0);});
test('level-up adds gained capacity, not a free full heal',()=>{let s=initialState();s.hp=40;s.quest='active';s.questKills=3;s.x=NPCS[0].x;s.y=NPCS[0].y;s=advance(s,{type:'interact',target:'scrappy'},0,100000);assert.equal(playerStats(s).level,2);assert.equal(s.hp,50);});
test('aim assistance respects walls and blaster forward cone',()=>{const s=initialState();s.monsters=[{id:1,x:s.x-100,y:s.y,hp:100,respawn:0}];assert.equal(assistAim(s,1,0,'blade').target,1);assert.equal(assistAim(s,1,0,'blaster').target,undefined);const b=BUILDINGS[4];s.x=b.x+100;s.y=b.y+b.h+30;s.monsters=[{id:1,x:s.x,y:b.y+b.h-80,hp:100,respawn:0}];assert.equal(assistAim(s,0,-1,'blade').target,undefined);});
test('loot chances match species table and ten percent rare share',()=>{for(const kind of ['slime','rat','bug']){let total=0,rare=0;for(let i=0;i<10000;i++){const key=lootKey(kind,(i+.5)/10000,.2);if(key)total++;if(key==='neon_blade')rare++;}assert.equal(total,LOOT_CHANCE[kind]*10000);assert.equal(rare,total*.1);}assert.equal(lootKey('boss',.999,.2),'king_blade');assert.equal(lootKey('boss',.999,.8),'king_armor');});
test('movement and dodge stop inside all four fence sides',()=>{for(const [x,y,dx,dy] of [[WORLD_LIMITS.left,900,-1,0],[WORLD_LIMITS.right,900,1,0],[1800,WORLD_LIMITS.top,0,-1],[1800,WORLD_LIMITS.bottom,0,1]])for(const type of ['move','dodge']){let s=initialState();s.x=x;s.y=y;s=advance(s,{type,dx,dy},1000,100000);assert.ok(s.x>=WORLD_LIMITS.left&&s.x<=WORLD_LIMITS.right);assert.ok(s.y>=WORLD_LIMITS.top&&s.y<=WORLD_LIMITS.bottom);}});
test('old saves outside the fence recover inside',()=>{const s=initialState();s.x=30;s.y=1690;const n=advance(s,{type:'tick'},0,100000);assert.equal(n.x,WORLD_LIMITS.left);assert.equal(n.y,WORLD_LIMITS.bottom);});
test('HUD fits desktop, portrait and landscape without overlap',()=>{for(const [width,height] of [[1440,800],[390,760],[844,330]]){const boxes=[{id:'player',x:-100,y:-100,width:190,height:90},{id:'tools',x:-100,y:-100,width:170,height:36},{id:'map',x:5000,y:5000,width:88,height:62},{id:'actions',x:5000,y:5000,width:220,height:48}],fitted=fitHud(width,height,boxes);for(const b of boxes){const p=fitted[b.id];assert.ok(p.x>=0&&p.y>=0&&p.x+b.width<=width&&p.y+b.height<=height);for(const c of boxes){if(b.id===c.id)continue;const q=fitted[c.id];assert.ok(p.x+b.width<=q.x||q.x+c.width<=p.x||p.y+b.height<=q.y||q.y+c.height<=p.y);}}}});

test('aim favors an enemy ahead over a closer enemy behind',()=>{
 const s=initialState();
 s.monsters=[{id:1,x:s.x-25,y:s.y,hp:100,respawn:0},{id:2,x:s.x+90,y:s.y,hp:100,respawn:0}];
 assert.equal(assistAim(s,1,0,'blade').target,2);
 s.monsters[1].hp=0;
 assert.equal(assistAim(s,1,0,'blade').target,1);
});
test('bandage crafting reports distance and cost without consuming materials',()=>{
 let s=initialState();s.monsters=[];s.scrap=20;
 const before=s.bandages??0;
 let next=advance(s,{type:'craft',target:'bandage'},0,100000);
 assert.equal(next.scrap,20);assert.equal(next.bandages??0,before);
 assert.ok(next.events.includes('Visit Wrench at the workshop.'));
 s.x=NPCS[2].x;s.y=NPCS[2].y;s.scrap=7;
 next=advance(s,{type:'craft',target:'bandage'},0,100000);
 assert.equal(next.scrap,7);assert.equal(next.bandages??0,before);
 assert.ok(next.events.includes('Needs 8 scrap.'));
 s.scrap=8;next=advance(s,{type:'craft',target:'bandage'},0,100000);
 assert.equal(next.scrap,0);assert.equal(next.bandages,before+1);
});
