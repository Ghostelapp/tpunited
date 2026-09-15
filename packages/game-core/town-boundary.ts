// Same east-wall span and gate opening as the town perimeter sprites.
export const TOWN_EAST_WALL=2365;
export function townWallBlocked(x:number,y:number){
 return Math.abs(x-TOWN_EAST_WALL)<24&&(y<610||y>950);
}
