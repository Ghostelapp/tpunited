import {WORLD} from '@/packages/game-core/world';

// Trash Town keeps its hard-surface street network, while the eastern outskirts
// transition into the first dangerous overworld biome: Rusty Woods.
export const ROADS=[[[520,760],[1740,760]],[[520,1150],[1600,1150]],[[520,1510],[2240,1510]],[[520,90],[520,1560]],[[1600,90],[1600,1560]]] as const;

const FOREST={x:1685,y:105,w:655,h:1165};
type Ctx=CanvasRenderingContext2D;

function seeded(seed:number){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function dist(x:number,y:number,cx:number,cy:number){return Math.hypot(x-cx,y-cy)}
function forestPath(g:Ctx){
 g.beginPath();g.moveTo(1655,760);g.bezierCurveTo(1780,750,1810,650,1900,620);g.bezierCurveTo(2025,580,2070,690,2160,745);g.bezierCurveTo(2250,800,2255,945,2140,1055);g.bezierCurveTo(2080,1115,2055,1180,2080,1245);
}
function drawTree(g:Ctx,x:number,y:number,s=1,dead=false){
 g.save();g.translate(Math.round(x),Math.round(y));g.scale(s,s);
 g.fillStyle=dead?'#3b2c28':'#49372b';g.fillRect(-5,-5,10,27);g.fillStyle='#241b18';g.fillRect(-2,0,4,22);
 if(dead){
  g.fillStyle='#5c4131';g.fillRect(-3,-18,6,20);g.fillRect(-17,-15,18,5);g.fillRect(0,-10,17,5);g.fillRect(-15,-26,5,15);g.fillRect(10,-24,5,16);
 }else{
  const layers=[[-23,-32,46,18],[-29,-22,58,20],[-34,-11,68,22],[-29,1,58,18]] as const;
  for(const [rx,ry,rw,rh] of layers){g.fillStyle='#132e28';g.fillRect(rx,ry,rw,rh);g.fillStyle='#1e4938';g.fillRect(rx+4,ry+3,rw-9,rh-6);g.fillStyle='#2d6045';g.fillRect(rx+10,ry+5,Math.max(8,rw-24),5);}
  g.fillStyle='#7d8c47';g.fillRect(-18,-18,7,5);g.fillRect(12,-5,8,5);
 }
 g.restore();
}
function drawRock(g:Ctx,x:number,y:number,s=1){
 g.save();g.translate(Math.round(x),Math.round(y));g.scale(s,s);g.fillStyle='#1d2624';g.fillRect(-16,-7,32,15);g.fillStyle='#46514a';g.fillRect(-13,-11,23,17);g.fillStyle='#687166';g.fillRect(-8,-9,10,5);g.fillStyle='#28362f';g.fillRect(6,-4,8,8);g.restore();
}
function drawMushrooms(g:Ctx,x:number,y:number,toxic=false){
 const caps=toxic?['#4ee8c5','#37b8aa','#9af9dd']:['#d95348','#f08056','#e6b15d'];
 for(let i=0;i<3;i++){const dx=(i-1)*10,dy=i===1?-5:1;g.fillStyle='#d7c9a1';g.fillRect(x+dx-1,y+dy,3,10);g.fillStyle=caps[i];g.fillRect(x+dx-6,y+dy-5,12,5);g.fillRect(x+dx-4,y+dy-8,8,3);}
}
function drawForest(g:Ctx){
 // Dark mossy ground with stepped edges. The combat clearings deliberately stay open.
 g.fillStyle='#111b18';g.fillRect(FOREST.x,FOREST.y,FOREST.w,FOREST.h);
 g.fillStyle='#182a21';g.fillRect(FOREST.x+20,FOREST.y+15,FOREST.w-40,FOREST.h-35);
 g.fillStyle='#21372a';g.fillRect(FOREST.x+46,FOREST.y+36,FOREST.w-92,FOREST.h-75);
 g.fillStyle='#17261e';for(const [x,y,w,h] of [[1710,140,120,120],[2240,180,80,210],[1715,1010,110,190],[2200,980,115,230]])g.fillRect(x,y,w,h);

 // Broken town road becomes a dirt trail immediately behind the east checkpoint.
 forestPath(g);g.lineJoin='round';g.lineCap='round';g.strokeStyle='#141512';g.lineWidth=86;g.stroke();forestPath(g);g.strokeStyle='#5c4630';g.lineWidth=72;g.stroke();forestPath(g);g.strokeStyle='#775b39';g.lineWidth=50;g.stroke();
 g.setLineDash([11,17]);forestPath(g);g.strokeStyle='#a48a55';g.lineWidth=3;g.stroke();g.setLineDash([]);

 // Walkable combat clearings around the existing monster population.
 for(const [x,y,r] of [[1930,480,105],[2060,480,92],[2190,480,100],[1930,710,100],[2060,710,100],[2190,710,105],[1930,940,110],[2060,940,105]]){
  g.fillStyle='#273b2d';g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.fillStyle='#354b33';g.beginPath();g.arc(x,y,r-15,0,Math.PI*2);g.fill();
 }

 // Shallow cyan runoff gives the forest a strong silhouette without blocking movement.
 g.beginPath();g.moveTo(2290,135);g.bezierCurveTo(2245,310,2320,420,2260,575);g.bezierCurveTo(2215,705,2315,845,2260,980);g.bezierCurveTo(2220,1080,2260,1165,2215,1250);g.strokeStyle='#102d31';g.lineWidth=58;g.stroke();
 g.beginPath();g.moveTo(2290,135);g.bezierCurveTo(2245,310,2320,420,2260,575);g.bezierCurveTo(2215,705,2315,845,2260,980);g.bezierCurveTo(2220,1080,2260,1165,2215,1250);g.strokeStyle='#1f6870';g.lineWidth=40;g.stroke();
 g.beginPath();g.moveTo(2290,135);g.bezierCurveTo(2245,310,2320,420,2260,575);g.bezierCurveTo(2215,705,2315,845,2260,980);g.bezierCurveTo(2220,1080,2260,1165,2215,1250);g.strokeStyle='#42aeb2';g.lineWidth=4;g.stroke();
 for(const y of [350,760,1080]){g.fillStyle='#3b2d24';g.fillRect(2227,y-10,70,20);for(let x=2231;x<2294;x+=12){g.fillStyle='#765238';g.fillRect(x,y-8,8,16)}}

 // Dense trees live between clearings and paths so the east side reads as a real biome.
 const rnd=seeded(13371337);let placed=0,guard=0;
 while(placed<74&&guard++<900){const x=1710+rnd()*590,y=135+rnd()*1080;
  const nearClearing=[[1930,480,132],[2060,480,120],[2190,480,126],[1930,710,126],[2060,710,126],[2190,710,132],[1930,940,136],[2060,940,130]].some(([cx,cy,r])=>dist(x,y,cx,cy)<r);
  const nearTrail=Math.abs(y-(760+(x-1690)*.42))<70||x>2215;
  const nearDepot=x>1840&&y>1260;
  if(nearClearing||nearTrail||nearDepot)continue;
  drawTree(g,x,y,.72+rnd()*.48,rnd()<.13);placed++;
 }
 for(const [x,y,s] of [[1740,180,1.1],[1800,1090,1.25],[2320,300,.95],[2310,1190,1.1],[1860,260,.9],[2180,260,.9]])drawTree(g,x,y,s,false);
 for(const [x,y,s] of [[1810,430,1],[2155,610,.9],[1860,855,1.15],[2160,1110,.8],[2290,700,.9],[1760,970,.8]])drawRock(g,x,y,s);

 // Toxic pockets and scavenger details make the forest feel like Trash Panda rather than generic woodland.
 for(const [x,y] of [[2130,385],[2200,900],[1840,1030],[2270,520]])drawMushrooms(g,x,y,true);
 for(const [x,y] of [[1815,320],[2010,1090],[2180,1040]])drawMushrooms(g,x,y,false);
 g.fillStyle='#79e2d2';for(const [x,y] of [[2145,398],[2218,914],[2265,535]]){g.globalAlpha=.18;g.beginPath();g.arc(x,y,28,0,Math.PI*2);g.fill();g.globalAlpha=1;}

 // Rusted checkpoint sign and region labels.
 g.fillStyle='#171c1d';g.fillRect(1702,690,120,54);g.fillStyle='#5b4937';g.fillRect(1708,696,108,42);g.strokeStyle='#a8743d';g.lineWidth=3;g.strokeRect(1708,696,108,42);g.fillStyle='#d5c69b';g.font='bold 13px monospace';g.textAlign='center';g.fillText('RUSTY WOODS',1762,714);g.font='11px monospace';g.fillStyle='#88d3c8';g.fillText('LVL 5–10',1762,730);
 g.fillStyle='#07110fcc';g.fillRect(1880,150,255,44);g.strokeStyle='#2b6b5b';g.lineWidth=2;g.strokeRect(1880,150,255,44);g.font='bold 18px monospace';g.fillStyle='#b4d8c2';g.fillText('RUSTY WOODS',2007,177);
 g.font='bold 12px monospace';g.fillStyle='#83a996';g.fillText('MUTANT GROVE',2070,335);g.fillText('TOXIC HOLLOW',2155,1000);g.fillText('SEWER TRAIL',2095,1220);g.textAlign='left';
}

export function makeTerrain(image:HTMLImageElement){
 const ground=document.createElement('canvas');ground.width=WORLD.width;ground.height=WORLD.height;
 const g=ground.getContext('2d')!;g.imageSmoothingEnabled=false;g.fillStyle='#283239';g.fillRect(0,0,ground.width,ground.height);
 // Mirroring a clean interior crop makes all four tile boundaries meet exactly.
 const tile=document.createElement('canvas');tile.width=128;tile.height=128;const t=tile.getContext('2d')!;
 for(let y=0;y<2;y++)for(let x=0;x<2;x++){t.save();t.translate(x?128:0,y?128:0);t.scale(x?-1:1,y?-1:1);t.drawImage(image,555,53,64,64,0,0,64,64);t.restore();}
 const pattern=g.createPattern(tile,'repeat')!;
 const roads=()=>{g.beginPath();for(const road of ROADS){g.moveTo(road[0][0],road[0][1]);g.lineTo(road[1][0],road[1][1]);}};
 g.lineJoin='round';g.lineCap='round';roads();g.strokeStyle='#475158';g.lineWidth=140;g.stroke();
 roads();g.strokeStyle='#343e45';g.lineWidth=134;g.stroke();
 roads();g.strokeStyle='#1d282e';g.lineWidth=104;g.stroke();
 // The square shares the same surface, with a curb instead of a separate tile sheet.
 g.fillStyle='#475158';g.fillRect(895,815,350,255);g.fillStyle='#303b41';g.fillRect(899,819,342,247);
 g.globalAlpha=.18;g.fillStyle=pattern;g.fillRect(0,0,WORLD.width,WORLD.height);g.globalAlpha=1;
 g.strokeStyle='#a08d5666';g.lineWidth=3;g.setLineDash([23,27]);roads();g.stroke();g.setLineDash([]);
 // Crosswalks and parking markings are continuous world geometry, not framed tiles.
 g.fillStyle='#a4aea66e';for(const x of [615,1495])for(const y of [760,1150,1510])for(let i=-3;i<=3;i++)g.fillRect(x+i*12,y-39,6,78);
 g.strokeStyle='#68747266';g.lineWidth=2;for(let x=1290;x<1510;x+=48){g.strokeRect(x,1450,40,45)}
 drawForest(g);
 // Edge service strip joins the whole perimeter; gradients soften the outer boundary.
 g.strokeStyle='#172328';g.lineWidth=38;g.strokeRect(18,18,WORLD.width-36,WORLD.height-36);
 g.strokeStyle='#65716b';g.lineWidth=3;g.strokeRect(36,36,WORLD.width-72,WORLD.height-72);
 g.strokeStyle='#b39a5477';g.lineWidth=2;g.setLineDash([12,12]);g.strokeRect(27,27,WORLD.width-54,WORLD.height-54);g.setLineDash([]);
 for(const side of [0,1]){const x=side?WORLD.width:0,fade=g.createLinearGradient(x,0,side?x-85:85,0);fade.addColorStop(0,'#050d13cc');fade.addColorStop(1,'#050d1300');g.fillStyle=fade;g.fillRect(side?WORLD.width-85:0,0,85,WORLD.height);}
 g.font='bold 13px monospace';g.textAlign='center';g.fillStyle='#a8b7af';g.fillText('TOWN SQUARE',1070,1100);g.fillText('WORKSHOPS & MARKET',1070,1615);g.fillText('EAST CHECKPOINT',1650,970);g.textAlign='left';
 return ground;
}
