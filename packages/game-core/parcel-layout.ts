export function footprint(x:number,y:number,width:number,height:number,rotation:number,mapWidth:number,mapHeight:number){
 if(![x,y,width,height,rotation,mapWidth,mapHeight].every(Number.isInteger)||![0,90,180,270].includes(rotation)||width<1||height<1)throw Error('Invalid placement.');
 const w=rotation%180?height:width,h=rotation%180?width:height;
 if(x<0||y<0||x+w>mapWidth||y+h>mapHeight)throw Error('Place the whole decoration inside your parcel.');
 return Array.from({length:w*h},(_,i)=>({x:x+i%w,y:y+Math.floor(i/w)}));
}
