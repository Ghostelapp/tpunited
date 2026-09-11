import {DUNGEON,DUNGEON_ROOMS} from '@/packages/game-core/world';
export function makeDungeon(images:Record<number,HTMLImageElement>){
 const c=document.createElement('canvas');c.width=DUNGEON.width;c.height=DUNGEON.height;const g=c.getContext('2d')!;g.imageSmoothingEnabled=false;
 g.fillStyle='#061215';g.fillRect(0,0,c.width,c.height);
 // Room outlines and connected walkways share the authoritative collision layout.
 g.strokeStyle='#466159';g.lineWidth=18;for(const r of DUNGEON_ROOMS)g.strokeRect(r.x,r.y,r.w,r.h);
 g.fillStyle='#1e302d';for(const r of DUNGEON_ROOMS)g.fillRect(r.x,r.y,r.w,r.h);
 g.save();g.beginPath();for(const r of DUNGEON_ROOMS)g.rect(r.x,r.y,r.w,r.h);g.clip();
 g.strokeStyle='#43554b55';g.lineWidth=1;for(let x=0;x<c.width;x+=48){g.beginPath();g.moveTo(x,0);g.lineTo(x,c.height);g.stroke();}for(let y=0;y<c.height;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(c.width,y);g.stroke();}g.restore();
 const draw=(sx:number,sy:number,sw:number,sh:number,x:number,y:number,w:number,h:number)=>g.drawImage(images[10],sx,sy,sw,sh,x,y,w,h);
 // Toxic runoff and machinery sit outside the navigable chamber floors.
 for(let y=390;y<620;y+=70)draw(527,849,68,93,470,y,74,76);
 for(let y=390;y<620;y+=70)draw(600,849,70,93,914,y,74,76);
 for(const [x,y] of [[80,90],[380,90],[610,90],[1250,90],[610,865],[1230,865]])draw(1063,692,117,95,x,y,76,61);
 g.fillStyle='#c7e99a';g.font='bold 16px monospace';g.fillText('TOXIC SEWERS',90,80);g.font='12px monospace';g.fillStyle='#86a299';g.fillText('PUMP CHAMBER',605,135);g.fillText('SALVAGE DRAIN',605,855);g.fillText('THE KING’S DEN',1090,135);
 g.fillStyle='#17271e';g.fillRect(125,825,110,50);g.strokeStyle='#c7e99a';g.strokeRect(125,825,110,50);g.fillStyle='#d9f5aa';g.fillText('[E] EXIT ↑',143,855);
 return c;
}
