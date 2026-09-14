import {WOODS_START,WOODS_TREES} from '@/packages/game-core/woods';
export function drawWoodsGround(g:CanvasRenderingContext2D){
 g.fillStyle='#172f29';g.fillRect(WOODS_START,50,1400,1580);
 for(let i=0;i<1400;i++){const x=WOODS_START+(i*137)%1350,y=90+(i*79)%1500;g.fillStyle=i%3?'#294337':'#4b5034';g.fillRect(x,y,3+i%5,3);}
 g.strokeStyle='#574b35';g.lineWidth=100;g.beginPath();g.moveTo(2240,760);g.lineTo(2680,760);g.lineTo(2950,830);g.lineTo(3540,820);g.stroke();
 g.strokeStyle='#766243';g.lineWidth=3;g.stroke();
 g.fillStyle='#4c4934';g.fillRect(2390,690,150,140);
 g.strokeStyle='#a78d54';g.strokeRect(2390,690,150,140);
 g.fillStyle='#c6d799';g.font='bold 22px monospace';g.fillText('RUSTY WOODS · LVL 5–10',2420,650);
 g.font='14px monospace';g.fillText('← TRASH TOWN     IRONROOT GROVE →',2540,880);
 g.fillStyle='#342e22';g.beginPath();g.arc(3540,820,165,0,Math.PI*2);g.fill();
 g.strokeStyle='#807c43';g.lineWidth=5;g.stroke();
}
export function woodsObjects(ctx:CanvasRenderingContext2D){
 return WOODS_TREES.map(t=>({y:t.y,draw:()=>{
  ctx.fillStyle='#0a171a88';ctx.fillRect(t.x-42,t.y-5,95,20);
  ctx.fillStyle='#654332';ctx.fillRect(t.x-16,t.y-105,32,108);
  ctx.fillStyle='#a37747';ctx.fillRect(t.x-10,t.y-92,7,95);
  for(let i=0;i<3;i++){
   ctx.fillStyle=['#1c4033','#315e3d','#547244'][i];
   ctx.beginPath();ctx.moveTo(t.x,t.y-185+i*36);ctx.lineTo(t.x+64-i*8,t.y-80+i*24);ctx.lineTo(t.x-64+i*8,t.y-80+i*24);ctx.closePath();ctx.fill();
  }
  ctx.fillStyle='#cf9556';ctx.fillRect(t.x+19,t.y-37,13,7);ctx.fillRect(t.x-27,t.y-23,10,6);
 }}));
}
