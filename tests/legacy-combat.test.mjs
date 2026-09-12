import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {advance,initialState,legacyCount,legacyTitle,NPCS,SEWER_DOOR,DUNGEON,newDungeonMonsters} from '../packages/game-core/world.ts';
const now=100000;
function arena(){const s=initialState();s.monsters=[{id:0,kind:'slime',x:s.x+60,y:s.y,hp:60,respawn:0}];return s}
function strike(s,dx=1,dy=0,t=now){s=advance(s,{type:'attack',dx,dy},0,t);return s.strike?advance(s,{type:'tick'},0,s.strike.at):s}
test('melee aim assistance selects a nearby target but still requires windup',()=>{
 let s=arena();s=advance(s,{type:'attack',dx:-1,dy:0},0,now);assert.equal(s.monsters[0].hp,60);assert.ok(s.strike);
 s=advance(s,{type:'tick'},0,now+130);assert.equal(s.monsters[0].hp,35);
 s=strike(s,1,0,now+1000);assert.equal(s.monsters[0].hp,10);
});
test('hammer hits multiple targets; blaster spends energy and reaches farther',()=>{
 let s=arena();s.loot=[{id:'h',key:'king_blade'}];s.equipment={weapon:'h'};s.monsters.push({...s.monsters[0],id:1,y:s.y+20});
 s=strike(s);assert.deepEqual(s.monsters.map(m=>m.hp),[15,15]);assert.equal(s.hits.length,2);
 s=arena();s.monsters[0].x=s.x+300;s.loot=[{id:'b',key:'neon_blade'}];s.equipment={weapon:'b'};s=strike(s);assert.equal(s.monsters[0].hp,23);assert.equal(s.energy,88);
 s.energy=0;s=strike(s,1,0,now+1000);assert.equal(s.monsters[0].hp,23);
});
test('dodge consumes stamina, enforces cooldown and cannot cross a building',()=>{
 let s=initialState();s.x=800;s.y=570;
 s=advance(s,{type:'dodge',dx:0,dy:1},0,now);assert.ok(s.y<=585);assert.equal(s.stamina,70);
 const y=s.y;s=advance(s,{type:'dodge',dx:0,dy:1},0,now+100);assert.equal(s.y,y);assert.equal(s.stamina,70);
 s.stamina=20;s=advance(s,{type:'dodge',dx:1,dy:0},0,now+1000);assert.equal(s.stamina,20);
});
test('dodge protection avoids a boss slam and cancels a medkit',()=>{
 let s=initialState();s.interior=11;s.x=1200;s.y=365;s.healing={startedAt:now-1000,readyAt:now+500};
 s.dungeon={run:1,hits:0,deaths:0,cleared:false,monsters:[{...newDungeonMonsters()[6],slamAt:now}]};
 s=advance(s,{type:'dodge',dx:0,dy:-1},0,now);assert.equal(s.hp,100);assert.equal(s.medkits,2);assert.equal(s.healing,undefined);
});
test('rat, slime and bug telegraph before dealing damage',()=>{
 for(const kind of ['rat','slime','bug']){let s=initialState();s.x=1930;s.y=480;s.monsters=[{id:0,kind,x:1930,y:480,hp:100,respawn:0}];
 s=advance(s,{type:'tick'},0,now);assert.equal(s.hp,100);assert.ok(s.monsters[0].windup);
 s=advance(s,{type:'tick'},0,s.monsters[0].windup.at);assert.ok(s.hp<100);assert.equal(s.lastDamage,s.monsters[0].lastSkill);}
});
test('bandage restores 30 HP over six seconds and shares medkit cooldown',()=>{
 let s=initialState();s.hp=40;s.bandages=1;s=advance(s,{type:'heal',target:'bandage'},0,now);assert.equal(s.bandages,0);assert.equal(s.hp,40);
 for(let i=1;i<=6;i++)s=advance(s,{type:'tick'},1000,now+i*1000);
 assert.equal(s.hp,70);assert.equal(s.bandage,undefined);
 s=advance(s,{type:'heal'},0,now+6100);assert.equal(s.healing,undefined);assert.equal(s.medkits,2);
});
test('damage stops a bandage before its next heal tick; full health keeps the item',()=>{
 let s=initialState();s.bandages=1;s=advance(s,{type:'heal',target:'bandage'},0,now);assert.equal(s.bandages,1);
 s.hp=50;s=advance(s,{type:'heal',target:'bandage'},0,now+100);s.interior=11;s.x=1200;s.y=365;
 s.dungeon={run:1,cleared:false,monsters:[{...newDungeonMonsters()[6],slamAt:now+1000}]};s=advance(s,{type:'tick'},900,now+1000);assert.equal(s.hp,22);assert.equal(s.bandage,undefined);
});
test('Legacy claim requires server progress and is exactly once',()=>{
 let s=advance(initialState(),{type:'legacy_claim',target:'kills25'},0,now);assert.equal(s.scrap,0);
 s.kills=25;s=advance(s,{type:'legacy_claim',target:'kills25'},0,now+1);assert.equal(s.scrap,15);assert.equal(s.legacy.claimed.kills25,now+1);
 s=advance(s,{type:'legacy_claim',target:'kills25'},0,now+2);assert.equal(s.scrap,15);
 s=advance(s,{type:'legacy_title',target:'flawless'},0,now+3);assert.equal(legacyTitle(s),undefined);
 s=advance(s,{type:'legacy_title',target:'kills25'},0,now+4);assert.equal(legacyTitle(s),'Street Cleaner');
});
test('three pins maximum, no duplicates or unknown goals',()=>{
 let s=initialState();for(const id of ['kills25','kills100','kills500','species','forged'])s=advance(s,{type:'legacy_pin',target:id},0,now);
 assert.deepEqual(s.legacy.pins,['kills25','kills100','kills500']);s=advance(s,{type:'legacy_pin',target:'kills25'},0,now);assert.deepEqual(s.legacy.pins,['kills100','kills500']);
});
test('Legacy persists across daily reset and counts only successful recipes',()=>{
 let s=initialState();s=advance(s,{type:'craft',target:'bandage'},0,now);assert.equal(legacyCount(s,'recipes'),0);
 s.x=NPCS[2].x;s.y=NPCS[2].y;s.scrap=100;s.circuits=2;s=advance(s,{type:'craft',target:'bandage'},0,now);s=advance(s,{type:'craft'},0,now+100);assert.equal(legacyCount(s,'recipes'),2);
 const unlocked=s.legacy.unlocked.recipes;s=advance(s,{type:'tick'},0,now+86400000);assert.equal(s.legacy.unlocked.recipes,unlocked);
});
test('old sewer runs cannot fabricate flawless history; fresh runs preserve damage across re-entry',()=>{
 let s=initialState();s.interior=11;s.x=1180;s.y=245;s.dungeon={run:1,cleared:false,monsters:[{...newDungeonMonsters()[6],hp:25}]};s=strike(s);assert.equal(s.legacy.flawless,false);assert.equal(s.legacy.deathless,false);
 s=initialState();Object.assign(s,SEWER_DOOR);s=advance(s,{type:'dungeon_enter'},0,now);s.dungeon.hits=1;Object.assign(s,DUNGEON.exit);s=advance(s,{type:'exit'},0,now+100);s=advance(s,{type:'dungeon_enter'},0,now+200);assert.equal(s.dungeon.hits,1);
 s.x=1180;s.y=245;s.dungeon.monsters=[{...newDungeonMonsters()[6],hp:25}];s=strike(s,1,0,now+1000);assert.equal(s.legacy.deathless,true);assert.equal(s.legacy.flawless,false);
});
test('concurrent stale reward writes cannot duplicate a payout',()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE players(user_id TEXT PRIMARY KEY,state TEXT,revision INTEGER,updated_at INTEGER)');
 const s=initialState();s.kills=25;db.prepare('INSERT INTO players VALUES(?,?,0,0)').run('p',JSON.stringify(s));
 const next=advance(s,{type:'legacy_claim',target:'kills25'},0,now);
 const source=readFileSync(new URL('../app/api/game/route.ts',import.meta.url),'utf8');const sql=source.match(/UPDATE players SET state=\?,revision=revision\+1,updated_at=\? WHERE user_id=\? AND revision=\? RETURNING revision/)[0];
 const write=db.prepare(sql);assert.equal(write.all(JSON.stringify(next),now,'p',0).length,1);assert.equal(write.all(JSON.stringify(next),now,'p',0).length,0);
 assert.equal(JSON.parse(db.prepare('SELECT state FROM players').get().state).scrap,15);db.close();
});
test('social evidence deduplicates owners and excludes self-visits',()=>{
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0015_panda_legacy.sql',import.meta.url),'utf8'));
 db.exec("CREATE TABLE account_wallets(user_id TEXT,address TEXT);CREATE TABLE registrations(user_id TEXT,status TEXT);INSERT INTO account_wallets VALUES('host','0xABC');INSERT INTO registrations VALUES('host','active');");
 const source=readFileSync(new URL('../lib/legacy.ts',import.meta.url),'utf8');const sql=source.match(/prepare\("(INSERT INTO legacy_visits[^\"]+)"\)/)[1];const visit=db.prepare(sql);
 for(let i=0;i<5;i++)visit.run('guest',now,'0xabc','guest');visit.run('host',now,'0xabc','host');assert.equal(db.prepare('SELECT COUNT(*) n FROM legacy_visits').get().n,1);db.close();
});
