import {drawForestProp} from './forest-props.ts';
import {WOODS_ALL_SPAWNS,WOODS_EVENTS,WOODS_EXIT,WOODS_TREES} from '../../packages/game-core/woods.ts';
import {WOODS_CANOPY_START,WOODS_PROPS,WOODS_TRAILS,WOODS_WORLD_WIDTH,trailDistance} from '../../packages/game-core/woods-layout.ts';

const noise=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function route(g:CanvasRenderingContext2D,points:readonly (readonly [number,number])[]){
 g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
}
function clearing(g:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string,seed:number){
 g.beginPath();for(let i=0;i<=32;i++){
  const a=i%32/32*Math.PI*2,r=.87+noise(seed+i%32)*.13;
  const px=x+Math.cos(a)*rx*r,py=y+Math.sin(a)*ry*r;
  if(i===0)g.moveTo(px,py);else g.lineTo(px,py);
 }g.closePath();g.fillStyle=color;g.fill();
}
export function drawWoodsGround(g:CanvasRenderingContext2D){
 g.save();g.lineCap='round';g.lineJoin='round';
 // A continuous, broad colour transition overlays the town's existing pavement.
 const base=g.createLinearGradient(2260,0,WOODS_CANOPY_START+700,0);
 base.addColorStop(0,'#28323900');base.addColorStop(.2,'#353d32e0');base.addColorStop(.55,'#303b2b');base.addColorStop(1,'#202f27');
 g.fillStyle=base;g.fillRect(2260,45,WOODS_WORLD_WIDTH-2260,1600);
 // Small irregular soil patches avoid the former giant circles and straight biome seam.
 for(let i=0;i<260;i++){
  const x=2360+noise(i+1)*3700,y=100+noise(i+501)*1480;
  clearing(g,x,y,45+noise(i+900)*100,25+noise(i+1200)*45,i%3?'#31402a55':'#4b493335',i*33);
 }
 // Ground texture is baked once into terrain, never regenerated per animation frame.
 for(let i=0;i<52000;i++){
  const x=2300+noise(i+8000)*3830,y=90+noise(i+62000)*1510;
  g.globalAlpha=Math.min(1,(x-2300)/500)*(.12+noise(i+140000)*.2);
  g.fillStyle=['#69734a','#8c7955','#14271f','#42573a'][i%4];
  const w=1+noise(i+90000)*5;g.fillRect(Math.round(x),Math.round(y),w,1+noise(i+120000)*3);
 }
 g.globalAlpha=1;
 // Runoff ditch in the outskirts: banks end beside the culvert, leaving the road open.
 for(const points of [[[3000,120],[2960,380],[3010,620],[2980,775]],[[2980,920],[3050,1120],[3000,1360],[3090,1580]]] as const){
  for(const [width,color] of [[60,'#484b37'],[40,'#202e29'],[22,'#314746'],[5,'#516254']] as const){route(g,points);g.lineWidth=width;g.strokeStyle=color;g.stroke();}
 }
 // Connected trails lead to every encounter, with room to dodge and walk back.
 for(const [extra,color] of [[25,'#39402d'],[10,'#554e37'],[0,'#6b6044']] as const){
  for(const trail of WOODS_TRAILS){route(g,trail.points);g.lineWidth=trail.width+extra;g.strokeStyle=color;g.stroke();}
 }
 // Pavement breaks up gradually along the service road, then gives way to gravel.
 const asphalt=g.createLinearGradient(2200,0,3040,0);asphalt.addColorStop(0,'#28343c');asphalt.addColorStop(.6,'#38403de8');asphalt.addColorStop(1,'#38403d00');
 route(g,WOODS_TRAILS[0].points.slice(0,4));g.strokeStyle=asphalt;g.lineWidth=78;g.stroke();
 g.strokeStyle='#b7a27355';g.lineWidth=2;g.setLineDash([19,31]);route(g,[[2220,760],[2670,760]]);g.stroke();g.setLineDash([]);
 for(let i=0;i<18000;i++){
  const trail=WOODS_TRAILS[i%WOODS_TRAILS.length],segment=1+i%(trail.points.length-1),a=trail.points[segment-1],b=trail.points[segment];
  const t=noise(i+180000),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),offset=(noise(i+200000)-.5)*trail.width*.98;
  const x=a[0]+dx*t-dy/length*offset,y=a[1]+dy*t+dx/length*offset;
  g.fillStyle=i%3?'#c3aa6b24':'#292f272a';g.fillRect(x,y,1+noise(i)*4,1+noise(i+300)*2);
 }
 // Weathered concrete culvert carries the old road over the runoff ditch.
 g.fillStyle='#626559';g.fillRect(2930,786,112,11);g.fillRect(2960,886,112,11);
 g.fillStyle='#303c37';for(let i=0;i<7;i++){g.fillRect(2938+i*15,788,4,7);g.fillRect(2968+i*15,888,4,7);}
 clearing(g,2530,690,120,65,'#55513b',7);
 for(let i=0;i<650;i++){const x=2430+noise(i)*210,y=635+noise(i+700)*100;g.fillStyle=i%2?'#9d916633':'#232d2528';g.fillRect(x,y,3,2);}
 // Habitat textures sit inside foliage clearings, with no oversized painted arena rings.
 for(const m of WOODS_ALL_SPAWNS){
  const radius=m.kind==='boss'?205:105;
  clearing(g,m.x,m.y,radius,radius*.65,m.id===20?'#2a4238':m.id===23?'#34352a':'#484733',m.id*10);
  for(let i=0;i<150;i++){
   const a=noise(i+m.id*400)*Math.PI*2,r=Math.sqrt(noise(i+500+m.id*300))*radius;
   g.fillStyle=i%2?'#89865a30':'#1e2e2540';g.fillRect(m.x+Math.cos(a)*r,m.y+Math.sin(a)*r*.6,3,2);
  }
 }
 // A subtle fire pit at the ranger camp; buildings and debris are real atlas props.
 clearing(g,2580,700,18,12,'#262921',55);g.fillStyle='#b17338';g.fillRect(2572,696,16,4);g.fillStyle='#dbad58';g.fillRect(2578,691,5,7);
 g.restore();
}

const DETAILS=Array.from({length:460},(_,i)=>({
 x:2650+noise(i+4000)*3460,y:160+noise(i+7000)*1340,index:[8,9,10,11,10,11][i%6],size:45+noise(i+9000)*45,
})).filter(p=>!WOODS_TRAILS.some(t=>trailDistance(p.x,p.y,t.points)<t.width/2+28)&&!WOODS_ALL_SPAWNS.some(m=>Math.hypot(p.x-m.x,p.y-m.y)<75));
const LABELS=[{x:2550,y:550,text:'MOSS TRAIL CAMP'},{x:2940,y:670,text:'OLD SERVICE ROAD'},{x:3410,y:1010,text:'RUSTY WOODS · LVL 5–10'},...WOODS_EVENTS.map(e=>({x:e.x,y:e.y-105,text:e.eliteId===27?'WHISPER GROVE':'RUST HAULER WRECK'})),{x:5600,y:590,text:'IRONROOT GROVE'},{x:WOODS_EXIT.x,y:WOODS_EXIT.y-130,text:'JUNKYARD VALLEY →'}];
export function woodsObjects(ctx:CanvasRenderingContext2D,image:CanvasImageSource,player?:{x:number;y:number},visible?:(x:number,y:number,w:number,h:number)=>boolean){
 const props=[...WOODS_TREES.map(t=>({x:t.x,y:t.y,size:170*t.scale,index:t.variant%3===0?7:6,tree:true})),...DETAILS,...WOODS_PROPS];
 const objects=props.filter(p=>!visible||visible(p.x-p.size/2,p.y-p.size,p.size,p.size)).map(p=>({y:p.y,draw:()=>{
  ctx.save();ctx.imageSmoothingEnabled=false;
  if('tree' in p&&player&&Math.abs(player.x-p.x)<p.size*.5&&player.y<p.y&&player.y>p.y-p.size)ctx.globalAlpha=.32;
  drawForestProp(ctx,image,p.index,p.x,p.y,p.size);ctx.restore();
 }}));
 // Labels are sorted with objects so they remain legible above nearby ground detail.
 for(const label of LABELS){if(visible&&!visible(label.x-140,label.y-20,280,25))continue;objects.push({y:label.y+180,draw:()=>{
  ctx.save();ctx.textAlign='center';ctx.font='bold 12px monospace';ctx.lineWidth=4;ctx.strokeStyle='#17241e';ctx.strokeText(label.text,label.x,label.y);ctx.fillStyle='#bcc49c';ctx.fillText(label.text,label.x,label.y);ctx.restore();
 }});}
 return objects;
}
