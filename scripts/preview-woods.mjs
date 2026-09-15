// Optional visual review: install @napi-rs/canvas separately, or set CANVAS_MODULE.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {drawWoodsGround,woodsObjects} from '../components/tpu/woods.ts';
import {WOODS_ALL_SPAWNS,WOODS_TREES} from '../packages/game-core/woods.ts';
import {drawWoodsMonster} from '../components/tpu/woods-monsters.ts';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CANVAS_MODULE||'@napi-rs/canvas');
const props=await loadImage('public/assets/forest/props-v2.webp'),monsters=await loadImage('public/assets/sheet-9.webp');
for(const [name,x,y,w,h,scale] of [['woods-layout',2150,70,4050,1570,.5],['woods-transition',2200,270,1400,1050,1],['woods-grove',3500,120,1500,1150,1]]){
 const canvas=createCanvas(Math.round(w*scale),Math.round(h*scale)),g=canvas.getContext('2d');
 g.scale(scale,scale);g.translate(-x,-y);g.fillStyle='#283239';g.fillRect(0,0,6200,1700);drawWoodsGround(g);
 const objects=woodsObjects(g,props,{x:3300,y:900});
 for(const m of WOODS_ALL_SPAWNS)objects.push({y:m.y,draw:()=>{g.save();g.translate(m.x,m.y);drawWoodsMonster(g,monsters,m.id,true,20,10000);g.restore();}});
 objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 writeFileSync(`docs/previews/${name}.webp`,canvas.toBuffer('image/webp',85));
}
console.log(`${WOODS_TREES.length} trees; 3 previews rendered`);
