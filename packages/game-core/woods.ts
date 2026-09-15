// Stable IDs keep shared-world saves compatible across deployments.
export const WOODS_START=2400;

// Species keys are intentionally stable internal encounter IDs. Player-facing names
// live in WOODS_PROFILES and can evolve without rewriting shared-world saves.
export type WoodsSpecies='sap-slime'|'miremaw-ooze'|'bramble-rat'|'ashfang-stalker'|'rust-beetle'|'ironwing-beetle'|'ironroot-guardian';
export type WoodsEncounterMarker='sap'|'mire'|'bramble'|'ash'|'rust'|'iron'|'root';
export type WoodsMonsterProfile={
 name:string;
 atlasMonster:'sewer-eel'|'junk-hound'|'neon-bat'|'toxic-roach'|'drone-wasp'|'cable-serpent'|'scrap-golem';
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
export type WoodsKillReward={scrap:number;circuits:number;xp:number;label:string};

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
};

const WOODS_REWARDS:Record<WoodsSpecies,WoodsKillReward>={
 'sap-slime':{scrap:4,circuits:0,xp:3,label:'Sap resin'},
 'miremaw-ooze':{scrap:6,circuits:0,xp:4,label:'Hardened plating'},
 'bramble-rat':{scrap:2,circuits:1,xp:4,label:'Charged wire'},
 'ashfang-stalker':{scrap:5,circuits:0,xp:4,label:'Toxic carapace'},
 'rust-beetle':{scrap:4,circuits:1,xp:5,label:'Drone parts'},
 'ironwing-beetle':{scrap:4,circuits:2,xp:6,label:'Live cable'},
 'ironroot-guardian':{scrap:30,circuits:2,xp:25,label:'Ironroot core'},
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
export function woodsKillReward(id:number):WoodsKillReward|undefined{const m=WOODS_SPAWNS.find(m=>m.id===id);return m?WOODS_REWARDS[m.species]:undefined;}
// Only add missing IDs; never restore a defeated enemy or overwrite its cooldown.
export function seedWoods<T extends {id:number}>(monsters:T[]):(T|typeof WOODS_SPAWNS[number])[]{
 const ids=new Set(monsters.map(m=>m.id));
 return [...monsters,...WOODS_SPAWNS.filter(m=>!ids.has(m.id)).map(m=>({...m}))];
}
