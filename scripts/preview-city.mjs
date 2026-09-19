// Optional deterministic overview using the same terrain, props and buildings
// as the game. Install @napi-rs/canvas separately or set CANVAS_MODULE.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {makeTerrain} from '../components/tpu/terrain.ts';
import {DECOR} from '../components/tpu/world-decor.ts';
import {BUILDINGS,NPCS,initialState} from '../packages/game-core/world.ts';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
globalThis.document={createElement:()=>createCanvas(1,1)};
const art={};for(const id of [2,7,8,10])art[id]=await loadImage(`public/assets/sheet-${id}.webp`);
const terrain=makeTerrain(art[10],false);
for(const [name,x,y,w,h,scale] of [['city-overview',0,0,2400,1700,.75],['city-square',470,350,1210,830,1]]){
 const canvas=createCanvas(w*scale,h*scale),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;g.scale(scale,scale);g.translate(-x,-y);g.drawImage(terrain,0,0);
 const objects=[];
 for(const b of BUILDINGS)objects.push({y:b.y+b.h,draw:()=>g.drawImage(art[7],b.sx,b.sy,b.sw,b.sh,b.x,b.y,b.w,b.h)});
 for(const d of DECOR)objects.push({y:d.y,draw:()=>g.drawImage(art[d.sheet],d.sx,d.sy,d.sw,d.sh,d.x-d.w/2,d.y-d.h,d.w,d.h)});
 for(const n of NPCS.filter(n=>n.id!=='ranger'))objects.push({y:n.y,draw:()=>g.drawImage(art[8],n.sx,n.sy,n.sw,n.sh,n.x-25,n.y-70,50,70)});
 for(const m of initialState().monsters)objects.push({y:m.y,draw:()=>{const [sx,sy,sw,sh,k]=m.kind==='rat'?[282,47,146,94,.46*1.3]:m.kind==='bug'?[392,224,132,94,.48*1.3]:[274,803,133,84,64/133*1.3];g.drawImage(art[2],sx,sy,sw,sh,m.x-sw*k/2,m.y-sh*k,sw*k,sh*k);}});
 objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());writeFileSync(`docs/previews/${name}.webp`,canvas.toBuffer('image/webp',85));
}
