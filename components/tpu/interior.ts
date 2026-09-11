import {BUILDINGS,ROOM,ROOM_FURNITURE} from '@/packages/game-core/world';
export function makeInterior(index:number,images:Record<number,HTMLImageElement>){
 const c=document.createElement('canvas');c.width=ROOM.width;c.height=ROOM.height;const g=c.getContext('2d')!;g.imageSmoothingEnabled=false;
 const accent=['#a5c279','#ebae69','#d6bf77','#cc826f','#66cfc3','#ba84bc','#df9e61','#8cb2bf','#64c6d4','#a5ac83','#8c9ebd'][index];
 g.fillStyle='#071217';g.fillRect(25,25,750,550);g.fillStyle='#3e4d51';g.fillRect(45,50,710,510);g.fillStyle='#222f35';g.fillRect(60,100,680,445);
 for(let x=60;x<740;x+=40)for(let y=100;y<545;y+=40){g.fillStyle=(x+y)%80?'#28363b':'#29373c';g.fillRect(x+1,y+1,38,38);}
 g.fillStyle='#17262d';g.fillRect(45,45,710,65);g.strokeStyle=accent;g.lineWidth=3;g.strokeRect(45,45,710,515);g.fillStyle=accent;g.fillRect(63,101,674,3);
 const draw=(sheet:number,sx:number,sy:number,sw:number,sh:number,x:number,y:number,w:number,h:number)=>g.drawImage(images[sheet],sx,sy,sw,sh,x,y,w,h);
 // Reuse intact furniture, terminals and supply props from the supplied atlases.
 ROOM_FURNITURE.forEach((f,i)=>{g.fillStyle='#0005';g.fillRect(f.x-3,f.y+f.h-12,f.w+6,22);
 if(i===4)draw(7,425,984,92,49,f.x,f.y,f.w,f.h);
 else if(i<2){draw(7,891,1077,80,71,f.x,f.y,f.w,f.h);if(index===4)draw(5,353,584,273,229,f.x+35,f.y-12,55,46);else if(index===1||index===6)draw(5,965,26,271,280,f.x+45,f.y-20,42,44);}
 else draw(7,325,984,93,49,f.x,f.y,f.w,f.h);
 });
 draw(7,749,940,64,94,665,285,45,66);draw(10,633,692,69,103,72,277,43,64);
 g.fillStyle=accent;g.font='bold 18px monospace';g.textAlign='center';g.fillText(BUILDINGS[index].name.toUpperCase(),400,82);
 g.fillStyle='#101c21';g.fillRect(350,517,100,45);g.strokeStyle=accent;g.strokeRect(350,517,100,43);g.font='bold 12px monospace';g.fillStyle=accent;g.fillText('EXIT ↓',400,548);
 return c;
}
