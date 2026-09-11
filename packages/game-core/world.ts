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
export const WORLD={width:2400,height:1700,spawn:{x:1150,y:880}};
export const BUILDINGS=[{x:940,y:390,w:300,h:260,sx:0,sy:0,sw:365,sh:340,name:'City Hall'},{x:1280,y:400,w:250,h:250,sx:368,sy:30,sw:294,sh:310,name:'Workshop'},{x:1280,y:800,w:250,h:240,sx:980,sy:57,sw:274,sh:283,name:'General Store'},{x:600,y:800,w:260,h:240,sx:0,sy:375,sw:285,sh:264,name:'The Trashy Tavern'},{x:600,y:400,w:260,h:250,sx:284,sy:377,sw:269,sh:261,name:'Clinic'},{x:940,y:1170,w:300,h:230,sx:559,sy:667,sw:341,sh:220,name:'Market Arcade'},{x:1280,y:1170,w:250,h:230,sx:666,sy:72,sw:315,sh:268,name:'Mechanic Garage'},{x:600,y:90,w:260,h:240,sx:1040,sy:371,sw:214,sh:267,name:'Apartments'},{x:600,y:1170,w:260,h:230,sx:0,sy:666,sw:232,sh:221,name:'Tech Exchange'},{x:1900,y:1330,w:280,h:230,sx:235,sy:678,sw:320,sh:209,name:'Salvage Depot'},{x:940,y:90,w:270,h:240,sx:560,sy:369,sw:268,sh:268,name:'Old Bank'}];
export function blocked(x:number,y:number){return x<30||y<30||x>WORLD.width-30||y>WORLD.height-30||BUILDINGS.some(b=>x>b.x-12&&x<b.x+b.w+12&&y>b.y+b.h-65&&y<b.y+b.h+8)}
export const NPCS=[{id:'scrappy',name:'Scrappy',x:1150,y:710,sx:205,sy:215,sw:76,sh:111,text:'Welcome to Trash Town. Those toxic slimes are eating our cables. Clear three out and I’ll make it worth your while.'},{id:'patch',name:'Dr. Patch',x:825,y:705,sx:205,sy:398,sw:76,sh:120,text:'Stay in one piece out there. I can patch you up for 15 scrap.'},{id:'wrench',name:'Wrench',x:1480,y:705,sx:834,sy:213,sw:78,sh:112,text:'Two circuits and 20 scrap. That’s all I need to make you a fresh medkit.'},{id:'merchant',name:'Bolt',x:1480,y:1095,sx:201,sy:590,sw:81,sh:112,text:'Welcome to the General Store. Medkits cost 30 scrap. I buy circuits for 4 scrap each.'}];
export const parcels=Array.from({length:100},(_,i)=>({id:i+1,regionId:0,x:60+(i%10)*40,y:80+Math.floor(i/10)*40,width:32,height:32,rarity:i%17===0?'EPIC':i%5===0?'RARE':'COMMON',buildingSlots:i%17===0?6:i%5===0?4:2,status:i>=80?'SYSTEM':i>=70?'RESERVED':'UNRELEASED'}));
export type Monster={navPath?:{x:number;y:number}[];navAt?:number;navGoal?:{x:number;y:number};mode?:'patrol'|'chase'|'return';waypoint?:number;slamAt?:number;lastSlam?:number;kind?:'slime'|'rat'|'bug'|'boss';id:number;x:number;y:number;hp:number;respawn:number};
export type NftGear={id:string;tokenId:number;name:string;image:string;slot:GearSlot;rarity:"common"|"uncommon"|"rare"|"epic"|"legendary"|"mythic";damage:number;armor:number;minLevel:number};
export type GameState={nftGear?:NftGear[];hitFeedback?:{x:number;y:number;amount:number};townLayout?:number;loot?:LootItem[];equipment?:Partial<Record<GearSlot,string>>;dungeon?:{monsters:Monster[];cleared:boolean;run:number};interior?:number;daily?:DailyProgress;motionBatch?:string;motionCredit?:number;weaponLevel?:number;salvageQuest?:'available'|'active'|'complete';bountyQuest?:'available'|'active'|'complete';bountyKills?:number;x:number;y:number;hp:number;xp:number;scrap:number;circuits:number;medkits:number;kills:number;quest:'available'|'active'|'complete';questKills:number;monsters:Monster[];lastAttack:number;lastDamage:number;events:string[];buildings:{id:string;parcel:number;x:number;y:number;rotation:number;type:string}[]};
export function initialState():GameState{return {...WORLD.spawn,townLayout:2,weaponLevel:0,salvageQuest:'available',bountyQuest:'available',bountyKills:0,hp:100,xp:0,scrap:0,circuits:0,medkits:2,kills:0,quest:'available',questKills:0,lastAttack:0,lastDamage:0,events:[],buildings:[],monsters:Array.from({length:8},(_,i)=>({id:i,kind:(i<4?'slime':i<6?'rat':'bug') as 'slime'|'rat'|'bug',x:1930+(i%3)*130,y:480+Math.floor(i/3)*230,hp:i<4?60:i<6?40:100,respawn:0}))}}
export type Intent={type:'move'|'attack'|'interact'|'heal'|'craft'|'tick'|'buy_medkit'|'sell_circuit'|'upgrade'|'salvage_quest'|'bounty_quest'|'daily_claim'|'cache'|'enter'|'exit'|'dungeon_enter'|'equip'|'unequip'|'salvage';dx?:number;dy?:number;target?:string};
export function advance(s:GameState,a:Intent,elapsed:number,now:number):GameState {
 const next=migrateTown(s);next.events=[];delete next.hitFeedback;next.daily=dailyFor(s,now);const dt=Math.max(0,Math.min(elapsed,1000))/1000;
 if(a.type==='dungeon_enter'){
 if(next.interior===undefined&&Math.hypot(next.x-SEWER_DOOR.x,next.y-SEWER_DOOR.y)<85){next.interior=11;if(!next.dungeon||next.dungeon.cleared)next.dungeon={monsters:newDungeonMonsters(),cleared:false,run:(next.dungeon?.run??0)+1};Object.assign(next,DUNGEON.spawn);next.events.push('Toxic Sewers · Defeat the Garbage King. Q uses a medkit.');}else next.events.push('Find the sewer hatch in the eastern outskirts.');return next;
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
 if(a.type==='move')Object.assign(next,movePosition(next,{dx:a.dx??0,dy:a.dy??0,ms:dt*1000},next.interior));
 for(const m of activeMonsters(next)){
 m.kind??=m.id<4?'slime':m.id<6?'rat':'bug';const home=monsterHome(m.id);
 if(m.hp<=0){if(next.interior!==11&&now>=m.respawn){m.hp=m.kind==='bug'?100:m.kind==='rat'?40:60;Object.assign(m,home);m.mode='patrol';}continue;}
 const toPlayer=next.interior===undefined&&next.x<1740?Infinity:Math.hypot(m.x-next.x,m.y-next.y),fromHome=Math.hypot(m.x-home.x,m.y-home.y);
 if(fromHome>460||(next.interior===undefined&&m.x<1740))m.mode='return';
 if(m.mode==='return'&&fromHome<18)m.mode='patrol';
 if(m.mode!=='return')m.mode=toPlayer<(m.mode==='chase'?290:210)?'chase':'patrol';
 let target:{x:number;y:number};
 if(m.mode==='chase')target=next;
 else if(m.mode==='return')target=home;
 else {const phase=(m.waypoint??m.id)%4,angle=phase*Math.PI/2+m.id*.73;target={x:home.x+Math.cos(angle)*65,y:home.y+Math.sin(angle)*65};if(Math.hypot(target.x-m.x,target.y-m.y)<12)m.waypoint=(m.waypoint??m.id)+1;}
 const speed=(m.kind==='boss'?38:m.kind==='rat'?90:m.kind==='bug'?48:52)*(m.mode==='patrol'?.45:1);
 if(m.kind==='boss'){
 if(m.slamAt&&now>=m.slamAt){if(Math.hypot(m.x-next.x,m.y-next.y)<145&&clearMonsterPath(m,next,next.interior)){next.hp-=Math.max(2,28-gearStats(next).armor);next.events.push('Ground slam! Move out of the warning ring.');}m.slamAt=undefined;m.lastSlam=now;}
 else if(m.mode==='chase'&&!m.slamAt&&now-(m.lastSlam??0)>4500&&toPlayer<180)m.slamAt=now+1100;
 }
 if(!m.slamAt){
 let destination=target,stop=m.mode==='chase'?38:4;
 if(!clearMonsterPath(m,target,next.interior)){
 if(!m.navPath?.length||now-(m.navAt??0)>1000||!m.navGoal||Math.hypot(target.x-m.navGoal.x,target.y-m.navGoal.y)>64){m.navPath=findMonsterPath(m,target,next.interior);m.navAt=now;m.navGoal={x:target.x,y:target.y};}
 while(m.navPath?.length&&Math.hypot(m.navPath[0].x-m.x,m.navPath[0].y-m.y)<9)m.navPath.shift();
 if(m.navPath?.length){destination=m.navPath[0];stop=4;}else destination=m;
 }else m.navPath=[];
 moveMonster(m,destination,speed,dt,activeMonsters(next),stop,next.interior);
 }
 if(m.mode==='chase'&&Math.hypot(m.x-next.x,m.y-next.y)<47&&clearMonsterPath(m,next,next.interior)&&now-next.lastDamage>1100){next.hp-=Math.max(1,(m.kind==='boss'?16:m.kind==='bug'?14:m.kind==='rat'?6:9)-gearStats(next).armor);next.lastDamage=now;}
 }

 if((next.interior===undefined||next.interior===11)&&a.type==='attack'&&now-next.lastAttack>=480){next.lastAttack=now;const hit=activeMonsters(next).filter(m=>m.hp>0&&Math.hypot(m.x-next.x,m.y-next.y)<112&&clearMonsterPath(next,m,next.interior)).sort((a,b)=>Math.hypot(a.x-next.x,a.y-next.y)-Math.hypot(b.x-next.x,b.y-next.y))[0];if(hit){next.hitFeedback={x:hit.x,y:hit.y,amount:Math.min(hit.hp,gearStats(next).damage)};hit.hp-=gearStats(next).damage;if(hit.hp<=0){hit.respawn=now+25000;next.scrap+=12;next.circuits++;next.xp+=20;next.kills++;next.daily.kills++;if(next.quest==='active'&&(!hit.kind||hit.kind==='slime'))next.questKills++;if(next.bountyQuest==='active'&&hit.kind==='rat')next.bountyKills=(next.bountyKills??0)+1;next.events.push('+12 scrap · +1 circuit · +20 XP');awardLoot(next,hit,now);if(hit.kind==='boss'&&next.dungeon){next.dungeon.cleared=true;next.scrap+=150;next.xp+=150;next.medkits+=2;next.events.push('GARBAGE KING DEFEATED! +150 Scrap · +150 XP · +2 medkits. Return to the entrance.')}}}}
 if(a.type==='interact'){const npc=sceneNPCS(next.interior).find(n=>n.id===a.target&&Math.hypot(n.x-next.x,n.y-next.y)<125);if(npc?.id==='scrappy'){if(next.quest==='available'){next.quest='active';next.questKills=0;next.events.push('Quest accepted: A Cleaner Tomorrow')}else if(next.quest==='active'&&next.questKills>=3){next.quest='complete';next.scrap+=100;next.xp+=100;next.events.push('Quest complete! +100 scrap · +100 XP')}else next.events.push('Clear 3 toxic slimes east of town, then return to Scrappy.')}if(npc?.id==='patch'){if(next.scrap>=15&&next.hp<100){next.scrap-=15;next.hp=100;next.events.push('Patched up. −15 scrap')}else next.events.push(next.hp===100?'You are already healthy.':'You need 15 scrap.')}}
 if(a.type==='craft'){if(!nearService(next,'wrench',140))next.events.push('Visit Wrench at the workshop.');else if(next.scrap>=20&&next.circuits>=2){next.scrap-=20;next.circuits-=2;next.medkits++;next.daily.crafted++;next.events.push('Crafted 1 medkit')}else next.events.push('Needs 20 scrap + 2 circuits.')}
 if(a.type==='buy_medkit'||a.type==='sell_circuit'){if(!nearService(next,'merchant',130))next.events.push('Visit the General Store to trade.');else if(a.type==='buy_medkit'){if(next.scrap>=30){next.scrap-=30;next.medkits++;next.events.push('Bought a medkit · −30 scrap')}else next.events.push('A medkit costs 30 scrap.')}else if(next.circuits>0){next.circuits--;next.scrap+=4;next.events.push('Sold a circuit · +4 scrap')}else next.events.push('No circuits to sell.')}
 if(a.type==='upgrade'){const lvl=next.weaponLevel??0,cost=75*(lvl+1),parts=5*(lvl+1);if(!nearService(next,'wrench',140))next.events.push('Visit Wrench to upgrade your blade.');else if(lvl>=3)next.events.push('Your blade is fully upgraded.');else if(next.scrap>=cost&&next.circuits>=parts){next.scrap-=cost;next.circuits-=parts;next.weaponLevel=lvl+1;next.events.push('Blade upgraded · +5 damage')}else next.events.push(`Needs ${cost} scrap + ${parts} circuits.`)}
 if(a.type==='salvage_quest'){if(!nearService(next,'wrench',140))next.events.push('Talk to Wrench at the workshop.');else if(!next.salvageQuest||next.salvageQuest==='available'){next.salvageQuest='active';next.events.push('Quest accepted: Spare Parts. Bring Wrench 6 circuits.')}else if(next.salvageQuest==='active'&&next.circuits>=6){next.circuits-=6;next.scrap+=75;next.xp+=70;next.salvageQuest='complete';next.events.push('Spare Parts complete · +75 scrap · +70 XP')}else next.events.push(next.salvageQuest==='complete'?'Wrench already has the parts.':'You need 6 circuits.')}
 if(a.type==='bounty_quest'){if(!nearService(next,'scrappy',130))next.events.push('Visit Scrappy in the town square.');else if(!next.bountyQuest||next.bountyQuest==='available'){next.bountyQuest='active';next.bountyKills=0;next.events.push('Bounty accepted: Rat Problem. Defeat 5 trash rats.')}else if(next.bountyQuest==='active'&&(next.bountyKills??0)>=5){next.bountyQuest='complete';next.scrap+=120;next.xp+=120;next.events.push('Rat Problem complete · +120 scrap · +120 XP')}else next.events.push(next.bountyQuest==='complete'?'This bounty has already been claimed.':`Trash rats defeated: ${next.bountyKills??0}/5`)}
 if(a.type==='heal'){if(next.medkits>0&&next.hp<100){next.medkits--;next.hp=Math.min(100,next.hp+50);next.events.push('Used medkit · +50 HP')}}
 if(a.type==='cache'){
 const cache=CACHES.find(c=>c.id===a.target);
 if(next.interior!==undefined||!cache||Math.hypot(next.x-cache.x,next.y-cache.y)>85)next.events.push('Move closer to a salvage cache.');
 else if(next.daily.caches.includes(cache.id))next.events.push('Already searched today. Restocked at 00:00 UTC.');
 else {next.daily.caches.push(cache.id);next.scrap+=20;next.circuits++;next.xp+=10;next.events.push('Hidden salvage found! +20 Scrap · +1 circuit · +10 XP');}
 }
 if(a.type==='daily_claim'){
 const quest=DAILIES.find(q=>q.id===a.target);
 if(quest&&!next.daily.claimed.includes(quest.id)&&dailyCount(next.daily,quest.id)>=quest.goal){next.daily.claimed.push(quest.id);next.scrap+=quest.scrap;next.xp+=quest.xp;next.events.push(`Daily complete: ${quest.title} · +${quest.scrap} Scrap · +${quest.xp} XP`);}
 else next.events.push('Daily reward unavailable: finish the task or check if already claimed.');
 }
 if(next.hp<=0){delete next.interior;next.hp=100;next.x=WORLD.spawn.x;next.y=WORLD.spawn.y;next.scrap=Math.max(0,next.scrap-20);next.events.push('Rescued by the clinic. Up to 20 scrap lost.')}
 return next;
}

// Shared, bounded substeps prevent tunnelling and keep prediction identical to authority.
export type MotionInput={dx:number;dy:number;ms:number};
export function movePosition(p:{x:number;y:number},input:MotionInput,interior?:number){
 let {x,y}=p;const length=Math.max(1,Math.hypot(input.dx,input.dy));
 let remaining=Math.min(1000,Math.max(0,input.ms));
 while(remaining>0){const step=Math.min(8,remaining);remaining-=step;
 const nx=x+input.dx/length*190*step/1000;if(!sceneBlocked(nx,y,interior))x=nx;
 const ny=y+input.dy/length*190*step/1000;if(!sceneBlocked(x,ny,interior))y=ny;}
 return {x,y};
}
export function replayMotion(p:{x:number;y:number;interior?:number},inputs:MotionInput[]){return inputs.reduce((point,input)=>movePosition(point,input,p.interior),{x:p.x,y:p.y})}
export function applyMotion(s:GameState,inputs:MotionInput[],elapsed:number,batch:string){
 const next=structuredClone(s);let credit=Math.min(1000,(s.motionCredit??250)+Math.max(0,elapsed));
 for(const input of inputs){const ms=Math.min(input.ms,credit);Object.assign(next,movePosition(next,{...input,ms},next.interior));credit-=ms;}
 next.motionCredit=Math.min(250,credit);next.motionBatch=batch;return next;
}

export function monsterHome(id:number){if(id>=100)return DUNGEON_SPAWNS[id-100]??DUNGEON.spawn;return {x:1930+(id%3)*130,y:480+Math.floor(id/3)*230}}
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
export const DAILIES=[{id:'patrol',title:'Neighborhood Watch',text:'Defeat 5 monsters in town or the sewers.',goal:5,scrap:60,xp:60},{id:'supplies',title:'Ready for Tomorrow',text:'Craft 1 field medkit with Wrench.',goal:1,scrap:35,xp:35},{id:'explore',title:'One Panda’s Treasure',text:'Search 2 different hidden salvage caches.',goal:2,scrap:45,xp:45}] as const;
export const CACHES=[{id:'west',x:185,y:600},{id:'south',x:950,y:1550},{id:'east',x:2230,y:1300},{id:'north',x:1970,y:390}] as const;
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
 king_armor:{name:'King Gauntlets',slot:'armor',rarity:'epic',damage:0,armor:7}
} as const;
export type LootItem={id:string;key:keyof typeof GEAR};
export function gearStats(s:GameState){let damage=25+(s.weaponLevel??0)*5,armor=0;for(const slot of ['weapon','armor'] as const){const item=s.loot?.find(i=>i.id===s.equipment?.[slot]);if(item&&GEAR[item.key].slot===slot){damage+=GEAR[item.key].damage;armor+=GEAR[item.key].armor;}const nft=s.nftGear?.find(i=>i.id===s.equipment?.[slot]&&i.slot===slot);if(nft&&1+Math.floor(s.xp/100)>=nft.minLevel){damage+=nft.damage;armor+=nft.armor;}}return {damage,armor}}
function awardLoot(s:GameState,m:Monster,now:number){
 const roll=(Math.floor(now/7)+m.id*17+s.kills*31)>>>0;if(m.kind!=='boss'&&roll%3===0)return;
 const keys:(keyof typeof GEAR)[]=m.kind==='boss'?['king_blade','king_armor']:roll%5===0?['neon_blade','reinforced_vest']:['rusty_blade','scrap_vest'];const key=keys[roll%2];s.loot??=[];
 if(s.loot.length>=40){const scrap=m.kind==='boss'?40:5;s.scrap+=scrap;s.events.push(`Stash full: loot salvaged for ${scrap} Scrap.`);return;}
 s.loot.push({id:`loot-${now}-${s.kills}`,key});s.events.push(`${GEAR[key].rarity.toUpperCase()} LOOT: ${GEAR[key].name} · open I to equip`);
}
export const SEWER_DOOR={x:2080,y:1230};
export const DUNGEON={width:1400,height:1000,spawn:{x:180,y:820},exit:{x:180,y:850}};
export const DUNGEON_ROOMS=[{x:60,y:100,w:390,h:780},{x:580,y:100,w:300,h:310},{x:580,y:580,w:300,h:300},{x:1030,y:100,w:310,h:780},{x:430,y:240,w:620,h:100},{x:430,y:680,w:620,h:100},{x:670,y:390,w:110,h:210}];
export const DUNGEON_SPAWNS=[{x:280,y:330},{x:330,y:650},{x:730,y:205},{x:740,y:735},{x:1120,y:740},{x:1210,y:590},{x:1200,y:245}];
export function dungeonWalkable(x:number,y:number){return [[x-10,y],[x+10,y],[x,y-10],[x,y+10]].every(([px,py])=>DUNGEON_ROOMS.some(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h))}
export function newDungeonMonsters():Monster[]{return DUNGEON_SPAWNS.map((p,i)=>({...p,id:100+i,kind:i===6?'boss':i%3===0?'slime':i%3===1?'rat':'bug',hp:i===6?450:i%3===2?100:i%3===1?40:60,respawn:0}))}
export function activeMonsters(s:GameState){return s.interior===11?s.dungeon?.monsters??[]:s.interior===undefined?s.monsters:[]}
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

export function migrateTown(s:GameState):GameState{const next=structuredClone(s);if((next.townLayout??0)<2){next.townLayout=2;if(next.interior===undefined)Object.assign(next,WORLD.spawn);for(const m of next.monsters){Object.assign(m,monsterHome(m.id));m.navPath=[];m.mode='patrol';}}return next}
