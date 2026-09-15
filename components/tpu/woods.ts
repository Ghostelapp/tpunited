import {drawForestProp} from './forest-props.ts';
import {WOODS_ALL_SPAWNS,WOODS_EVENTS,WOODS_EXIT,WOODS_TREES} from '../../packages/game-core/woods.ts';
import {WOODS_CANOPY_START,WOODS_PROPS,WOODS_TRAILS,WOODS_WORLD_WIDTH,trailDistance} from '../../packages/game-core/woods-layout.ts';

const noise=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
function route(g:CanvasRenderingContext2D,points:readonly (readonly [number,number])[]){
 g.beginPath();g.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],b=points[i],c=points[i+1],before=Math.hypot(b[0]-a[0],b[1]-a[1]),after=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(45,before/3,after/3);
  g.lineTo(b[0]-(b[0]-a[0])*r/before,b[1]-(b[1]-a[1])*r/before);
  g.quadraticCurveTo(b[0],b[1],b[0]+(c[0]-b[0])*r/after,b[1]+(c[1]-b[1])*r/after);
 }
 const last=points[points.length-1];g.lineTo(last[0],last[1]);
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
 g.fillStyle=base;g.fillRect(2260,0,WOODS_WORLD_WIDTH-2260,1700);
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
 // Shallow runoff has irregular muddy banks, scattered stones and broken highlights.
 for(const points of [[[3000,-40],[2960,380],[3010,620],[2980,795]],[[2980,902],[3050,1120],[3000,1360],[3090,1740]]] as const){
  route(g,points);g.lineWidth=26;g.strokeStyle='#233b35';g.stroke();
  for(let j=1;j<points.length;j++){
   const a=points[j-1],b=points[j],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
   for(let d=0;d<length;d+=9){const t=d/length,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,seed=j*400+d;
    clearing(g,x,y,18+noise(seed)*10,12,'#35433788',seed);
    clearing(g,x+noise(seed+30)*7-3,y,9+noise(seed+70)*5,9,'#29423d',seed+80);
    g.fillStyle='#78918455';g.fillRect(x-4+noise(seed+12)*8,y,3+noise(seed+13)*6,1);
   }
  }
 }
 // The town road and woodland surface meet inside their overlap: no rounded end-cap.
 g.save();g.beginPath();g.rect(2180,0,WOODS_WORLD_WIDTH-2180,1700);g.clip();
 for(const trail of WOODS_TRAILS){route(g,trail.points);g.lineWidth=trail.width;g.strokeStyle='#665c43';g.stroke();}
 // Break both road edges with small irregular earth patches instead of parallel outlines.
 for(const trail of WOODS_TRAILS)for(let j=1;j<trail.points.length;j++){
  const a=trail.points[j-1],b=trail.points[j],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  for(let d=0;d<length;d+=10)for(const side of [-1,1]){
   const x=a[0]+dx*d/length-dy/length*trail.width*.48*side,y=a[1]+dy*d/length+dx/length*trail.width*.48*side;
   clearing(g,x,y,6+noise(d+j)*10,4+noise(d+30)*7,'#615b404f',d+j*400);
  }
 }
 // Pavement breaks up gradually along the service road, then gives way to gravel.
 const asphalt=g.createLinearGradient(2200,0,3040,0);asphalt.addColorStop(0,'#1d282e');asphalt.addColorStop(.6,'#38403de8');asphalt.addColorStop(1,'#38403d00');
 route(g,WOODS_TRAILS[0].points.slice(0,4));g.strokeStyle=asphalt;g.lineWidth=100;g.stroke();
 g.strokeStyle='#b7a27355';g.lineWidth=2;g.setLineDash([19,31]);route(g,[[2220,760],[2670,760]]);g.stroke();g.setLineDash([]);
 for(let i=0;i<18000;i++){
  const trail=WOODS_TRAILS[i%WOODS_TRAILS.length],segment=1+i%(trail.points.length-1),a=trail.points[segment-1],b=trail.points[segment];
  const t=noise(i+180000),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),offset=(noise(i+200000)-.5)*trail.width*.98;
  const x=a[0]+dx*t-dy/length*offset,y=a[1]+dy*t+dx/length*offset;
  g.fillStyle=i%3?'#c3aa6b24':'#292f272a';g.fillRect(x,y,1+noise(i)*4,1+noise(i+300)*2);
 }
 g.restore();
 // Weathered concrete culvert carries the old road over the runoff ditch.
 g.fillStyle='#626559';g.fillRect(2930,786,112,11);g.fillRect(2960,886,112,11);
 g.fillStyle='#303c37';for(let i=0;i<7;i++){g.fillRect(2938+i*15,788,4,7);g.fillRect(2968+i*15,888,4,7);}
 clearing(g,2530,690,120,65,'#55513b',7);
 for(let i=0;i<650;i++){const x=2430+noise(i)*210,y=635+noise(i+700)*100;g.fillStyle=i%2?'#9d916633':'#232d2528';g.fillRect(x,y,3,2);}
 // Habitat textures sit inside foliage clearings, with no oversized painted arena rings.
 for(const m of WOODS_ALL_SPAWNS){
  const radius=m.kind==='boss'?205:105;
  for(let j=0;j<45;j++){const a=noise(j+m.id*100)*Math.PI*2,r=Math.sqrt(noise(j+500))*radius*.75;clearing(g,m.x+Math.cos(a)*r,m.y+Math.sin(a)*r*.65,25+noise(j+200)*40,15+noise(j+300)*25,m.id===20?'#2a423850':'#615d3d38',j+m.id*100);}
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
const LABELS=[{x:2550,y:550,text:'MOSS TRAIL CAMP'},{x:2940,y:670,text:'OLD SERVICE ROAD'},{x:3410,y:1010,text:'RUSTY WOODS · LVL 5–10'},...WOODS_EVENTS.map(e=>({x:e.x,y:e.y-105,text:e.eliteId===27?'WHISPER GROVE':'RUST HAULER WRECK'})),{x:5600,y:590,text:'IRONROOT GROVE'},{x:WOODS_EXIT.x,y:WOODS_EXIT.y-130,text:'JUNKYARD PASS · CLOSED'}];
const BORDER_PROPS=[
 ...Array.from({length:39},(_,i)=>({x:2500+i*96,y:70+noise(i)*25,size:185+noise(i+100)*45,index:i%3===0?7:6})),
 ...Array.from({length:39},(_,i)=>({x:2500+i*96,y:1745+noise(i)*25,size:180+noise(i+100)*45,index:i%3===0?7:6})),
 ...Array.from({length:18},(_,i)=>({x:6190+noise(i)*35,y:80+i*98,size:190+noise(i+100)*30,index:i%3===0?7:6})),
 {x:6105,y:865,size:150,index:9},
];
export function woodsObjects(ctx:CanvasRenderingContext2D,image:CanvasImageSource,player?:{x:number;y:number},visible?:(x:number,y:number,w:number,h:number)=>boolean){
 const props=[...WOODS_TREES.map(t=>({x:t.x,y:t.y,size:170*t.scale,index:t.variant%3===0?7:6,tree:true})),...DETAILS,...WOODS_PROPS,...BORDER_PROPS];
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
