// Stable IDs keep shared-world saves compatible across deployments.
export const WOODS_START=2400;

// Species keys are intentionally stable internal encounter IDs. Player-facing names
// live in WOODS_PROFILES and can evolve without rewriting shared-world saves.
export type WoodsSpecies='sap-slime'|'miremaw-ooze'|'bramble-rat'|'ashfang-stalker'|'rust-beetle'|'ironwing-beetle'|'ironroot-guardian'|'whisper-plaguewing'|'hauler-sentinel';
export type WoodsEncounterMarker='sap'|'mire'|'bramble'|'ash'|'rust'|'iron'|'root'|'plague'|'sentinel';
export type WoodsAtlasMonster='sewer-eel'|'junk-hound'|'neon-bat'|'toxic-roach'|'drone-wasp'|'cable-serpent'|'scrap-golem'|'plague-pigeon'|'riot-bot';
export type WoodsMonsterProfile={
 name:string;
 atlasMonster:WoodsAtlasMonster;
 role:'skirmisher'|'bruiser'|'ambusher'|'charger'|'tank'|'boss'|'elite';
 marker:WoodsEncounterMarker;
 accent:string;
 shadow:string;
 filter:string;
 scale:number;
 habitat:string;
 behavior:string;
 lootHint:string;
};
export type WoodsKillReward={scrap:number;circuits:number;xp:number;label:string};
export type WoodsEventReward={scrap:number;circuits:number;xp:number};
export type WoodsLandmarkEvent={id:'whisper-purge'|'hauler-recovery';name:string;x:number;y:number;eliteId:27|28;claimKey:string;reward:WoodsEventReward;description:string};

export const WOODS_PROFILES:Record<WoodsSpecies,WoodsMonsterProfile>={
 'sap-slime':{
  name:'SAP EEL',atlasMonster:'sewer-eel',role:'skirmisher',marker:'sap',accent:'#63c9b8',shadow:'#203b32',
  filter:'saturate(1.08) hue-rotate(5deg)',scale:.94,
  habitat:'Mossy runoff pools',behavior:'Keeps a short gap and marks the player with a delayed Sap Shock pool.',lootHint:'Resin, wire and light salvage',
 },
 'miremaw-ooze':{
  name:'MIRE HOUND',atlasMonster:'junk-hound',role:'bruiser',marker:'mire',accent:'#d06a58',shadow:'#3c2824',
  filter:'saturate(1.06) brightness(.96)',scale:1.02,
  habitat:'Deep violet mire',behavior:'Telegraphs a straight Mire Charge, then lunges into the marked impact zone.',lootHint:'Hardened scrap and circuit fragments',
 },
 'bramble-rat':{
  name:'BRAMBLE BAT',atlasMonster:'neon-bat',role:'ambusher',marker:'bramble',accent:'#d55ac7',shadow:'#35213a',
  filter:'saturate(1.12) hue-rotate(5deg)',scale:.94,
  habitat:'Bramble canopies',behavior:'Fastest forest hunter; commits to a short Bramble Dive that rewards lateral dodges.',lootHint:'Light wire and charged salvage',
 },
 'ashfang-stalker':{
  name:'ASH ROACH',atlasMonster:'toxic-roach',role:'charger',marker:'ash',accent:'#9ccf46',shadow:'#303820',
  filter:'saturate(1.08) brightness(.95)',scale:.98,
  habitat:'Charred undergrowth',behavior:'Holds medium range and spits at a delayed target circle instead of body-checking the player.',lootHint:'Toxic residue and plated salvage',
 },
 'rust-beetle':{
  name:'RUST WASP',atlasMonster:'drone-wasp',role:'tank',marker:'rust',accent:'#d68b3b',shadow:'#3e2d20',
  filter:'saturate(1.08) contrast(1.04)',scale:1,
  habitat:'Collapsed machine nests',behavior:'Maintains long range and fires a narrow Rust Burst into a small marked impact zone.',lootHint:'Mechanical scrap and drone parts',
 },
 'ironwing-beetle':{
  name:'CABLE SERPENT',atlasMonster:'cable-serpent',role:'charger',marker:'iron',accent:'#b85fc8',shadow:'#32263b',
  filter:'saturate(1.12) brightness(.98)',scale:1.05,
  habitat:'Magnetized wreckage',behavior:'Controls nearby space with a wide Cable Storm ring that forces the player to disengage.',lootHint:'Circuits and reinforced components',
 },
 'ironroot-guardian':{
  name:'IRONROOT GOLEM',atlasMonster:'scrap-golem',role:'boss',marker:'root',accent:'#c8a84f',shadow:'#2c2718',
  filter:'sepia(.08) saturate(1.05) contrast(1.04)',scale:1.16,
  habitat:'Ironroot Grove',behavior:'Three-phase boss: faster ground slams and targeted root eruptions unlock as health falls.',lootHint:'Guaranteed boss-grade equipment roll',
 },
 'whisper-plaguewing':{
  name:'WHISPER PLAGUEWING',atlasMonster:'plague-pigeon',role:'elite',marker:'plague',accent:'#8bd64b',shadow:'#26331e',
  filter:'saturate(1.12) contrast(1.05)',scale:1.08,
  habitat:'Whisper Grove',behavior:'Elite flier that circles at range and drops a toxic plague burst on the player.',lootHint:'Guaranteed rare armor plus infected salvage',
 },
 'hauler-sentinel':{
  name:'HAULER SENTINEL',atlasMonster:'riot-bot',role:'elite',marker:'sentinel',accent:'#59cce8',shadow:'#20333b',
  filter:'saturate(1.06) contrast(1.08)',scale:1.12,
  habitat:'Rust Hauler Wreck',behavior:'Armored elite that suppresses from range before committing to a powered charge.',lootHint:'Guaranteed rare weapon plus military salvage',
 },
};

const WOODS_REWARDS:Record<WoodsSpecies,WoodsKillReward>={
 'sap-slime':{scrap:4,circuits:0,xp:3,label:'Sap resin'},
 'miremaw-ooze':{scrap:6,circuits:0,xp:4,label:'Hardened plating'},
 'bramble-rat':{scrap:2,circuits:1,xp:4,label:'Charged wire'},
 'ashfang-stalker':{scrap:5,circuits:0,xp:4,label:'Toxic carapace'},
 'rust-beetle':{scrap:4,circuits:1,xp:5,label:'Drone parts'},
 'ironwing-beetle':{scrap:4,circuits:2,xp:6,label:'Live cable'},
 'ironroot-guardian':{scrap:30,circuits:2,xp:25,label:'Ironroot core'},
 'whisper-plaguewing':{scrap:18,circuits:2,xp:18,label:'Plaguewing cache'},
 'hauler-sentinel':{scrap:24,circuits:3,xp:24,label:'Sentinel cache'},
};

// Original IDs 20–26 remain untouched. New elite IDs are appended so old shared
// saves migrate by seeding only the missing IDs.
export const WOODS_SPAWNS=[
 {id:20,x:2780,y:540,kind:'slime',species:'sap-slime',hp:120,respawn:0},
 {id:21,x:2880,y:980,kind:'slime',species:'miremaw-ooze',hp:145,respawn:0},
 {id:22,x:3040,y:480,kind:'rat',species:'bramble-rat',hp:80,respawn:0},
 {id:23,x:3090,y:1160,kind:'rat',species:'ashfang-stalker',hp:95,respawn:0},
 {id:24,x:3310,y:530,kind:'bug',species:'rust-beetle',hp:180,respawn:0},
 {id:25,x:3370,y:1150,kind:'bug',species:'ironwing-beetle',hp:210,respawn:0},
 {id:26,x:3540,y:820,kind:'boss',species:'ironroot-guardian',hp:700,respawn:0},
] as const;

export const WOODS_ELITE_SPAWNS=[
 {id:27,x:3060,y:390,kind:'bug',species:'whisper-plaguewing',hp:360,respawn:0,elite:true},
 {id:28,x:3180,y:1430,kind:'bug',species:'hauler-sentinel',hp:480,respawn:0,elite:true},
] as const;

export const WOODS_ALL_SPAWNS=[...WOODS_SPAWNS,...WOODS_ELITE_SPAWNS] as const;

// Trees intentionally form groves instead of a solid wall. The east road and the
// ranger camp stay open so Trash Town blends into the forest before density rises.
const TREE_POSITIONS=[
 [2520,210],[2680,230],[2860,190],[3040,240],[3240,205],[3440,235],[3620,190],
 [2580,350],[2770,365],[2980,340],[3180,370],[3410,350],[3610,360],
 [2530,1390],[2710,1460],[2900,1395],[3100,1465],[3310,1400],[3500,1470],[3670,1390],
 [2600,1280],[2810,1310],[3010,1270],[3220,1320],[3440,1290],[3630,1270],
 [2690,610],[2850,670],[3180,610],[3460,650],[3660,590],
 [2670,1080],[2860,1130],[3250,1060],[3510,1050],[3670,1110],
 [2770,450],[2960,580],[3190,450],[3430,440],[3630,480],
 [2760,1210],[2970,1250],[3190,1210],[3450,1230],[3610,1200],
] as const;
export const WOODS_TREES=TREE_POSITIONS.map(([x,y],i)=>({x,y,variant:i%5,scale:.86+(i%4)*.08}));

export const WOODS_LANDMARKS=[
 {id:'trail-camp',name:'Moss Trail Camp',x:2470,y:760,kind:'camp'},
 {id:'whisper-grove',name:'Whisper Grove',x:3060,y:330,kind:'grove'},
 {id:'rust-wreck',name:'Rust Hauler Wreck',x:3180,y:1370,kind:'wreck'},
 {id:'ironroot',name:'Ironroot Grove',x:3540,y:820,kind:'boss'},
] as const;

export const WOODS_EVENTS:readonly WoodsLandmarkEvent[]=[
 {id:'whisper-purge',name:'Whisper Grove Purge',x:3060,y:330,eliteId:27,claimKey:'woods-event:whisper-purge',reward:{scrap:40,circuits:2,xp:45},description:'Defeat Whisper Plaguewing, then cleanse the infected grove cache.'},
 {id:'hauler-recovery',name:'Rust Hauler Recovery',x:3180,y:1370,eliteId:28,claimKey:'woods-event:hauler-recovery',reward:{scrap:55,circuits:3,xp:60},description:'Destroy the Hauler Sentinel, then recover the sealed cargo.'},
] as const;

export const WOODS_ENCOUNTER_DETAILS=WOODS_SPAWNS.map((spawn,index)=>({
 id:`encounter-${spawn.id}`,
 monsterId:spawn.id,
 x:spawn.x,
 y:spawn.y,
 radius:spawn.kind==='boss'?150:52+(index%3)*8,
 marker:WOODS_PROFILES[spawn.species].marker,
 accent:WOODS_PROFILES[spawn.species].accent,
})) as readonly {
 id:string;monsterId:number;x:number;y:number;radius:number;marker:WoodsEncounterMarker;accent:string;
}[];

export const WOODS_ELITE_ENCOUNTERS=WOODS_ELITE_SPAWNS.map((spawn,index)=>({
 id:`elite-${spawn.id}`,monsterId:spawn.id,x:spawn.x,y:spawn.y,radius:86+index*10,
 marker:WOODS_PROFILES[spawn.species].marker,accent:WOODS_PROFILES[spawn.species].accent,
})) as readonly {id:string;monsterId:number;x:number;y:number;radius:number;marker:WoodsEncounterMarker;accent:string}[];

export function isWoodsMonster(id:number){return WOODS_ALL_SPAWNS.some(m=>m.id===id);}
export function isWoodsElite(id:number){return WOODS_ELITE_SPAWNS.some(m=>m.id===id);}
export function woodsMonsterHealth(id:number){return WOODS_ALL_SPAWNS.find(m=>m.id===id)?.hp??120;}
export function woodsMonsterProfile(id:number):WoodsMonsterProfile|undefined{const m=WOODS_ALL_SPAWNS.find(m=>m.id===id);return m?WOODS_PROFILES[m.species]:undefined;}
export function woodsMonsterName(id:number){return woodsMonsterProfile(id)?.name??'FOREST CREATURE';}
export function woodsMonsterFilter(id:number){return woodsMonsterProfile(id)?.filter??'none';}
export function woodsMonsterScale(id:number){return woodsMonsterProfile(id)?.scale??1;}
export function woodsKillReward(id:number):WoodsKillReward|undefined{const m=WOODS_ALL_SPAWNS.find(m=>m.id===id);return m?WOODS_REWARDS[m.species]:undefined;}
export function woodsRespawnDelay(id:number){return isWoodsElite(id)?300000:id===26?120000:25000;}
export function woodsEvent(id:string){return WOODS_EVENTS.find(event=>event.id===id);}
// Only add missing IDs; never restore a defeated enemy or overwrite its cooldown.
export function seedWoods<T extends {id:number}>(monsters:T[]):(T|typeof WOODS_ALL_SPAWNS[number])[]{
 const ids=new Set(monsters.map(m=>m.id));
 return [...monsters,...WOODS_ALL_SPAWNS.filter(m=>!ids.has(m.id)).map(m=>({...m}))];
}
