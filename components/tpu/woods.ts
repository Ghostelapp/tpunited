import {WOODS_ENCOUNTER_DETAILS,WOODS_START,WOODS_TREES} from '@/packages/game-core/woods';

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

export function drawWoodsGround(g:CanvasRenderingContext2D){
 // Transition starts before the official region border so the road does not jump
 // straight from town pavement into a solid forest rectangle.
 g.fillStyle='#26382f';g.fillRect(WOODS_START-155,90,155,1480);
 for(let i=0;i<32;i++){
  const x=WOODS_START-155+(i*73)%170,y=120+(i*113)%1410;
  patch(g,x,y,42+(i%4)*15,24+(i%3)*10,i%3===0?'#40513d':'#314638');
 }
 g.fillStyle='#172f29';g.fillRect(WOODS_START,50,1400,1580);

 // Large organic ground patches give the woods readable clearings rather than
 // procedural visual noise everywhere.
 const groundPatches=[
  [2580,410,185,95,'#213a2e'],[2890,690,210,120,'#2b4030'],[3170,420,180,100,'#20392c'],
  [3370,1000,240,135,'#283d2f'],[2940,1280,235,120,'#243b30'],[3550,460,160,90,'#314433'],
 ] as const;
 for(const [x,y,w,h,color] of groundPatches)patch(g,x,y,w,h,color);
 for(let i=0;i<520;i++){
  const x=WOODS_START+(i*137)%1350,y=90+(i*79)%1500;
  g.fillStyle=i%4?'#294337':'#4b5034';g.fillRect(x,y,2+i%4,2);
 }

 // Main road stays wide through the town/forest transition and gradually becomes
 // a dirt trail as it bends toward Ironroot Grove.
 g.strokeStyle='#4b493b';g.lineWidth=118;g.lineCap='round';g.lineJoin='round';g.beginPath();
 g.moveTo(2180,760);g.lineTo(2460,760);g.lineTo(2670,770);g.lineTo(2940,830);g.lineTo(3270,825);g.lineTo(3540,820);g.stroke();
 g.strokeStyle='#74664b';g.lineWidth=82;g.beginPath();
 g.moveTo(2380,760);g.lineTo(2660,770);g.lineTo(2940,830);g.lineTo(3270,825);g.lineTo(3540,820);g.stroke();
 g.strokeStyle='#907958';g.lineWidth=3;g.setLineDash([18,26]);g.stroke();g.setLineDash([]);

 // Moss trail camp. Kept outside the road collision corridor.
 g.fillStyle='#3a3428';g.fillRect(2390,675,155,146);
 g.strokeStyle='#9d8453';g.lineWidth=3;g.strokeRect(2390,675,155,146);
 g.fillStyle='#6d5639';g.fillRect(2412,705,54,13);g.fillRect(2486,742,34,10);
 g.fillStyle='#d18a45';g.beginPath();g.arc(2470,790,13,0,Math.PI*2);g.fill();
 g.fillStyle='#f0bd58';g.beginPath();g.arc(2470,790,6,0,Math.PI*2);g.fill();

 // Forest landmarks make navigation understandable without adding UI clutter.
 g.fillStyle='#534c38';g.fillRect(3055,285,84,22);g.fillStyle='#839068';g.fillRect(3070,266,53,18);
 g.fillStyle='#70523c';g.fillRect(3155,1330,125,48);g.fillStyle='#353d3c';g.fillRect(3172,1318,76,21);
 g.fillStyle='#202a29';g.beginPath();g.arc(3182,1381,16,0,Math.PI*2);g.arc(3260,1381,16,0,Math.PI*2);g.fill();

 // Every normal monster now has a readable habitat tell: sap/mire pools, bramble
 // dens, ash scars or mechanical nests. These are ground details, never blockers.
 encounterGround(g);

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

 g.fillStyle='#c6d799';g.font='bold 22px monospace';g.fillText('RUSTY WOODS · LVL 5–10',2420,640);
 g.font='14px monospace';g.fillStyle='#b8c79b';g.fillText('← TRASH TOWN',2300,900);g.fillText('IRONROOT GROVE →',3260,900);
 g.font='bold 11px monospace';g.fillStyle='#9cac84';g.fillText('WHISPER GROVE',3025,255);g.fillText('RUST HAULER',3160,1310);
}

const FOREST_DETAILS=[
 {x:2630,y:455,type:'stump'},{x:2815,y:340,type:'mushroom'},{x:2940,y:1050,type:'rock'},
 {x:3150,y:1030,type:'stump'},{x:3270,y:1180,type:'mushroom'},{x:3470,y:420,type:'rock'},
 {x:3650,y:1010,type:'stump'},{x:2700,y:1160,type:'rock'},{x:3500,y:1320,type:'mushroom'},
] as const;

function detailObject(ctx:CanvasRenderingContext2D,d:typeof FOREST_DETAILS[number]){return {y:d.y,draw:()=>{
 ctx.save();ctx.translate(d.x,d.y);
 ctx.fillStyle='#0a171a77';ctx.beginPath();ctx.ellipse(0,3,d.type==='rock'?23:18,7,0,0,Math.PI*2);ctx.fill();
 if(d.type==='stump'){
  ctx.fillStyle='#4d3529';ctx.fillRect(-12,-28,24,29);ctx.fillStyle='#8a6342';ctx.beginPath();ctx.ellipse(0,-27,12,5,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#31241d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-27,6,0,Math.PI*2);ctx.stroke();
 }else if(d.type==='mushroom'){
  for(const [dx,h] of [[-10,17],[4,23],[15,14]] as const){ctx.fillStyle='#d8cfab';ctx.fillRect(dx,-h,4,h);ctx.fillStyle='#b96f4a';ctx.beginPath();ctx.arc(dx+2,-h,7,Math.PI,Math.PI*2);ctx.fill();}
 }else{
  ctx.fillStyle='#4a5550';ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-13,-20);ctx.lineTo(8,-28);ctx.lineTo(23,-7);ctx.lineTo(17,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#6d7770';ctx.beginPath();ctx.moveTo(-12,-17);ctx.lineTo(8,-25);ctx.lineTo(16,-9);ctx.closePath();ctx.fill();
 }
 ctx.restore();
 }};}

export function woodsObjects(ctx:CanvasRenderingContext2D){
 const trees=WOODS_TREES.map(t=>({y:t.y,draw:()=>{
  const scale=t.scale??1,variant=t.variant??0;
  ctx.save();ctx.translate(t.x,t.y);ctx.scale(scale,scale);
  ctx.fillStyle='#0a171a88';ctx.beginPath();ctx.ellipse(4,-2,48,11,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=variant%2?'#5a3f31':'#654332';ctx.fillRect(-16,-105,32,108);
  ctx.fillStyle='#a37747';ctx.fillRect(-10,-92,7,95);
  const crown=variant%3===0?72:variant%3===1?62:67;
  for(let i=0;i<3;i++){
   ctx.fillStyle=[variant%2?'#183c31':'#1c4033',variant%2?'#2a573b':'#315e3d',variant%2?'#4d6b41':'#547244'][i];
   ctx.beginPath();ctx.moveTo(0,-190+i*36);ctx.lineTo(crown-i*9,-80+i*24);ctx.lineTo(-crown+i*9,-80+i*24);ctx.closePath();ctx.fill();
  }
  if(variant===2||variant===4){ctx.fillStyle='#788054';ctx.fillRect(-40,-76,18,7);ctx.fillRect(27,-57,21,6);}
  if(variant===1||variant===3){ctx.fillStyle='#cf9556';ctx.fillRect(19,-37,13,7);ctx.fillRect(-27,-23,10,6);}
  ctx.restore();
 }}));
 return [...trees,...FOREST_DETAILS.map(d=>detailObject(ctx,d))];
}
