import {townPropBlocked} from './town-scenery.ts';
import {townWallBlocked} from './town-boundary.ts';
import {WOODS_WORLD_WIDTH,WOODS_SOLIDS} from './woods-layout.ts';
import {WOODS_ALL_SPAWNS,WOODS_TREES,isWoodsMonster,isWoodsElite,woodsMonsterHealth,woodsKillReward,woodsRespawnDelay,woodsEvent} from './woods.ts';
import {woodsBossPhase,woodsSkillSpec,type WoodsSkill} from './woods-combat.ts';
export const REGIONS=[
{name:'Trash Town',level:'1–5',description:'A home built from everything the old world left behind. Meet the locals, earn your first scrap, and find your feet.',resources:'Scrap, circuits',faction:'The Salvagers'},
{name:'Rusty Woods',level:'5–10',description:'Twisted roots wrap around forgotten machines. The forest has learned to fight back.',resources:'Timber, wire',faction:'Rustborn'},
{name:'Junkyard Valley',level:'8–15',description:'Mountains of salvage, fiercely guarded. Nothing here stays abandoned for long.',resources:'Steel, components',faction:'Scrap Union'},
{name:'Neon District',level:'10–20',description:'Bright signs, dark alleys, and deals that change a scavenger’s life.',resources:'Energy, circuits',faction:'Neon Collective'},
{name:'Dead Metro',level:'15–25',description:'The last train left years ago. Something else moves through the tunnels now.',resources:'Copper, relics',faction:'Unclaimed'},
{name:'Toxic Sewers',level:'20–30',description:'Follow the green glow, but watch your step. The runoff has a life of its own.',resources:'Chemicals, filters',faction:'The Mutated'},
{name:'Forgotten Factory',level:'25–35',description:'Production never stopped. Nobody remembers what the machines are making.',resources:'Alloys, robotics',faction:'Iron Assembly'},
{name:'The Wasteland',level:'30–45',description:'Beyond the city lights, every journey is a story of survival.',resources:'Rare minerals',faction:'Nomads'},
{name:'Black Laboratory',level:'40–50',description:'Behind sealed doors lies the reason the world changed.',resources:'Experimental cores',faction:'Unknown'}];
export const WORLD={width:WOODS_WORLD_WIDTH,height:1700,spawn:{x:1150,y:880}};
export const BUILDINGS=[{x:940,y:390,w:300,h:260,sx:0,sy:0,sw:365,sh:340,name:'City Hall'},{x:1280,y:400,w:250,h:250,sx:368,sy:30,sw:294,sh:310,name:'Workshop'},{x:1280,y:800,w:250,h:240,sx:980,sy:57,sw:274,sh:283,name:'General Store'},{x:600,y:800,w:260,h:240,sx:0,sy:375,sw:285,sh:264,name:'The Trashy Tavern'},{x:600,y:400,w:260,h:250,sx:284,sy:377,sw:269,sh:261,name:'Clinic'},{x:940,y:1170,w:300,h:230,sx:559,sy:667,sw:341,sh:220,name:'Market Arcade'},{x:1280,y:1170,w:250,h:230,sx:666,sy:72,sw:315,sh:268,name:'Mechanic Garage'},{x:600,y:90,w:260,h:240,sx:1040,sy:371,sw:214,sh:267,name:'Apartments'},{x:600,y:1170,w:260,h:230,sx:0,sy:666,sw:232,sh:221,name:'Tech Exchange'},{x:1900,y:1330,w:280,h:230,sx:235,sy:678,sw:320,sh:209,name:'Salvage Depot'},{x:940,y:90,w:270,h:240,sx:560,sy:369,sw:268,sh:268,name:'Old Bank'}].map(b=>{
 // Keep entrance centres and pavement baselines fixed; widen facades and
 // grow roofs upward, leaving clearance below the northern perimeter.
 const maxH=Math.min(b.h*1.22,b.y+b.h-84);
 const w=Math.min(b.w*1.12,maxH*b.sw/b.sh),h=w*b.sh/b.sw;
 return {...b,x:b.x-(w-b.w)/2,y:b.y+b.h-h,w,h};
});
export const WORLD_LIMITS={left:59,right:WORLD.width-59,top:86,bottom:WORLD.height-94};
export function blocked(x:number,y:number){return x<WORLD_LIMITS.left||y<WORLD_LIMITS.top||x>WORLD_LIMITS.right||y>WORLD_LIMITS.bottom||townWallBlocked(x,y)||townPropBlocked(x,y)||WOODS_SOLIDS.some(p=>Math.abs(x-p.x)<p.w/2+12&&Math.abs(y-p.y)<p.h/2+12)||WOODS_TREES.some(t=>Math.hypot(x-t.x,y-t.y)<22)||BUILDINGS.some(b=>x>b.x-12&&x<b.x+b.w+12&&y>b.y+b.h-65&&y<b.y+b.h+8)}
export const NPCS=[{id:'scrappy',name:'Scrappy',x:1150,y:710,sx:195,sy:222,sw:89,sh:105,text:'Welcome to Trash Town. Those toxic slimes are eating our cables. Clear three out and I’ll make it worth your while.'},{id:'patch',name:'Dr. Patch',x:825,y:705,sx:205,sy:398,sw:76,sh:120,text:'Stay in one piece out there. I can patch you up for 15 scrap.'},{id:'wrench',name:'Wrench',x:1480,y:705,sx:825,sy:222,sw:89,sh:105,text:'Two circuits and 20 scrap. That’s all I need to make you a fresh medkit.'},{id:'merchant',name:'Bolt',x:1480,y:1095,sx:201,sy:590,sw:81,sh:112,text:'Welcome to the General Store. Medkits cost 30 scrap. I buy circuits for 4 scrap each.'}];
NPCS.push({id:'ranger',name:'Moss · Forest Ranger',x:2470,y:760,sx:195,sy:222,sw:89,sh:105,text:'The Ironroot Golem has awakened. Help me reclaim the forest. [E] Accept or turn in Roots of Rust.'});
export const parcels=Array.from({length:100},(_,i)=>({id:i+1,regionId:0,x:60+(i%10)*40,y:80+Math.floor(i/10)*40,width:32,height:32,rarity:i%17===0?'EPIC':i%5===0?'RARE':'COMMON',buildingSlots:i%17===0?6:i%5===0?4:2,status:i>=80?'SYSTEM':i>=70?'RESERVED':'UNRELEASED'}));
export type Monster={woodsLayout?:number;windup?:{at:number;x:number;y:number;skill?:WoodsSkill};lastSkill?:number;skillCycle?:number;navPath?:{x:number;y:number}[];navAt?:number;navGoal?:{x:number;y:number};mode?:'patrol'|'chase'|'return';waypoint?:number;slamAt?:number;lastSlam?:number;kind?:'slime'|'rat'|'bug'|'boss';id:number;x:number;y:number;hp:number;respawn:number};
export type NftGear={id:string;tokenId:number;name:string;image:string;slot:GearSlot;rarity:"common"|"uncommon"|"rare"|"epic"|"legendary"|"mythic";damage:number;armor:number;minLevel:number};
export type GameState={rustyWoodsEnabled?:boolean;woodsLayout?:number;woodsQuest?:'active'|'complete';woodsKills?:number;woodsBoss?:boolean;stamina?:number;energy?:number;dodgeUntil?:number;lastDodge?:number;strike?:{at:number;dx:number;dy:number;kind:WeaponKind;damage:number;target?:number};hits?:{x:number;y:number;amount:number}[];legacy?:LegacyProgress;bandages?:number;bandage?:{until:number;remaining:number;credit:number};healing?:{startedAt:number;readyAt:number};healCooldownUntil?:number;restSince?:number;restCredit?:number;nftGear?:NftGear[];hitFeedback?:{x:number;y:number;amount:number};townLayout?:number;loot?:LootItem[];equipment?:Partial<Record<GearSlot,string>>;dungeon?:{monsters:Monster[];cleared:boolean;run:number;hits?:number;deaths?:number};interior?:number;daily?:DailyProgress;motionBatch?:string;motionCredit?:number;weaponLevel?:number;salvageQuest?:'available'|'active'|'complete';bountyQuest?:'available'|'active'|'complete';bountyKills?:number;x:number;y:number;hp:number;xp:number;scrap:number;circuits:number;medkits:number;kills:number;quest:'available'|'active'|'complete';questKills:number;monsters:Monster[];lastAttack:number;lastDamage:number;events:string[];buildings:{id:string;parcel:number;x:number;y:number;rotation:number;type:string}[]};
export function initialState():GameState{return {...WORLD.spawn,townLayout:3,weaponLevel:0,salvageQuest:'available',bountyQuest:'available',bountyKills:0,hp:100,xp:0,scrap:0,circuits:0,medkits:2,kills:0,quest:'available',questKills:0,lastAttack:0,lastDamage:0,events:[],buildings:[],monsters:Array.from({length:8},(_,i)=>({id:i,kind:(i<4?'slime':i<6?'rat':'bug') as 'slime'|'rat'|'bug',x:1930+(i%3)*130,y:480+Math.floor(i/3)*230,hp:i<4?60:i<6?40:100,respawn:0}))}}
export type Intent={type:'move'|'attack'|'interact'|'heal'|'craft'|'tick'|'buy_medkit'|'sell_circuit'|'upgrade'|'salvage_quest'|'bounty_quest'|'daily_claim'|'cache'|'woods_event'|'enter'|'exit'|'dungeon_enter'|'equip'|'unequip'|'salvage'|'dodge'|'legacy_claim'|'legacy_pin'|'legacy_title';dx?:number;dy?:number;target?:string};
export type AdvanceOptions={monsterIds?:ReadonlySet<number>};
function advanceWorld(s:GameState,a:Intent,elapsed:number,now:number,options:AdvanceOptions={}):GameState {
 const next=migrateTown(s);next.events=[];delete next.hitFeedback;delete next.hits;next.daily=dailyFor(s,now);const dt=Math.max(0,Math.min(elapsed,1000))/1000;
 if(['attack','dodge','enter','exit','dungeon_enter'].includes(a.type)&&next.healing){delete next.healing;next.events.push('Medkit interrupted · item kept.');}
 if(a.type==='attack'||a.type==='dodge')next.restSince=now;
 next.stamina=Math.min(playerStats(next).stamina,(next.stamina??playerStats(next).stamina)+dt*18);next.energy=Math.min(playerStats(next).energy,(next.energy??playerStats(next).energy)+dt*8);
 if(['enter','exit','dungeon_enter'].includes(a.type))delete next.strike;
 if(a.type==='dodge'&&now-(next.lastDodge??0)>=900&&next.stamina>=30){const length=Math.hypot(a.dx??1,a.dy??0);if(length>0){next.stamina-=30;next.lastDodge=now;next.dodgeUntil=now+180;delete next.strike;Object.assign(next,movePosition(next,{dx:(a.dx??1)/length,dy:(a.dy??0)/length,ms:580},next.interior,next.rustyWoodsEnabled));}}
 if(a.type==='attack'&&!next.strike&&(next.interior===undefined||next.interior===11)){
 const kind=weaponKind(next),spec=WEAPONS[kind],length=Math.hypot(a.dx??1,a.dy??0);
 if(length>0&&now-next.lastAttack>=spec.cooldown&&next.energy>=spec.energy){next.lastAttack=now;next.energy-=spec.energy;next.strike={at:now+spec.windup,...assistAim(next,(a.dx??1)/length,(a.dy??0)/length,kind),kind,damage:gearStats(next).damage};}
 }

 if(a.type==='dungeon_enter'){
 if(next.interior===undefined&&Math.hypot(next.x-SEWER_DOOR.x,next.y-SEWER_DOOR.y)<85){next.interior=11;if(!next.dungeon||next.dungeon.cleared)next.dungeon={monsters:newDungeonMonsters(),cleared:false,hits:0,deaths:0,run:(next.dungeon?.run??0)+1};Object.assign(next,DUNGEON.spawn);next.events.push('Toxic Sewers · Defeat the Garbage King. Q uses a medkit.');}else next.events.push('Find the sewer hatch in the eastern outskirts.');return next;
 }
 if(a.type==='equip'&&a.target?.startsWith('nft-')){const item=next.nftGear?.find(i=>i.id===a.target);if(item&&1+Math.floor(next.xp/100)>=item.minLevel){next.equipment??={};next.equipment[item.slot]=item.id;next.events.push(`Equipped NFT: ${item.name}`);}else next.events.push('NFT unavailable or level requirement not met.');}
 if(a.type==='equip'&&!a.target?.startsWith('nft-')){const item=next.loot?.find(i=>i.id===a.target);if(item){const gear=GEAR[item.key];next.equipment??={};next.equipment[gear.slot]=item.id;next.events.push(`Equipped ${gear.name}`);}else next.events.push('That item is not in your stash.');}
 if(a.type==='unequip'){if(a.target==='weapon'||a.target==='armor'){delete next.equipment?.[a.target];next.events.push('Equipment removed.');}}
 if(a.type==='salvage'){const item=next.loot?.find(i=>i.id===a.target);if(item&&!Object.values(next.equipment??{}).includes(item.id)){const value=GEAR[item.key].rarity==='epic'?40:GEAR[item.key].rarity==='rare'?15:5;next.loot=next.loot!.filter(i=>i.id!==item.id);next.scrap+=value;next.events.push(`Salvaged gear · +${value} Scrap`);}else next.events.push('Unequip this item before salvaging.');}
 if(a.type==='enter'){
 const index=Number(a.target),door=BUILDINGS[index]&&buildingDoor(index);
 if(next.interior===undefined&&a.target!==undefined&&Number.isInteger(index)&&door&&Math.hypot(next.x-door.x,next.y-door.y)<75){next.interior=index;Object.assign(next,ROOM.spawn);next.events.push(`Entered ${BUILDINGS[index].name}`);return next;}
 next.events.push('Approach a building entrance and press E.');return next;
 }
 if(a.type==='exit'){
 if(next.interior!==undefined&&Math.hypot(next.x-sceneExit(next.interior).x,next.y-sceneExit(next.interior).y)<85){const door=next.interior===11?SEWER_DOOR:buildingDoor(next.interior);delete next.interior;Object.assign(next,door);next.events.push('Back in Trash Town.');return next;}
 next.events.push('Approach the exit at the bottom of the room.');return next;
 }
 if(a.type==='move')Object.assign(next,movePosition(next,{dx:a.dx??0,dy:a.dy??0,ms:dt*1000},next.interior,next.rustyWoodsEnabled));
 for(const m of activeMonsters(next)){
 if(options.monsterIds&&!options.monsterIds.has(m.id))continue;
 m.kind??=m.id<4?'slime':m.id<6?'rat':'bug';const home=monsterHome(m.id);
 if(m.hp<=0){if(next.interior!==11&&now>=m.respawn){m.hp=isWoodsMonster(m.id)?woodsMonsterHealth(m.id):m.kind==='bug'?100:m.kind==='rat'?40:60;Object.assign(m,home);m.mode='patrol';delete m.windup;delete m.slamAt;delete m.navPath;delete m.navGoal;m.lastSkill=now;m.lastSlam=now;m.skillCycle=0;}continue;}
 const toPlayer=next.interior===undefined&&next.x<1740?Infinity:Math.hypot(m.x-next.x,m.y-next.y),fromHome=Math.hypot(m.x-home.x,m.y-home.y);
 if(fromHome>460||(next.interior===undefined&&m.x<1740))m.mode='return';
 if(m.mode==='return'&&fromHome<18)m.mode='patrol';
 if(m.mode!=='return')m.mode=toPlayer<(m.mode==='chase'?290:210)?'chase':'patrol';
 let target:{x:number;y:number};
 if(m.mode==='chase')target=next;
 else if(m.mode==='return')target=home;
 else {const phase=(m.waypoint??m.id)%4,angle=phase*Math.PI/2+m.id*.73;target={x:home.x+Math.cos(angle)*65,y:home.y+Math.sin(angle)*65};if(Math.hypot(target.x-m.x,target.y-m.y)<12)m.waypoint=(m.waypoint??m.id)+1;}
 const forestSkill=isWoodsMonster(m.id)&&m.kind!=='boss'?woodsSkillSpec(m.id):undefined;
 const bossPhase=isWoodsMonster(m.id)&&m.kind==='boss'?woodsBossPhase(m.hp):undefined;
 const speed=(bossPhase?38*bossPhase.speedMultiplier:forestSkill?.moveSpeed??(m.kind==='boss'?38:m.kind==='rat'?90:m.kind==='bug'?48:52))*(m.mode==='patrol'?.45:1);
 if(m.kind==='boss'){
  if(bossPhase){
   if(m.slamAt&&now>=m.slamAt){if(now>=(next.dodgeUntil??0)&&Math.hypot(m.x-next.x,m.y-next.y)<bossPhase.slamRadius&&clearMonsterPath(m,next,next.interior)){next.hp-=Math.max(2,bossPhase.slamDamage-gearStats(next).armor);next.lastDamage=now;next.events.push(`Ironroot phase ${bossPhase.phase} · ground slam!`);}m.slamAt=undefined;m.lastSlam=now;m.lastSkill=now;}
   else if(m.windup?.skill==='root-burst'&&now>=m.windup.at){const root=m.windup;delete m.windup;m.lastSkill=now;if(now>=(next.dodgeUntil??0)&&Math.hypot(next.x-root.x,next.y-root.y)<bossPhase.rootRadius&&clearMonsterPath(m,next,next.interior)){next.hp-=Math.max(2,bossPhase.rootDamage-gearStats(next).armor);next.lastDamage=now;next.events.push('Ironroot roots erupted beneath you!');}}
   else if(m.mode==='chase'&&!m.slamAt&&!m.windup&&now-(m.lastSkill??m.lastSlam??0)>bossPhase.cooldown&&toPlayer<Math.max(190,bossPhase.rootRange)){const useRoot=bossPhase.phase>1&&((m.skillCycle??0)%2===1)&&toPlayer<bossPhase.rootRange;m.skillCycle=(m.skillCycle??0)+1;if(useRoot)m.windup={skill:'root-burst',at:now+bossPhase.rootWindup,x:next.x,y:next.y};else if(toPlayer<210)m.slamAt=now+bossPhase.slamWindup;}
  }else{
   if(m.slamAt&&now>=m.slamAt){if(now>=(next.dodgeUntil??0)&&Math.hypot(m.x-next.x,m.y-next.y)<145&&clearMonsterPath(m,next,next.interior)){next.hp-=Math.max(2,28-gearStats(next).armor);next.lastDamage=now;next.events.push('Ground slam! Move out of the warning ring.');}m.slamAt=undefined;m.lastSlam=now;}
   else if(m.mode==='chase'&&!m.slamAt&&now-(m.lastSlam??0)>4500&&toPlayer<180)m.slamAt=now+1100;
  }
 }
 if(m.kind!=='boss'){
  if(forestSkill){
   if(m.windup&&now>=m.windup.at){const target=m.windup;m.lastSkill=now;delete m.windup;if(forestSkill.origin==='impact'&&forestSkill.dashMs)moveMonster(m,target,forestSkill.dashMs,forestSkill.dashScale??.3,activeMonsters(next),0,next.interior);const center=forestSkill.origin==='target'?target:forestSkill.origin==='impact'?m:m;if(now>=(next.dodgeUntil??0)&&Math.hypot(next.x-center.x,next.y-center.y)<forestSkill.radius&&clearMonsterPath(m,next,next.interior)){next.hp-=Math.max(1,forestSkill.damage-gearStats(next).armor);next.lastDamage=now;next.events.push(`${forestSkill.label}! Dodge the telegraph.`);}}
   else if(!m.windup&&m.mode==='chase'&&now-(m.lastSkill??0)>forestSkill.cooldown&&toPlayer<forestSkill.range&&clearMonsterPath(m,next,next.interior))m.windup={skill:forestSkill.skill,at:now+forestSkill.windup,x:next.x,y:next.y};
  }else{
   if(m.windup&&now>=m.windup.at){const target=m.windup;m.lastSkill=now;delete m.windup;if(m.kind==='rat')moveMonster(m,target,480,.25,activeMonsters(next),0,next.interior);const center=m.kind==='slime'?target:m,radius=m.kind==='slime'?65:m.kind==='bug'?95:60;if(now>=(next.dodgeUntil??0)&&Math.hypot(next.x-center.x,next.y-center.y)<radius&&clearMonsterPath(m,next,next.interior)){next.hp-=Math.max(1,(m.kind==='bug'?20:m.kind==='rat'?10:12)-gearStats(next).armor);next.lastDamage=now;}}
   else if(!m.windup&&m.mode==='chase'&&now-(m.lastSkill??0)>1800&&toPlayer<(m.kind==='slime'?220:m.kind==='rat'?150:115)&&clearMonsterPath(m,next,next.interior))m.windup={at:now+(m.kind==='bug'?950:m.kind==='slime'?800:650),x:next.x,y:next.y};
  }
 }
 if(!m.slamAt&&!m.windup){
 let destination=target,stop=m.mode==='chase'?(forestSkill?.stopDistance??38):4;
 if(!clearMonsterPath(m,target,next.interior)){
 if(!m.navPath?.length||now-(m.navAt??0)>1000||!m.navGoal||Math.hypot(target.x-m.navGoal.x,target.y-m.navGoal.y)>64){m.navPath=findMonsterPath(m,target,next.interior);m.navAt=now;m.navGoal={x:target.x,y:target.y};}
 while(m.navPath?.length&&Math.hypot(m.navPath[0].x-m.x,m.navPath[0].y-m.y)<9)m.navPath.shift();
 if(m.navPath?.length){destination=m.navPath[0];stop=4;}else destination=m;
 }else m.navPath=[];
 moveMonster(m,destination,speed,dt,activeMonsters(next),stop,next.interior);
 }
 if(m.kind==='boss'&&now>=(next.dodgeUntil??0)&&m.mode==='chase'&&Math.hypot(m.x-next.x,m.y-next.y)<47&&clearMonsterPath(m,next,next.interior)&&now-next.lastDamage>1100){next.hp-=Math.max(1,(m.kind==='boss'?16:m.kind==='bug'?14:m.kind==='rat'?6:9)-gearStats(next).armor);next.lastDamage=now;}
 }

 if(next.hp<=0)delete next.strike;
 if(next.strike&&now>=next.strike.at){const strike=next.strike;delete next.strike;const spec=WEAPONS[strike.kind];const locked=activeMonsters(next).find(m=>m.id===strike.target&&m.hp>0);if(locked&&Math.hypot(locked.x-next.x,locked.y-next.y)<spec.range&&clearMonsterPath(next,locked,next.interior)){const d=Math.hypot(locked.x-next.x,locked.y-next.y);if(d>0){strike.dx=(locked.x-next.x)/d;strike.dy=(locked.y-next.y)/d;}}
 const targets=activeMonsters(next).filter(m=>{const x=m.x-next.x,y=m.y-next.y,d=Math.hypot(x,y);return m.hp>0&&d<spec.range&&(d<1||(x*strike.dx+y*strike.dy)/d>=spec.arc)&&clearMonsterPath(next,m,next.interior)}).sort((a,b)=>Math.hypot(a.x-next.x,a.y-next.y)-Math.hypot(b.x-next.x,b.y-next.y)).slice(0,strike.kind==='hammer'?8:1);
 for(const hit of targets){next.hitFeedback={x:hit.x,y:hit.y,amount:Math.min(hit.hp,strike.damage)};next.hits??=[];next.hits.push(next.hitFeedback);hit.hp-=strike.damage;if(hit.hp<=0){hit.respawn=now+(isWoodsMonster(hit.id)?woodsRespawnDelay(hit.id):25000);if(isWoodsMonster(hit.id)&&next.woodsQuest==='active'){if(hit.kind==='boss')next.woodsBoss=true;else if(!isWoodsElite(hit.id))next.woodsKills=(next.woodsKills??0)+1;}next.scrap+=12;next.circuits++;next.xp+=20;next.kills++;next.daily.kills++;if(next.quest==='active'&&!isWoodsMonster(hit.id)&&(!hit.kind||hit.kind==='slime'))next.questKills++;if(next.bountyQuest==='active'&&hit.kind==='rat')next.bountyKills=(next.bountyKills??0)+1;next.events.push('+12 scrap · +1 circuit · +20 XP');const forestReward=woodsKillReward(hit.id);if(forestReward){next.scrap+=forestReward.scrap;next.circuits+=forestReward.circuits;next.xp+=forestReward.xp;const circuitText=forestReward.circuits?` · +${forestReward.circuits} circuit${forestReward.circuits===1?'':'s'}`:'';next.events.push(`${forestReward.label} · +${forestReward.scrap} scrap${circuitText} · +${forestReward.xp} XP`);}if(isWoodsElite(hit.id))awardGuaranteedLoot(next,hit.id===27?'whisper_mantle':'hauler_arc_blaster',now,`elite-${hit.id}`);else awardLoot(next,hit,now);if(hit.kind==='boss'&&next.interior===11&&next.dungeon){next.dungeon.cleared=true;next.scrap+=150;next.xp+=150;next.medkits+=2;next.events.push('GARBAGE KING DEFEATED! +150 Scrap · +150 XP · +2 medkits. Return to the entrance.')}}}}
 if(a.type==='interact'){const npc=sceneNPCS(next.interior).find(n=>n.id===a.target&&Math.hypot(n.x-next.x,n.y-next.y)<125);if(npc?.id==='ranger'){if(!next.woodsQuest){next.woodsQuest='active';next.woodsKills=0;next.woodsBoss=false;next.events.push('Roots of Rust accepted: defeat 6 forest creatures and the Ironroot Golem, then return to Moss.');}else if(next.woodsQuest==='active'&&(next.woodsKills??0)>=6&&next.woodsBoss){next.woodsQuest='complete';next.scrap+=200;next.xp+=200;next.medkits+=2;next.events.push('Roots of Rust complete · +200 Scrap · +200 XP · +2 medkits.');}else next.events.push(next.woodsQuest==='complete'?'The forest remembers your help.':`Forest creatures: ${Math.min(6,next.woodsKills??0)}/6 · Golem: ${next.woodsBoss?'defeated':'alive'}. Land the finishing blow for quest credit.`);}if(npc?.id==='scrappy'){if(next.quest==='available'){next.quest='active';next.questKills=0;next.events.push('Quest accepted: A Cleaner Tomorrow')}else if(next.quest==='active'&&next.questKills>=3){next.quest='complete';next.scrap+=100;next.xp+=100;next.events.push('Quest complete! +100 scrap · +100 XP')}else next.events.push('Clear 3 toxic slimes east of town, then return to Scrappy.')}if(npc?.id==='patch'){if(next.scrap>=15&&next.hp<playerStats(next).hp){next.scrap-=15;next.hp=playerStats(next).hp;next.events.push('Patched up. −15 scrap')}else next.events.push(next.hp===playerStats(next).hp?'You are already healthy.':'You need 15 scrap.')}}
 if(a.type==='craft'&&a.target!=='bandage'){if(!nearService(next,'wrench',140))next.events.push('Visit Wrench at the workshop.');else if(next.scrap>=20&&next.circuits>=2){next.scrap-=20;next.circuits-=2;next.medkits++;next.daily.crafted++;next.events.push('Crafted 1 medkit')}else next.events.push('Needs 20 scrap + 2 circuits.')}
 if(a.type==='buy_medkit'||a.type==='sell_circuit'){if(!nearService(next,'merchant',130))next.events.push('Visit the General Store to trade.');else if(a.type==='buy_medkit'){if(next.scrap>=30){next.scrap-=30;next.medkits++;next.events.push('Bought a medkit · −30 scrap')}else next.events.push('A medkit costs 30 scrap.')}else if(next.circuits>0){next.circuits--;next.scrap+=4;next.events.push('Sold a circuit · +4 scrap')}else next.events.push('No circuits to sell.')}
 if(a.type==='upgrade'){const lvl=next.weaponLevel??0,cost=75*(lvl+1),parts=5*(lvl+1);if(!nearService(next,'wrench',140))next.events.push('Visit Wrench to upgrade your blade.');else if(lvl>=3)next.events.push('Your blade is fully upgraded.');else if(next.scrap>=cost&&next.circuits>=parts){next.scrap-=cost;next.circuits-=parts;next.weaponLevel=lvl+1;next.events.push('Blade upgraded · +5 damage')}else next.events.push(`Needs ${cost} scrap + ${parts} circuits.`)}
 if(a.type==='salvage_quest'){if(!nearService(next,'wrench',140))next.events.push('Talk to Wrench at the workshop.');else if(!next.salvageQuest||next.salvageQuest==='available'){next.salvageQuest='active';next.events.push('Quest accepted: Spare Parts. Bring Wrench 6 circuits.')}else if(next.salvageQuest==='active'&&next.circuits>=6){next.circuits-=6;next.scrap+=75;next.xp+=70;next.salvageQuest='complete';next.events.push('Spare Parts complete · +75 scrap · +70 XP')}else next.events.push(next.salvageQuest==='complete'?'Wrench already has the parts.':'You need 6 circuits.')}
 if(a.type==='bounty_quest'){if(!nearService(next,'scrappy',130))next.events.push('Visit Scrappy in the town square.');else if(!next.bountyQuest||next.bountyQuest==='available'){next.bountyQuest='active';next.bountyKills=0;next.events.push('Bounty accepted: Rat Problem. Defeat 5 trash rats.')}else if(next.bountyQuest==='active'&&(next.bountyKills??0)>=5){next.bountyQuest='complete';next.scrap+=120;next.xp+=120;next.events.push('Rat Problem complete · +120 scrap · +120 XP')}else next.events.push(next.bountyQuest==='complete'?'This bounty has already been claimed.':`Trash rats defeated: ${next.bountyKills??0}/5`)}
 // Resolve incoming damage before any healing. A fatal hit cannot be rescued by a pending medkit.
 if(next.lastDamage===now){delete next.bandage;if(next.healing)next.events.push('Medkit interrupted by damage · item kept.');delete next.healing;next.restSince=now;next.restCredit=0;}
 if(next.healing&&now>=next.healing.readyAt){
 if(next.hp>0&&next.hp<playerStats(next).hp&&next.medkits>0){next.medkits--;next.hp=Math.min(playerStats(next).hp,next.hp+Math.round(playerStats(next).hp*.5));next.healCooldownUntil=now+6000;next.events.push('Used medkit · 50% maximum HP restored.');}
 delete next.healing;
 }
 if(a.type==='heal'&&a.target!=='bandage'&&!next.bandage&&!next.healing&&next.hp>0&&next.hp<playerStats(next).hp&&next.medkits>0&&now>=(next.healCooldownUntil??0)){
 next.healing={startedAt:now,readyAt:now+1500};next.events.push('Applying medkit · 1.5 seconds. Attacking or taking damage interrupts.');
 }
 if(a.type==='craft'&&a.target==='bandage'){
  if(!nearService(next,'wrench',140))next.events.push('Visit Wrench at the workshop.');
  else if(next.scrap<8)next.events.push('Needs 8 scrap.');
  else {next.scrap-=8;next.bandages=(next.bandages??0)+1;next.events.push('Crafted field bandage · 8 Scrap.');}
 }
 if(a.type==='heal'&&a.target==='bandage'&&!next.healing&&!next.bandage&&next.hp>0&&next.hp<playerStats(next).hp&&(next.bandages??0)>0&&now>=(next.healCooldownUntil??0)){
 next.bandages!--;next.bandage={until:now+6000,remaining:Math.round(playerStats(next).hp*.3),credit:0};next.healCooldownUntil=now+12000;next.events.push('Bandage applied · 30% maximum HP over 6 seconds. Damage interrupts.');
 }else if(next.bandage&&next.hp>0){
 const b=next.bandage;const seconds=Math.min(dt,Math.max(0,(b.until-(now-Math.max(0,elapsed)))/1000));b.credit+=seconds*Math.round(playerStats(next).hp*.3)/6;
 const hp=Math.min(b.remaining,Math.floor(b.credit));next.hp=Math.min(playerStats(next).hp,next.hp+hp);b.remaining-=hp;b.credit-=hp;
 if(now>=b.until||!b.remaining||next.hp>=playerStats(next).hp)delete next.bandage;
 }
 const safe=next.interior===undefined?next.x<1740:next.interior!==11;
 if(!safe||(a.type==='attack'||a.type==='dodge')||next.lastDamage===now){next.restSince=now;next.restCredit=0;}
 else {
 next.restSince??=now;
 if(now-Math.max(next.restSince,next.lastDamage,next.lastAttack)>=10000&&next.hp>0&&next.hp<playerStats(next).hp&&!next.healing&&!next.bandage){
 next.restCredit=(next.restCredit??0)+dt*2;const restored=Math.floor(next.restCredit);next.hp=Math.min(playerStats(next).hp,next.hp+restored);next.restCredit-=restored;
 }
 }

 if(a.type==='cache'){
 const cache=CACHES.find(c=>c.id===a.target);
 if(next.interior!==undefined||!cache||Math.hypot(next.x-cache.x,next.y-cache.y)>85)next.events.push('Move closer to a salvage cache.');
 else if(next.daily.caches.includes(cache.id))next.events.push('Already searched today. Restocked at 00:00 UTC.');
 else {next.daily.caches.push(cache.id);next.scrap+=20;next.circuits++;next.xp+=10;next.events.push('Hidden salvage found! +20 Scrap · +1 circuit · +10 XP');}
 }
 if(a.type==='woods_event'){
 const event=woodsEvent(a.target??'');const elite=event?next.monsters.find(m=>m.id===event.eliteId):undefined;
 if(next.interior!==undefined||!event||Math.hypot(next.x-event.x,next.y-event.y)>105)next.events.push('Move closer to the landmark recovery point.');
 else if(!elite||elite.hp>0||now>=elite.respawn)next.events.push(`${event.name} · elite threat still active.`);
 else if(next.daily.caches.includes(event.claimKey))next.events.push(`${event.name} · reward already recovered today.`);
 else {next.daily.caches.push(event.claimKey);next.scrap+=event.reward.scrap;next.circuits+=event.reward.circuits;next.xp+=event.reward.xp;next.events.push(`${event.name} complete · +${event.reward.scrap} Scrap · +${event.reward.circuits} circuits · +${event.reward.xp} XP`);}
 }
 if(a.type==='daily_claim'){
 const quest=DAILIES.find(q=>q.id===a.target);
 if(quest&&!next.daily.claimed.includes(quest.id)&&dailyCount(next.daily,quest.id)>=quest.goal){next.daily.claimed.push(quest.id);next.scrap+=quest.scrap;next.xp+=quest.xp;next.events.push(`Daily complete: ${quest.title} · +${quest.scrap} Scrap · +${quest.xp} XP`);}
 else next.events.push('Daily reward unavailable: finish the task or check if already claimed.');
 }
 if(next.hp<=0){delete next.strike;delete next.bandage;delete next.healing;next.restSince=now;next.restCredit=0;delete next.interior;next.hp=playerStats(next).hp;next.x=WORLD.spawn.x;next.y=WORLD.spawn.y;next.scrap=Math.max(0,next.scrap-20);next.events.push('Rescued by the clinic. Up to 20 scrap lost.')}
 return next;
}

// Shared, bounded substeps prevent tunnelling and keep prediction identical to authority.
export type MotionInput={dx:number;dy:number;ms:number};
export function movePosition(p:{x:number;y:number},input:MotionInput,interior?:number,rustyWoodsEnabled=true){
 let {x,y}=p;const length=Math.max(1,Math.hypot(input.dx,input.dy));
 let remaining=Math.min(1000,Math.max(0,input.ms));
 while(remaining>0){const step=Math.min(8,remaining);remaining-=step;
 const nx=x+input.dx/length*190*step/1000;if((interior!==undefined||rustyWoodsEnabled||nx<=2320)&&!sceneBlocked(nx,y,interior))x=nx;
 const ny=y+input.dy/length*190*step/1000;if(!sceneBlocked(x,ny,interior))y=ny;}
 return {x,y};
}
export function replayMotion(p:{x:number;y:number;interior?:number;rustyWoodsEnabled?:boolean},inputs:MotionInput[]){return inputs.reduce((point,input)=>movePosition(point,input,p.interior,p.rustyWoodsEnabled),{x:p.x,y:p.y})}
export function applyMotion(s:GameState,inputs:MotionInput[],elapsed:number,batch:string){
 const next=structuredClone(s);let credit=Math.min(1000,(s.motionCredit??250)+Math.max(0,elapsed));
 for(const input of inputs){const ms=Math.min(input.ms,credit);Object.assign(next,movePosition(next,{...input,ms},next.interior,next.rustyWoodsEnabled));credit-=ms;}
 next.motionCredit=Math.min(250,credit);next.motionBatch=batch;return next;
}

export function monsterHome(id:number){const woods=WOODS_ALL_SPAWNS.find(m=>m.id===id);if(woods)return {x:woods.x,y:woods.y};if(id>=100)return DUNGEON_SPAWNS[id-100]??DUNGEON.spawn;return {x:1930+(id%3)*130,y:480+Math.floor(id/3)*230}}
// Swept collision, deterministic steering and soft separation; no client combat authority.
function moveMonster(m:Monster,target:{x:number;y:number},speed:number,dt:number,others:Monster[],stop:number,interior?:number){
 let remaining=dt;
 while(remaining>0){const step=Math.min(.025,remaining);remaining-=step;
 const distance=Math.hypot(target.x-m.x,target.y-m.y);if(distance<=stop)break;
 let vx=(target.x-m.x)/distance,vy=(target.y-m.y)/distance;
 for(const other of others){if(other.id===m.id||other.hp<=0)continue;const d=Math.hypot(m.x-other.x,m.y-other.y);if(d>0&&d<38){vx+=(m.x-other.x)/d*(38-d)/38*.85;vy+=(m.y-other.y)/d*(38-d)/38*.85;}}
 const angle=Math.atan2(vy,vx),length=Math.min(speed*step,distance-stop);const side=m.id%2?1:-1;
 for(const offset of [0,side*.55,-side*.55,side*1.1,-side*1.1,side*1.57]){const x=m.x+Math.cos(angle+offset)*length,y=m.y+Math.sin(angle+offset)*length;
 if(!sceneBlocked(x,y,interior)&&!sceneBlocked(x-10,y,interior)&&!sceneBlocked(x+10,y,interior)&&!sceneBlocked(x,y-7,interior)&&!sceneBlocked(x,y+7,interior)){m.x=x;m.y=y;break;}}
 }
}

export type DailyProgress={day:string;kills:number;crafted:number;caches:string[];claimed:string[]};
export const DAILIES=[{id:'patrol',title:'Neighborhood Watch',text:'Defeat 5 monsters in town, Rusty Woods or the sewers.',goal:5,scrap:60,xp:60},{id:'supplies',title:'Ready for Tomorrow',text:'Craft 1 field medkit with Wrench.',goal:1,scrap:35,xp:35},{id:'explore',title:'One Panda’s Treasure',text:'Search 2 different hidden salvage caches.',goal:2,scrap:45,xp:45}] as const;
export const CACHES=[{id:'west',x:185,y:600},{id:'south',x:950,y:1550},{id:'east',x:2230,y:1300},{id:'north',x:1970,y:390},{id:'woods-south',x:2780,y:1380},{id:'woods-north',x:3450,y:350}] as const;
export function dailyFor(s:GameState,now:number):DailyProgress{const day=new Date(now).toISOString().slice(0,10);return s.daily?.day===day?structuredClone(s.daily):{day,kills:0,crafted:0,caches:[],claimed:[]}}
export function dailyCount(d:DailyProgress,id:string){return id==='patrol'?d.kills:id==='supplies'?d.crafted:id==='explore'?d.caches.length:0}

export const ROOM={width:800,height:600,spawn:{x:400,y:480},exit:{x:400,y:538}};
export const ROOM_FURNITURE=[{x:100,y:155,w:145,h:105},{x:555,y:155,w:145,h:105},{x:105,y:355,w:110,h:65},{x:585,y:355,w:110,h:65},{x:305,y:130,w:190,h:55}];
export function buildingDoor(index:number){const b=BUILDINGS[index];return {x:b.x+b.w/2,y:b.y+b.h+38}}
export function sceneBlocked(x:number,y:number,interior?:number){return interior===11?!dungeonWalkable(x,y):interior===undefined?blocked(x,y):x<65||x>735||y<115||y>545||ROOM_FURNITURE.some(f=>x>f.x-10&&x<f.x+f.w+10&&y>f.y-8&&y<f.y+f.h+8)}
export function sceneNPCS(interior?:number){if(interior===undefined)return NPCS;const id=interior===0?'scrappy':interior===1||interior===6?'wrench':interior===2||interior===5?'merchant':interior===4?'patch':null;return id?NPCS.filter(n=>n.id===id).map(n=>({...n,x:400,y:245})):[]}
function nearService(s:GameState,id:string,radius:number){return sceneNPCS(s.interior).some(n=>n.id===id&&Math.hypot(s.x-n.x,s.y-n.y)<=radius)}

export type GearSlot='weapon'|'armor';
export const GEAR={
 rusty_blade:{name:'Rusty Fang',slot:'weapon',rarity:'common',damage:5,armor:0},
 neon_blade:{name:'Neon Blaster',slot:'weapon',rarity:'rare',damage:12,armor:0},
 king_blade:{name:'Scrap Hammer',slot:'weapon',rarity:'epic',damage:20,armor:0},
 scrap_vest:{name:'Salvager Vest',slot:'armor',rarity:'common',damage:0,armor:2},
 reinforced_vest:{name:'Scavenger Hood',slot:'armor',rarity:'rare',damage:0,armor:4},
 whisper_mantle:{name:'Whisper Mantle',slot:'armor',rarity:'rare',damage:0,armor:6},
 hauler_arc_blaster:{name:'Hauler Arc Blaster',slot:'weapon',rarity:'rare',damage:16,armor:0},
 king_armor:{name:'King Gauntlets',slot:'armor',rarity:'epic',damage:0,armor:7}
} as const;
export type LootItem={id:string;key:keyof typeof GEAR};
export function gearStats(s:GameState){let damage=25+(s.weaponLevel??0)*5+playerStats(s).damage,armor=playerStats(s).armor;for(const slot of ['weapon','armor'] as const){const item=s.loot?.find(i=>i.id===s.equipment?.[slot]);if(item&&GEAR[item.key].slot===slot){damage+=GEAR[item.key].damage;armor+=GEAR[item.key].armor;}const nft=s.nftGear?.find(i=>i.id===s.equipment?.[slot]&&i.slot===slot);if(nft&&1+Math.floor(s.xp/100)>=nft.minLevel){damage+=nft.damage;armor+=nft.armor;}}return {damage,armor}}
function awardLoot(s:GameState,m:Monster,now:number){
 const random=new Uint32Array(2);crypto.getRandomValues(random);const key=lootKey(m.kind??'slime',random[0]/4294967296,random[1]/4294967296);if(!key)return;s.loot??=[];
 if(s.loot.length>=40){const scrap=m.kind==='boss'?40:5;s.scrap+=scrap;s.events.push(`Stash full: loot salvaged for ${scrap} Scrap.`);return;}
 s.loot.push({id:`loot-${now}-${s.kills}`,key});s.events.push(`${GEAR[key].rarity.toUpperCase()} LOOT: ${GEAR[key].name} · open I to equip`);
}
function awardGuaranteedLoot(s:GameState,key:keyof typeof GEAR,now:number,tag:string){
 s.loot??=[];if(s.loot.length>=40){s.scrap+=15;s.events.push('Stash full: elite rare loot salvaged for 15 Scrap.');return;}
 s.loot.push({id:`loot-${tag}-${now}-${s.kills}`,key});s.events.push(`ELITE RARE LOOT: ${GEAR[key].name} · open I to equip`);
}
export const SEWER_DOOR={x:2080,y:1230};
export const DUNGEON={width:1400,height:1000,spawn:{x:180,y:820},exit:{x:180,y:850}};
export const DUNGEON_ROOMS=[{x:60,y:100,w:390,h:780},{x:580,y:100,w:300,h:310},{x:580,y:580,w:300,h:300},{x:1030,y:100,w:310,h:780},{x:430,y:240,w:620,h:100},{x:430,y:680,w:620,h:100},{x:670,y:390,w:110,h:210}];
export const DUNGEON_SPAWNS=[{x:280,y:330},{x:330,y:650},{x:730,y:205},{x:740,y:735},{x:1120,y:740},{x:1210,y:590},{x:1200,y:245}];
export function dungeonWalkable(x:number,y:number){return [[x-10,y],[x+10,y],[x,y-10],[x,y+10]].every(([px,py])=>DUNGEON_ROOMS.some(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h))}
export function newDungeonMonsters():Monster[]{return DUNGEON_SPAWNS.map((p,i)=>({...p,id:100+i,kind:i===6?'boss':i%3===0?'slime':i%3===1?'rat':'bug',hp:i===6?450:i%3===2?100:i%3===1?40:60,respawn:0}))}
export function activeMonsters(s:GameState){return s.interior===11?s.dungeon?.monsters??[]:s.interior===undefined?s.monsters.filter(m=>s.rustyWoodsEnabled!==false||!isWoodsMonster(m.id)):[]}
export function sceneExit(interior?:number){return interior===11?DUNGEON.exit:ROOM.exit}

// Cached navigation grids use the same solid geometry as movement and combat.
const navigationGrids=new Map<number,{width:number;height:number;free:Uint8Array}>();
function navigationClear(x:number,y:number,interior?:number){return !sceneBlocked(x,y,interior)&&!sceneBlocked(x-11,y,interior)&&!sceneBlocked(x+11,y,interior)&&!sceneBlocked(x,y-9,interior)&&!sceneBlocked(x,y+9,interior)}
export function clearMonsterPath(a:{x:number;y:number},b:{x:number;y:number},interior?:number){const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/8));for(let i=1;i<=steps;i++)if(!navigationClear(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,interior))return false;return true}
export function findMonsterPath(start:{x:number;y:number},goal:{x:number;y:number},interior?:number):{x:number;y:number}[]{
 if(clearMonsterPath(start,goal,interior))return [{x:goal.x,y:goal.y}];
 const key=interior??-1,size=32;let grid=navigationGrids.get(key);
 if(!grid){const bounds=interior===11?DUNGEON:interior===undefined?WORLD:ROOM,width=Math.ceil(bounds.width/size),height=Math.ceil(bounds.height/size),free=new Uint8Array(width*height);for(let y=0;y<height;y++)for(let x=0;x<width;x++)free[y*width+x]=navigationClear(x*size+size/2,y*size+size/2,interior)?1:0;grid={width,height,free};navigationGrids.set(key,grid);}
 const {width,height,free}=grid,point=(id:number)=>({x:(id%width)*size+size/2,y:Math.floor(id/width)*size+size/2});
 const nearest=(p:{x:number;y:number},requireLine:boolean)=>{let best=-1,distance=Infinity;const gx=Math.floor(p.x/size),gy=Math.floor(p.y/size);for(let y=Math.max(0,gy-3);y<Math.min(height,gy+4);y++)for(let x=Math.max(0,gx-3);x<Math.min(width,gx+4);x++){const id=y*width+x,q=point(id),d=Math.hypot(q.x-p.x,q.y-p.y);if(free[id]&&d<distance&&(!requireLine||clearMonsterPath(p,q,interior))){distance=d;best=id}}return best};
 const from=nearest(start,true),to=nearest(goal,false);if(from<0||to<0)return [];
 const parent=new Int32Array(free.length);parent.fill(-1);parent[from]=from;const queue=[from];
 for(let i=0;i<queue.length&&parent[to]===-1;i++){const id=queue[i],x=id%width,y=Math.floor(id/width);for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(nx<0||ny<0||nx>=width||ny>=height)continue;const n=ny*width+nx;if(!free[n]||parent[n]!==-1||!clearMonsterPath(point(id),point(n),interior))continue;parent[n]=id;queue.push(n);}}
 if(parent[to]===-1)return [];const path=[];for(let id=to;id!==from;id=parent[id])path.push(point(id));path.push(point(from));path.reverse();if(clearMonsterPath(point(to),goal,interior))path.push({x:goal.x,y:goal.y});
 const smooth:{x:number;y:number}[]=[];let current=start,index=0;while(index<path.length){let last=index;for(let j=index+1;j<path.length;j++){if(!clearMonsterPath(current,path[j],interior))break;last=j;}smooth.push(path[last]);current=path[last];index=last+1;}return smooth;
}

export function migrateTown(s:GameState):GameState{const next=structuredClone(s);if((next.townLayout??0)<2){next.townLayout=2;if(next.interior===undefined)Object.assign(next,WORLD.spawn);for(const m of next.monsters){Object.assign(m,monsterHome(m.id));m.navPath=[];m.mode='patrol';}}if((next.townLayout??0)<3){next.townLayout=3;if(next.interior===undefined&&blocked(next.x,next.y))Object.assign(next,WORLD.spawn);for(const m of next.monsters){delete m.navPath;delete m.navGoal;}}if(next.interior===undefined){next.x=Math.max(WORLD_LIMITS.left,Math.min(WORLD_LIMITS.right,next.x));next.y=Math.max(WORLD_LIMITS.top,Math.min(WORLD_LIMITS.bottom,next.y));}
 if(next.interior===undefined&&next.woodsLayout!==3){
  if(next.x>=2300&&blocked(next.x,next.y)){
   let safe=false;
   for(let radius=24;radius<=240&&!safe;radius+=24)for(let i=0;i<16;i++){
    const x=next.x+Math.cos(i*Math.PI/8)*radius,y=next.y+Math.sin(i*Math.PI/8)*radius;
    if(!blocked(x,y)){next.x=x;next.y=y;safe=true;break;}
   }
   if(!safe){next.x=2470;next.y=760;}
  }
  next.woodsLayout=3;
 }
 return next}



export type LegacyProgress={species:string[];rooms:number[];caches:string[];recipes:string[];modules:Record<string,number>;visited:number;hosted:number;deathless:boolean;flawless:boolean;unlocked:Record<string,number>;claimed:Record<string,number>;pins:string[];title?:string};
export const LEGACY=[
 {id:'kills25',category:'Combat',name:'Street Cleaner',text:'Defeat 25 monsters.',goal:25,metric:'kills',points:10,scrap:15,title:'Street Cleaner'},
 {id:'kills100',category:'Combat',name:'Outskirts Veteran',text:'Defeat 100 monsters.',goal:100,metric:'kills',points:25,scrap:25,title:'Outskirts Veteran'},
 {id:'kills500',category:'Combat',name:'Wasteland Legend',text:'Defeat 500 monsters.',goal:500,metric:'kills',points:75,scrap:40,title:'Wasteland Legend'},
 {id:'species',category:'Combat',name:'Field Researcher',text:'Defeat a slime, rat, bug and Garbage King.',goal:4,metric:'species',points:30,scrap:20,title:'Field Researcher'},
 {id:'deathless',category:'Mastery',name:'Unbroken',text:'Clear a new sewer run without dying.',goal:1,metric:'deathless',points:50,scrap:25,title:'Unbroken'},
 {id:'flawless',category:'Mastery',name:'Untouchable',text:'Clear a new sewer run without taking damage.',goal:1,metric:'flawless',points:100,scrap:25,title:'Untouchable'},
 {id:'rooms',category:'Exploration',name:'Every Door',text:'Enter all 11 town interiors and the Toxic Sewers.',goal:12,metric:'rooms',points:25,scrap:20,title:'Wayfinder'},
 {id:'caches',category:'Exploration',name:'Nothing Wasted',text:'Find all four town salvage caches.',goal:4,metric:'caches',points:20,scrap:15,title:'Cache Hunter'},
 {id:'craft',category:'Crafting',name:'Made by Panda',text:'Craft your first supply item.',goal:1,metric:'recipes',points:10,scrap:8,title:'Tinkerer'},
 {id:'recipes',category:'Crafting',name:'Field Supplier',text:'Craft both a medkit and a bandage.',goal:2,metric:'recipes',points:20,scrap:15,title:'Field Supplier'},
 {id:'module',category:'Homestead',name:'Foundations',text:'Build your first homestead module.',goal:1,metric:'module',points:15,scrap:15,title:'Homesteader'},
 {id:'modules',category:'Homestead',name:'Built to Last',text:'Personally upgrade workshop, warehouse and garden to level 3.',goal:9,metric:'modules',points:50,scrap:30,title:'Master Builder'},
 {id:'visits',category:'Community',name:'Good Neighbor',text:'Visit parcels belonging to five different players.',goal:5,metric:'visited',points:20,scrap:0,title:'Good Neighbor'},
 {id:'host',category:'Community',name:'Open Doors',text:'Welcome a different player to your parcel.',goal:1,metric:'hosted',points:15,scrap:0,title:'Welcoming Panda'},
] as const;
export function legacyFor(s:GameState):LegacyProgress{return s.legacy??{species:[],rooms:[],caches:[],recipes:[],modules:{},visited:0,hosted:0,deathless:false,flawless:false,unlocked:{},claimed:{},pins:[]}}
export function legacyCount(s:GameState,id:string){const q=LEGACY.find(q=>q.id===id),l=legacyFor(s);if(!q)return 0;switch(q.metric){case 'kills':return s.kills;case 'module':return Object.values(l.modules).some(v=>v>0)?1:0;case 'modules':return ['workshop','warehouse','garden'].reduce((n,k)=>n+Math.min(3,l.modules[k]??0),0);default:{const v=l[q.metric];return Array.isArray(v)?v.length:typeof v==='boolean'?Number(v):v;}}}
export function legacyTitle(s:GameState){const l=legacyFor(s);return l.title&&l.claimed[l.title]!==undefined?LEGACY.find(q=>q.id===l.title)?.title:undefined}
export function unlockLegacy(s:GameState,now:number){s.legacy??=legacyFor(s);for(const q of LEGACY)if(legacyCount(s,q.id)>=q.goal&&s.legacy.unlocked[q.id]===undefined){s.legacy.unlocked[q.id]=now;s.events.push(`PANDA LEGACY · ${q.name} unlocked`);}}
export function advance(s:GameState,a:Intent,elapsed:number,now:number,options:AdvanceOptions={}):GameState{
 const next=advanceWorld(s,a,elapsed,now,options);const gained=playerStats(next).hp-playerStats(s).hp;if(gained>0){next.hp=Math.min(playerStats(next).hp,next.hp+gained);next.events.push(`LEVEL UP · Level ${playerStats(next).level} · +${gained} max HP`);}next.legacy??=legacyFor(next);const l=next.legacy;
 const add=<T,>(items:T[],value:T)=>{if(!items.includes(value))items.push(value)};
 if(next.interior!==undefined)add(l.rooms,next.interior);
 if(a.type==='cache'&&next.daily?.caches.includes(a.target??'')&&!dailyFor(s,now).caches.includes(a.target??''))add(l.caches,a.target!);
 if(a.type==='craft'&&next.medkits>s.medkits)add(l.recipes,'medkit');
 if(a.type==='craft'&&(next.bandages??0)>(s.bandages??0))add(l.recipes,'bandage');
 if(next.dungeon&&next.lastDamage===now&&s.interior===11&&next.dungeon.hits!==undefined)next.dungeon.hits++;
 if(next.dungeon&&next.events.some(e=>e.startsWith('Rescued'))&&s.interior===11&&next.dungeon.deaths!==undefined)next.dungeon.deaths++;
 if(s.interior===next.interior)for(const before of activeMonsters(s)){
 const after=activeMonsters(next).find(m=>m.id===before.id);
 if(before.hp>0&&after&&after.hp<=0){if(!isWoodsMonster(after.id))add(l.species,after.kind??'slime');if(after.kind==='boss'&&next.interior===11&&next.dungeon){if(next.dungeon.deaths===0)l.deathless=true;if(next.dungeon.hits===0&&next.dungeon.deaths===0)l.flawless=true;}}
 }
 unlockLegacy(next,now);
 const q=LEGACY.find(q=>q.id===a.target);
 if(a.type==='legacy_claim'&&q&&l.unlocked[q.id]!==undefined&&l.claimed[q.id]===undefined){l.claimed[q.id]=now;next.scrap+=q.scrap;next.events.push(`Legacy reward: ${q.title} title + badge${q.scrap?` · ${q.scrap} Scrap`:''}`);}
 if(a.type==='legacy_pin'&&q){if(l.pins.includes(q.id))l.pins=l.pins.filter(id=>id!==q.id);else if(l.pins.length<3)l.pins.push(q.id);else next.events.push('Unpin a goal first. Maximum: three.');}
 if(a.type==='legacy_title'){if(!a.target)delete l.title;else if(q&&l.claimed[q.id]!==undefined)l.title=q.id;}
 return next;
}

export type WeaponKind='blade'|'hammer'|'blaster';
export const WEAPONS={blade:{range:112,arc:.35,cooldown:480,windup:130,energy:0},hammer:{range:135,arc:-.15,cooldown:950,windup:400,energy:0},blaster:{range:340,arc:.965,cooldown:700,windup:160,energy:12}} as const;
export function weaponKind(s:GameState):WeaponKind{const item=s.loot?.find(i=>i.id===s.equipment?.weapon);return item?.key==='king_blade'?'hammer':item?.key==='neon_blade'?'blaster':'blade'}

export function playerStats(s:Pick<GameState,'xp'>){const level=1+Math.floor(Math.max(0,s.xp)/100),growth=level-1;return {level,hp:100+growth*10,stamina:100+growth*2,energy:100+growth*2,damage:growth*2,armor:Math.floor(growth/5)}}
export const LOOT_CHANCE={slime:.12,rat:.16,bug:.22,boss:1} as const;
export function lootKey(kind:NonNullable<Monster['kind']>,roll:number,variant:number):keyof typeof GEAR|undefined{
 if(roll>=LOOT_CHANCE[kind])return;
 const pool=kind==='boss'?['king_blade','king_armor'] as const:roll<LOOT_CHANCE[kind]*.1?['neon_blade','reinforced_vest'] as const:['rusty_blade','scrap_vest'] as const;
 return pool[variant<.5?0:1];
}
export function assistAim(s:GameState,dx:number,dy:number,kind=weaponKind(s)){
 const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;
 const candidates=activeMonsters(s).filter(m=>{const d=Math.hypot(m.x-s.x,m.y-s.y);return m.hp>0&&d<WEAPONS[kind].range&&clearMonsterPath(s,m,s.interior)&&(kind!=='blaster'||d<1||((m.x-s.x)*dx+(m.y-s.y)*dy)/d>=.5)});
 // Favor the intended direction over a closer enemy behind the player.
 const score=(m:Monster)=>{const x=m.x-s.x,y=m.y-s.y,d=Math.hypot(x,y);const alignment=d>0?(x*dx+y*dy)/d:1;return d/WEAPONS[kind].range+2*(1-alignment);};
 candidates.sort((a,b)=>score(a)-score(b)||a.id-b.id);const target=candidates[0];if(!target)return {dx,dy};const distance=Math.hypot(target.x-s.x,target.y-s.y);return {dx:distance?(target.x-s.x)/distance:dx,dy:distance?(target.y-s.y)/distance:dy,target:target.id};
}

// Server-owned region availability; never derived from movement/action payloads.
export function applyWoodsAvailability(s:GameState,enabled:boolean){
 const next=structuredClone(s);next.rustyWoodsEnabled=enabled;
 if(!enabled&&next.interior===undefined&&next.x>2320){
  Object.assign(next,WORLD.spawn);delete next.strike;delete next.dodgeUntil;
  next.motionCredit=0;delete next.motionBatch;
 }
 return next;
}
export function playableWorld(enabled=true){return enabled?WORLD:{...WORLD,width:2400};}
