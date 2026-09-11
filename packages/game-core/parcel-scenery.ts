// Stable, cosmetic scenery. These props are not tokens and grant no inventory items.
export const PARCEL_TILE = 32;
export function parcelScenery(id:number,width:number,height:number){
 let seed=(id*2654435761)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const props:{x:number;y:number;kind:number}[]=[];
 const used=new Set<string>();
 const count=Math.min(72,Math.max(18,Math.floor(width*height/28)));
 for(let i=0;i<count*8&&props.length<count;i++){
  const x=2+Math.floor(random()*(width-4)),y=2+Math.floor(random()*(height-4));
  // Keep a cross-shaped walking route and a generous entrance clear.
  if(Math.abs(x-width/2)<2||Math.abs(y-height/2)<2||y>=height-5)continue;
  if([...used].some(k=>{const [a,b]=k.split(',').map(Number);return Math.abs(a-x)<2&&Math.abs(b-y)<2}))continue;
  used.add(`${x},${y}`);props.push({x,y,kind:Math.floor(random()*4)});
 }
 return props;
}
