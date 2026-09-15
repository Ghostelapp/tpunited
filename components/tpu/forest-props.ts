export const FOREST_PROPS_URL='/assets/forest/props-v2.webp';
export function drawForestProp(ctx:CanvasRenderingContext2D,image:CanvasImageSource,index:number,x:number,y:number,size:number){
 ctx.drawImage(image,index%6*128,Math.floor(index/6)*128,128,128,x-size/2,y-size*124/128,size,size);
}
