import {drawForestProp} from './forest-props.ts';
import {WOODS_ELITE_ENCOUNTERS,WOODS_ENCOUNTER_DETAILS,WOODS_EXIT,WOODS_START,WOODS_TREES} from '../../packages/game-core/woods.ts';

function patch(g:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 g.fillStyle=color;g.beginPath();g.ellipse(x,y,w,h,0,0,Math.PI*2);g.fill();
}

function encounterGround(g:CanvasRenderingContext2D){
 for(const encounter of WOODS_ENCOUNTER_DETAILS){
  if(encounter.marker==='root')continue;
  g.save();g.globalAlpha=.72;
  if(encounter.marker==='sap'||encounter.marker==='mire'){
   const dark=encounter.marker==='sap'?'#233b29':'#30243a';
   patch(g,encounter.x,encounter.y+18,encounter.radius,encounter.radius*.38,dark);
   g.strokeStyle=encounter.accent;g.lineWidth=3;
   for(let i=0;i<4;i++){
    const a=i*1.7+(encounter.monsterId%3),x=encounter.x+Math.cos(a)*encounter.radius*.58,y=encounter.y+18+Math.sin(a)*encounter.radius*.18;
    g.beginPath();g.arc(x,y,3+i%2,0,Math.PI*2);g.stroke();
   }
  }else if(encounter.marker==='bramble'){
   g.strokeStyle='#6d7b3f';g.lineWidth=5;g.lineCap='round';
   for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5+.3,x1=encounter.x+Math.cos(a)*18,y1=encounter.y+Math.sin(a)*8,x2=encounter.x+Math.cos(a)*encounter.radius,y2=encounter.y+Math.sin(a)*encounter.radius*.45;
    g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2+Math.sin(a)*12,(y1+y2)/2-Math.cos(a)*8,x2,y2);g.stroke();
   }
   g.fillStyle=encounter.accent;for(const [dx,dy] of [[-27,8],[23,-4],[8,17]])g.fillRect(encounter.x+dx,encounter.y+dy,5,5);
  }else if(encounter.marker==='ash'){
   patch(g,encounter.x,encounter.y+17,encounter.radius*.9,encounter.radius*.34,'#312923');
   g.strokeStyle=encounter.accent;g.lineWidth=2;
   for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7+.2,r=encounter.radius*.72;
    g.beginPath();g.moveTo(encounter.x+Math.cos(a)*12,encounter.y+17+Math.sin(a)*5);g.lineTo(encounter.x+Math.cos(a)*r,encounter.y+17+Math.sin(a)*r*.35);g.stroke();
   }
  }else if(encounter.marker==='rust'||encounter.marker==='iron'){
   patch(g,encounter.x,encounter.y+18,encounter.radius*.92,encounter.radius*.32,encounter.marker==='rust'?'#3d3227':'#2c393b');
   g.strokeStyle=encounter.accent;g.lineWidth=2;
   for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,x=encounter.x+Math.cos(a)*encounter.radius*.52,y=encounter.y+18+Math.sin(a)*encounter.radius*.18;
    g.save();g.translate(x,y);g.rotate(a+.4);g.strokeRect(-8,-4,16,8);g.restore();
   }
   g.beginPath();g.arc(encounter.x,encounter.y+17,14,0,Math.PI*2);g.stroke();g.beginPath();g.arc(encounter.x,encounter.y+17,5,0,Math.PI*2);g.stroke();
  }
  g.restore();
 }
}

function eliteGround(g:CanvasRenderingContext2D){
 for(const elite of WOODS_ELITE_ENCOUNTERS){
  const plague=elite.marker==='plague';g.save();g.globalAlpha=.88;
  patch(g,elite.x,elite.y+20,elite.radius,elite.radius*.38,plague?'#23341e':'#20343b');
  g.strokeStyle=elite.accent;g.lineWidth=3;g.setLineDash([10,8]);
  g.beginPath();g.ellipse(elite.x,elite.y+20,elite.radius,elite.radius*.38,0,0,Math.PI*2);g.stroke();g.setLineDash([]);
  if(plague){
   for(let i=0;i<9;i++){const a=i*.82,r=32+(i%3)*15;g.fillStyle=i%2?'#7daf42':'#4e6f32';g.beginPath();g.arc(elite.x+Math.cos(a)*r,elite.y+18+Math.sin(a)*r*.35,3+i%2,0,Math.PI*2);g.fill();}
  }else{
   g.strokeStyle='#527783';g.lineWidth=2;
   for(let i=0;i<6;i++){const a=i*Math.PI/3,x=elite.x+Math.cos(a)*elite.radius*.62,y=elite.y+20+Math.sin(a)*elite.radius*.23;g.save();g.translate(x,y);g.rotate(a);g.strokeRect(-13,-6,26,12);g.restore();}
   g.fillStyle='#59cce8';g.fillRect(elite.x-16,elite.y+14,32,7);
  }
  g.restore();
 }
}

export function drawWoodsGround(g:CanvasRenderingContext2D){
 // Transition starts before the official region border so the road does not jump
 // straight from town pavement into a solid forest rectangle.
 const transition=g.createLinearGradient(WOODS_START-155,0,WOODS_START,0);transition.addColorStop(0,'#283239');transition.addColorStop(1,'#172f29');g.fillStyle=transition;g.fillRect(WOODS_START-155,90,155,1480);
 g.fillStyle='#172f29';g.fillRect(WOODS_START,50,1400,1580);

 // Large organic ground patches give the woods readable clearings rather than
 // procedural visual noise everywhere.
 const groundPatches=[
  [2580,410,185,95,'#213a2e'],[2890,690,210,120,'#2b4030'],[3170,420,180,100,'#20392c'],
  [3370,1000,240,135,'#283d2f'],[2940,1280,235,120,'#243b30'],[3550,460,160,90,'#314433'],
 ] as const;
 for(const [x,y,w,h,color] of groundPatches){g.save();g.globalAlpha=.4;patch(g,x,y,w,h,color);g.restore();}
 for(let i=0;i<14000;i++){
  const x=WOODS_START+(i*137.37)%1350,y=90+(i*79.71)%1500;
  g.fillStyle=i%4?'#3d543b32':'#9c8c5630';g.fillRect(x,y,2+i%4,2);
 }

 // Main road stays wide through the town/forest transition and gradually becomes
 // a dirt trail as it bends toward Ironroot Grove.
 g.strokeStyle='#4b493b';g.lineWidth=118;g.lineCap='round';g.lineJoin='round';g.beginPath();
 g.moveTo(2180,760);g.lineTo(2460,760);g.lineTo(2670,770);g.lineTo(2940,830);g.lineTo(3270,825);g.lineTo(3540,820);g.lineTo(WOODS_EXIT.x+35,WOODS_EXIT.y);g.stroke();
 g.strokeStyle='#74664b';g.lineWidth=82;g.beginPath();
 g.moveTo(2380,760);g.lineTo(2660,770);g.lineTo(2940,830);g.lineTo(3270,825);g.lineTo(3540,820);g.lineTo(WOODS_EXIT.x+35,WOODS_EXIT.y);g.stroke();
 // Gravel breaks up the dirt ribbon without road lane markings.
 for(let i=0;i<3600;i++){const x=2370+(i*91.71)%1300,y=760+Math.min(1,Math.max(0,(x-2670)/270))*65+Math.sin(i*73.41)*45;g.fillStyle=i%3?'#b19d6838':'#233e3038';g.fillRect(x,y,2+i%4,2+i%3);}

 // Moss trail camp. Kept outside the road collision corridor.
 g.fillStyle='#554b35';patch(g,2470,760,92,64,'#554b35');
 
 g.fillStyle='#6d5639';g.fillRect(2412,705,54,13);g.fillRect(2486,742,34,10);
 g.fillStyle='#d18a45';g.beginPath();g.arc(2470,790,13,0,Math.PI*2);g.fill();
 g.fillStyle='#f0bd58';g.beginPath();g.arc(2470,790,6,0,Math.PI*2);g.fill();

 // Forest landmarks make navigation understandable without adding UI clutter.
 g.fillStyle='#534c38';g.fillRect(3055,285,84,22);g.fillStyle='#839068';g.fillRect(3070,266,53,18);
 g.fillStyle='#70523c';g.fillRect(3155,1330,125,48);g.fillStyle='#353d3c';g.fillRect(3172,1318,76,21);
 g.fillStyle='#202a29';g.beginPath();g.arc(3182,1381,16,0,Math.PI*2);g.arc(3260,1381,16,0,Math.PI*2);g.fill();

 // Normal habitats stay readable, while elite landmarks have larger dashed arenas
 // so players can identify optional high-value encounters before aggroing them.
 encounterGround(g);eliteGround(g);

 // Boss grove gets its own darker arena, but the trail feeds into it naturally.
 g.fillStyle='#342e22';g.beginPath();g.arc(3540,820,165,0,Math.PI*2);g.fill();
 g.strokeStyle='#807c43';g.lineWidth=5;g.stroke();
 for(let i=0;i<9;i++){
  const a=i/9*Math.PI*2,x=3540+Math.cos(a)*142,y=820+Math.sin(a)*142;
  g.fillStyle=i%2?'#596039':'#715a3b';g.fillRect(x-7,y-5,14,10);
 }
 g.strokeStyle='#9a8143';g.lineWidth=7;g.lineCap='round';
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4+.18,x1=3540+Math.cos(a)*42,y1=820+Math.sin(a)*26,x2=3540+Math.cos(a)*142,y2=820+Math.sin(a)*112;
  g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo((x1+x2)/2+Math.sin(a)*17,(y1+y2)/2-Math.cos(a)*12,x2,y2);g.stroke();
 }

 // Expedition checkpoint gives the current map a deliberate eastern finish while
 // keeping the future Junkyard Valley route visually continuous.
 g.fillStyle='#443a2f';g.fillRect(WOODS_EXIT.x-45,WOODS_EXIT.y-92,12,82);g.fillRect(WOODS_EXIT.x+33,WOODS_EXIT.y-92,12,82);
 g.fillStyle='#756247';g.fillRect(WOODS_EXIT.x-49,WOODS_EXIT.y-98,98,12);
 g.fillStyle='#202a29';g.fillRect(WOODS_EXIT.x-58,WOODS_EXIT.y-132,116,28);g.strokeStyle='#aa9658';g.lineWidth=2;g.strokeRect(WOODS_EXIT.x-58,WOODS_EXIT.y-132,116,28);
 g.fillStyle='#e2cf86';g.font='bold 10px monospace';g.textAlign='center';g.fillText('JUNKYARD VALLEY →',WOODS_EXIT.x,WOODS_EXIT.y-114);g.textAlign='left';

 g.fillStyle='#c6d799';g.font='bold 22px monospace';g.fillText('RUSTY WOODS · LVL 5–10',2420,640);
 g.font='14px monospace';g.fillStyle='#b8c79b';g.fillText('← TRASH TOWN',2300,900);g.fillText('IRONROOT GROVE →',3260,900);
 g.font='bold 11px monospace';g.fillStyle='#9cac84';g.fillText('WHISPER GROVE · ELITE',2990,255);g.fillText('RUST HAULER · ELITE',3130,1310);
}

const FOREST_DETAILS=[
 {x:2630,y:455,type:'stump'},{x:2815,y:340,type:'mushroom'},{x:2940,y:1050,type:'rock'},
 {x:3150,y:1030,type:'stump'},{x:3270,y:1180,type:'mushroom'},{x:3470,y:420,type:'rock'},
 {x:3650,y:1010,type:'stump'},{x:2700,y:1160,type:'rock'},{x:3500,y:1320,type:'mushroom'},
] as const;

export function woodsObjects(ctx:CanvasRenderingContext2D,image:CanvasImageSource,player?:{x:number;y:number}){
 const trees=WOODS_TREES.map(t=>({y:t.y,draw:()=>{
  const size=145*(t.scale??1),index=(t.variant??0)%3===0?7:6;
  ctx.save();if(player&&Math.abs(player.x-t.x)<size*.5&&player.y<t.y&&player.y>t.y-size)ctx.globalAlpha=.35;
  drawForestProp(ctx,image,index,t.x,t.y,size);ctx.restore();
 }}));
 const details=FOREST_DETAILS.map(d=>({y:d.y,draw:()=>drawForestProp(ctx,image,d.type==='stump'?8:d.type==='rock'?10:11,d.x,d.y,d.type==='stump'?85:65)}));
 const camp=[{index:2,x:2370,y:645,size:95},{index:4,x:2480,y:600,size:125},{index:3,x:2570,y:965,size:125},{index:5,x:2590,y:800,size:60}];
 return [...trees,...details,...camp.map(p=>({y:p.y,draw:()=>drawForestProp(ctx,image,p.index,p.x,p.y,p.size)}))];
}
