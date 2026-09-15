import {woodsMonsterHealth} from './woods.ts';

export type WoodsSkill=
 'eel-shock'|'hound-charge'|'bat-dive'|'roach-spit'|'wasp-burst'|'serpent-storm'|'root-burst';

export type WoodsTelegraph='circle'|'line'|'ring';
export type WoodsSkillSpec={
 skill:WoodsSkill;
 label:string;
 range:number;
 radius:number;
 windup:number;
 cooldown:number;
 damage:number;
 origin:'target'|'impact'|'self';
 telegraph:WoodsTelegraph;
 attackVariant:0|1;
 color:string;
 moveSpeed:number;
 stopDistance:number;
 dashMs?:number;
 dashScale?:number;
};

const WOODS_SKILLS:Record<number,WoodsSkillSpec>={
 20:{skill:'eel-shock',label:'SAP SHOCK',range:220,radius:70,windup:800,cooldown:2300,damage:13,origin:'target',telegraph:'circle',attackVariant:1,color:'#63c9b8',moveSpeed:60,stopDistance:88},
 21:{skill:'hound-charge',label:'MIRE CHARGE',range:190,radius:62,windup:700,cooldown:2500,damage:17,origin:'impact',telegraph:'line',attackVariant:0,color:'#d06a58',moveSpeed:72,stopDistance:46,dashMs:520,dashScale:.34},
 22:{skill:'bat-dive',label:'BRAMBLE DIVE',range:235,radius:52,windup:600,cooldown:2100,damage:14,origin:'impact',telegraph:'line',attackVariant:0,color:'#d55ac7',moveSpeed:108,stopDistance:52,dashMs:480,dashScale:.38},
 23:{skill:'roach-spit',label:'ASH SPIT',range:260,radius:58,windup:900,cooldown:2700,damage:15,origin:'target',telegraph:'circle',attackVariant:0,color:'#9ccf46',moveSpeed:64,stopDistance:128},
 24:{skill:'wasp-burst',label:'RUST BURST',range:300,radius:45,windup:750,cooldown:2400,damage:18,origin:'target',telegraph:'line',attackVariant:0,color:'#d68b3b',moveSpeed:74,stopDistance:152},
 25:{skill:'serpent-storm',label:'CABLE STORM',range:155,radius:125,windup:1000,cooldown:3200,damage:22,origin:'self',telegraph:'ring',attackVariant:0,color:'#b85fc8',moveSpeed:58,stopDistance:78},
};

export type WoodsBossPhase={
 phase:1|2|3;
 label:string;
 hpRatio:number;
 cooldown:number;
 speedMultiplier:number;
 slamRadius:number;
 slamDamage:number;
 slamWindup:number;
 rootRadius:number;
 rootDamage:number;
 rootWindup:number;
 rootRange:number;
};

export function woodsSkillSpec(id:number):WoodsSkillSpec|undefined{return WOODS_SKILLS[id];}

export function woodsBossPhase(hp:number):WoodsBossPhase{
 const ratio=Math.max(0,Math.min(1,hp/woodsMonsterHealth(26)));
 if(ratio>.66)return {phase:1,label:'AWAKENED',hpRatio:ratio,cooldown:4500,speedMultiplier:1,slamRadius:145,slamDamage:28,slamWindup:1100,rootRadius:0,rootDamage:0,rootWindup:0,rootRange:0};
 if(ratio>.33)return {phase:2,label:'ROOTBREAK',hpRatio:ratio,cooldown:3600,speedMultiplier:1.12,slamRadius:158,slamDamage:30,slamWindup:1000,rootRadius:78,rootDamage:24,rootWindup:900,rootRange:260};
 return {phase:3,label:'OVERGROWN',hpRatio:ratio,cooldown:2800,speedMultiplier:1.28,slamRadius:178,slamDamage:34,slamWindup:850,rootRadius:96,rootDamage:28,rootWindup:750,rootRange:300};
}

export function woodsAttackVariant(id:number,skill?:WoodsSkill){
 if(id===26)return skill==='root-burst'?1:0;
 return woodsSkillSpec(id)?.attackVariant??0;
}
