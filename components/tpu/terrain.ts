import {WORLD} from '@/packages/game-core/world';
// Roads are one connected network on a single low-contrast asphalt material.
export const ROADS=[[[520,760],[2260,760]],[[520,1150],[1600,1150]],[[520,1510],[2240,1510]],[[520,90],[520,1560]],[[1600,90],[1600,1560]]] as const;
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
 // Edge service strip joins the whole perimeter; gradients soften the outer boundary.
 g.strokeStyle='#172328';g.lineWidth=38;g.strokeRect(18,18,WORLD.width-36,WORLD.height-36);
 g.strokeStyle='#65716b';g.lineWidth=3;g.strokeRect(36,36,WORLD.width-72,WORLD.height-72);
 g.strokeStyle='#b39a5477';g.lineWidth=2;g.setLineDash([12,12]);g.strokeRect(27,27,WORLD.width-54,WORLD.height-54);g.setLineDash([]);
 for(const side of [0,1]){const x=side?WORLD.width:0,fade=g.createLinearGradient(x,0,side?x-85:85,0);fade.addColorStop(0,'#050d13cc');fade.addColorStop(1,'#050d1300');g.fillStyle=fade;g.fillRect(side?WORLD.width-85:0,0,85,WORLD.height);}
 g.font='bold 13px monospace';g.textAlign='center';g.fillStyle='#a8b7af';g.fillText('TOWN SQUARE',1070,1100);g.fillText('WORKSHOPS & MARKET',1070,1615);g.fillText('EAST CHECKPOINT',1710,970);g.textAlign='left';
 return ground;
}
