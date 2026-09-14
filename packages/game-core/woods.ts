// Stable IDs keep shared-world saves compatible across deployments.
export const WOODS_START=2400;
export const WOODS_SPAWNS=[
 {id:20,x:2780,y:540,kind:'slime',hp:120,respawn:0},
 {id:21,x:2880,y:980,kind:'slime',hp:120,respawn:0},
 {id:22,x:3040,y:480,kind:'rat',hp:80,respawn:0},
 {id:23,x:3090,y:1160,kind:'rat',hp:80,respawn:0},
 {id:24,x:3310,y:530,kind:'bug',hp:180,respawn:0},
 {id:25,x:3370,y:1150,kind:'bug',hp:180,respawn:0},
 {id:26,x:3540,y:820,kind:'boss',hp:700,respawn:0},
] as const;
export const WOODS_TREES=Array.from({length:28},(_,i)=>({
 x:2500+(i%7)*180,y:i<7?220:i<14?1480:i<21?390:1290,
}));
export function isWoodsMonster(id:number){return WOODS_SPAWNS.some(m=>m.id===id);}
export function woodsMonsterHealth(id:number){return WOODS_SPAWNS.find(m=>m.id===id)?.hp??120;}
export function woodsMonsterName(id:number){const m=WOODS_SPAWNS.find(m=>m.id===id);return m?.kind==='boss'?'IRONROOT GUARDIAN':m?.kind==='rat'?'BRAMBLE RAT':m?.kind==='bug'?'RUST BEETLE':'SAP SLIME';}
// Only add missing IDs; never restore a defeated enemy or overwrite its cooldown.
export function seedWoods<T extends {id:number}>(monsters:T[]):(T|typeof WOODS_SPAWNS[number])[]{
 const ids=new Set(monsters.map(m=>m.id));
 return [...monsters,...WOODS_SPAWNS.filter(m=>!ids.has(m.id)).map(m=>({...m}))];
}
