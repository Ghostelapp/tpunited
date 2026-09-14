// Stable IDs keep shared-world saves compatible across deployments.
export const WOODS_START=2400;

export type WoodsSpecies='sap-slime'|'miremaw-ooze'|'bramble-rat'|'ashfang-stalker'|'rust-beetle'|'ironwing-beetle'|'ironroot-guardian';

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

const SPECIES_NAMES:Record<WoodsSpecies,string>={
 'sap-slime':'SAP SLIME',
 'miremaw-ooze':'MIREMAW OOZE',
 'bramble-rat':'BRAMBLE RAT',
 'ashfang-stalker':'ASHFANG STALKER',
 'rust-beetle':'RUST BEETLE',
 'ironwing-beetle':'IRONWING BEETLE',
 'ironroot-guardian':'IRONROOT GUARDIAN',
};

export function isWoodsMonster(id:number){return WOODS_SPAWNS.some(m=>m.id===id);}
export function woodsMonsterHealth(id:number){return WOODS_SPAWNS.find(m=>m.id===id)?.hp??120;}
export function woodsMonsterName(id:number){const m=WOODS_SPAWNS.find(m=>m.id===id);return m?SPECIES_NAMES[m.species]:'FOREST CREATURE';}
// Only add missing IDs; never restore a defeated enemy or overwrite its cooldown.
export function seedWoods<T extends {id:number}>(monsters:T[]):(T|typeof WOODS_SPAWNS[number])[]{
 const ids=new Set(monsters.map(m=>m.id));
 return [...monsters,...WOODS_SPAWNS.filter(m=>!ids.has(m.id)).map(m=>({...m}))];
}
