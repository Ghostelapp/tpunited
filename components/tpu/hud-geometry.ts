export type HudBox={id:string;x:number;y:number;width:number;height:number};
const overlap=(a:HudBox,b:HudBox)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
// Pack around the viewport edges, keeping space for the centered avatar.
export function fitHud(width:number,height:number,boxes:HudBox[]){
 const placed:HudBox[]=[],result:Record<string,{x:number;y:number}>={};
 const center={id:'avatar',x:width/2-48,y:height/2-130,width:96,height:152};
 for(const box of boxes){const maxX=Math.max(6,width-box.width-6),maxY=Math.max(6,height-box.height-6),clamp=(x:number,y:number)=>({x:Math.max(6,Math.min(maxX,x)),y:Math.max(6,Math.min(maxY,y))});
 const desired=clamp(box.x,box.y),candidates=[desired];
 for(let y=6;y<=maxY;y+=16)for(const x of [6,maxX,desired.x])candidates.push(clamp(x,y));
 for(let x=6;x<=maxX;x+=16)for(const y of [6,maxY,desired.y])candidates.push(clamp(x,y));
 candidates.push(clamp(maxX,maxY));let best=desired,bestScore=Infinity;
 for(const point of candidates){const candidate={...box,...point},area=4*overlap(candidate,center)+placed.reduce((n,p)=>n+overlap(candidate,{...p,x:p.x-4,y:p.y-4,width:p.width+8,height:p.height+8}),0),score=area*100000+Math.hypot(point.x-desired.x,point.y-desired.y);if(score<bestScore){bestScore=score;best=point;}if(score===0)break;}
 result[box.id]=best;placed.push({...box,...best});
 }
 return result;
}
