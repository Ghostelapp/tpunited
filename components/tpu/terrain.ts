import {drawWoodsGround} from './woods.ts';
import {BUILDINGS,WORLD} from '../../packages/game-core/world.ts';
// Roads are one connected network on a single low-contrast asphalt material.
export const ROADS=[[[520,760],[2260,760]],[[520,1150],[1600,1150]],[[520,1510],[2240,1510]],[[520,90],[520,1560]],[[1600,90],[1600,1560]]] as const;
export function makeTerrain(image:HTMLImageElement,rustyWoodsEnabled=true){
 const ground=document.createElement('canvas');ground.width=rustyWoodsEnabled?WORLD.width:2400;ground.height=WORLD.height;
 const g=ground.getContext('2d')!;g.imageSmoothingEnabled=false;g.fillStyle='#283239';g.fillRect(0,0,ground.width,ground.height);
 // Mirroring a clean interior crop makes all four tile boundaries meet exactly.
 const tile=document.createElement('canvas');tile.width=128;tile.height=128;const t=tile.getContext('2d')!;
 for(let y=0;y<2;y++)for(let x=0;x<2;x++){t.save();t.translate(x?128:0,y?128:0);t.scale(x?-1:1,y?-1:1);t.drawImage(image,555,53,64,64,0,0,64,64);t.restore();}
 const pattern=g.createPattern(tile,'repeat')!;
 const roads=()=>{g.beginPath();for(const road of ROADS){g.moveTo(road[0][0],road[0][1]);g.lineTo(road[1][0],road[1][1]);}};
 g.lineJoin='round';g.lineCap='butt';roads();g.strokeStyle='#475158';g.lineWidth=140;g.stroke();
 roads();g.strokeStyle='#343e45';g.lineWidth=134;g.stroke();
 roads();g.strokeStyle='#1d282e';g.lineWidth=104;g.stroke();
 // Paved business frontages follow the resized facades, not arbitrary tiles.
 for(const b of BUILDINGS){const base=b.y+b.h;g.fillStyle='#475355';g.fillRect(b.x-8,base-12,b.w+16,42);g.fillStyle='#354248';g.fillRect(b.x-5,base-10,b.w+10,35);}
 // The square shares the same surface, with a curb instead of a separate tile sheet.
 g.fillStyle='#475158';g.fillRect(895,815,350,255);g.fillStyle='#303b41';g.fillRect(899,819,342,247);
 g.globalAlpha=.18;g.fillStyle=pattern;g.fillRect(0,0,WORLD.width,WORLD.height);g.globalAlpha=1;
 g.strokeStyle='#a08d5666';g.lineWidth=3;g.setLineDash([23,27]);roads();g.stroke();g.setLineDash([]);
 // Crosswalks and parking markings are continuous world geometry, not framed tiles.
 g.fillStyle='#a4aea66e';for(const x of [615,1495])for(const y of [760,1150,1510])for(let i=-3;i<=3;i++)g.fillRect(x+i*12,y-39,6,78);
 g.strokeStyle='#68747266';g.lineWidth=2;for(let x=1290;x<1510;x+=48){g.strokeRect(x,1450,40,45)}
 // Authored district surfaces. Narrow paths connect the western pockets to
 // the boulevard, and keep the residential plots above them unobstructed.
 const paving=(x:number,y:number,w:number,h:number)=>{
  g.fillStyle='#52605d';g.fillRect(x,y,w,h);g.fillStyle='#334247';g.fillRect(x+4,y+4,w-8,h-8);
  g.strokeStyle='#61706a35';g.lineWidth=1;g.beginPath();
  for(let px=x+24;px<x+w;px+=24){g.moveTo(px,y+4);g.lineTo(px,y+h-4);}
  for(let py=y+24;py<y+h;py+=24){g.moveTo(x+4,py);g.lineTo(x+w-4,py);}g.stroke();
 };
 paving(90,565,360,280);paving(1300,140,260,170);paving(1745,125,550,200);
 g.fillStyle='#34483d';g.fillRect(90,980,360,260);
 g.fillStyle='#667069';g.fillRect(252,850,46,395);g.fillRect(90,1100,430,46);g.fillRect(275,850,245,42);
 g.fillStyle='#3e4d49';g.fillRect(258,850,34,389);g.fillRect(96,1106,418,34);g.fillRect(281,856,239,30);
 // Bordered planting beds, not obstacles across walking routes.
 for(const [x,y] of [[100,990],[355,990],[100,1170],[355,1170]]){g.fillStyle='#647363';g.fillRect(x,y,85,58);g.fillStyle='#243d31';g.fillRect(x+4,y+4,77,50);}
 // The loading apron gets parking bays and a striped safety edge.
 g.strokeStyle='#b7a06977';g.lineWidth=2;
 for(const x of [1765,1915,2065])g.strokeRect(x,145,130,155);
 g.fillStyle='#c6a55288';for(let x=1760;x<2290;x+=26)g.fillRect(x,318,14,5);
 // Subtle pools of warm light at the busiest public entrances.
 for(const b of BUILDINGS){const x=b.x+b.w/2,y=b.y+b.h+12,light=g.createRadialGradient(x,y,2,x,y,65);light.addColorStop(0,'#ffc76817');light.addColorStop(1,'#ffc76800');g.fillStyle=light;g.fillRect(x-65,y-65,130,130);}
 g.font='bold 12px monospace';g.textAlign='center';g.fillStyle='#9aada3';
 g.fillText('STREET MARKET',275,865);g.fillText('SALVAGER PARK',275,1260);g.fillText('FREIGHT YARD',2010,355);g.fillText('SERVICE PLAZA',1430,340);
 // Perimeter fences are rendered as sprites; no road markings around the forest.
 for(const side of [0,1]){const x=side?WORLD.width:0,fade=g.createLinearGradient(x,0,side?x-85:85,0);fade.addColorStop(0,'#050d13cc');fade.addColorStop(1,'#050d1300');g.fillStyle=fade;g.fillRect(side?WORLD.width-85:0,0,85,WORLD.height);}
 g.font='bold 13px monospace';g.textAlign='center';g.fillStyle='#a8b7af';g.fillText('TOWN SQUARE',1070,1100);g.fillText('WORKSHOPS & MARKET',1070,1615);g.fillText('EAST CHECKPOINT',1710,970);g.textAlign='left';
 if(rustyWoodsEnabled)drawWoodsGround(g);
 return ground;
}
