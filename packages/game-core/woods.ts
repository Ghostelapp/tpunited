// Stable IDs keep shared-world saves compatible across deployments.
export const WOODS_START=2400;

export type WoodsSpecies='sap-slime'|'miremaw-ooze'|'bramble-rat'|'ashfang-stalker'|'rust-beetle'|'ironwing-beetle'|'ironroot-guardian';
export type WoodsEncounterMarker='sap'|'mire'|'bramble'|'ash'|'rust'|'iron'|'root';
export type WoodsMonsterProfile={
 name:string;
 role:'skirmisher'|'bruiser'|'ambusher'|'charger'|'tank'|'boss';
 marker:WoodsEncounterMarker;
 accent:string;
 shadow:string;
 filter:string;
 scale:number;
 habitat:string;
 behavior:string;
 lootHint:string;
};

export const WOODS_PROFILES:Record<WoodsSpecies,WoodsMonsterProfile>={
 'sap-slime':{
  name:'SAP SLIME',role:'skirmisher',marker:'sap',accent:'#82c65d',shadow:'#203b28',
  filter:'hue-rotate(18deg) saturate(1.35) brightness(.96)',scale:.98,
  habitat:'Mossy runoff pools',behavior:'Keeps pressure with short corrosive bursts.',lootHint:'Sticky resin and light salvage',
 },
 'miremaw-ooze':{
  name:'MIREMAW OOZE',role:'bruiser',marker:'mire',accent:'#a56ad1',shadow:'#302240',
  filter:'hue-rotate(282deg) saturate(1.45) brightness(.88)',scale:1.12,
  habitat:'Deep violet mire',behavior:'Slower, heavier ooze with a wider danger footprint.',lootHint:'Toxic residue and circuit scrap',
 },
 'bramble-rat':{
  name:'BRAMBLE RAT',role:'ambusher',marker:'bramble',accent:'#a7b95e',shadow:'#31351f',
  filter:'sepia(.35) hue-rotate(28deg) saturate(1.25)',scale:.94,
  habitat:'Bramble dens',behavior:'Fast darting attacker that fights around roots and brush.',lootHint:'Wire, teeth and scavenged scrap',
 },
 'ashfang-stalker':{
  name:'ASHFANG STALKER',role:'charger',marker:'ash',accent:'#d47752',shadow:'#40251f',
  filter:'sepia(.55) hue-rotate(330deg) saturate(1.55) brightness(.9)',scale:1.04,
  habitat:'Charred undergrowth',behavior:'Aggressive stalker built around sudden rushes.',lootHint:'Burnt components and sharp salvage',
 },
 'rust-beetle':{
  name:'RUST BEETLE',role:'tank',marker:'rust',accent:'#c97842',shadow:'#3f2e20',
  filter:'sepia(.7) saturate(1.65) brightness(.92)',scale:1.02,
  habitat:'Collapsed machine nests',behavior:'Armored close-range defender with a punishing burst.',lootHint:'Rust plates and mechanical scrap',
 },
 'ironwing-beetle':{
  name:'IRONWING BEETLE',role:'charger',marker:'iron',accent:'#79b7c6',shadow:'#26363c',
  filter:'saturate(.75) hue-rotate(145deg) brightness(1.08) contrast(1.12)',scale:1.1,
  habitat:'Magnetized wreckage',behavior:'Heavier beetle variant with an energized metallic shell.',lootHint:'Circuits and reinforced components',
 },
 'ironroot-guardian':{
  name:'IRONROOT GUARDIAN',role:'boss',marker:'root',accent:'#c8a84f',shadow:'#2c2718',
  filter:'sepia(.35) hue-rotate(28deg) saturate(1.3) contrast(1.08)',scale:1.18,
  habitat:'Ironroot Grove',behavior:'Ancient forest machine with a telegraphed ground slam.',lootHint:'Guaranteed boss-grade equipment roll',
 },
};

export const WOODS_SPAWNS=[
 {id:20,x:2780,y:540,kind:'slime',species:'sap-slime',hp:120,respawn:0},
 {id:21,x:2880,y:980,kind:'slime',species:'miremaw-ooze',hp:145,respawn:0},
 {id:22,x:3040,y:480,kind:'rat',species:'bramble-rat',hp:80,respawn:0},
 {id:23,x:3090,y:1160,kind:'rat',species:'ashfang-stalker',hp:95,respawn:0},
 {id:24,x:3310,y:530,kind:'bug',species:'rust-beetle',hp:180,respawn:0},
 {id:25,x:3370,y:1150,kind:'bug',species:'ironwing-beetle',hp:210,respawn:0},
 {id:26,x:3540,y:820,kind:'boss',species:'ironroot-guardian',hp:700,respawn:0},
] as const;

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

export function isWoodsMonster(id:number){return WOODS_SPAWNS.some(m=>m.id===id);}
export function woodsMonsterHealth(id:number){return WOODS_SPAWNS.find(m=>m.id===id)?.hp??120;}
export function woodsMonsterProfile(id:number):WoodsMonsterProfile|undefined{const m=WOODS_SPAWNS.find(m=>m.id===id);return m?WOODS_PROFILES[m.species]:undefined;}
export function woodsMonsterName(id:number){return woodsMonsterProfile(id)?.name??'FOREST CREATURE';}
export function woodsMonsterFilter(id:number){return woodsMonsterProfile(id)?.filter??'none';}
export function woodsMonsterScale(id:number){return woodsMonsterProfile(id)?.scale??1;}
// Only add missing IDs; never restore a defeated enemy or overwrite its cooldown.
export function seedWoods<T extends {id:number}>(monsters:T[]):(T|typeof WOODS_SPAWNS[number])[]{
 const ids=new Set(monsters.map(m=>m.id));
 return [...monsters,...WOODS_SPAWNS.filter(m=>!ids.has(m.id)).map(m=>({...m}))];
}
