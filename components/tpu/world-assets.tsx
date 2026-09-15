import {AtlasFrame} from './atlas-frame';
import {Sprite} from './sprite';
export const ITEMS={scrap:[28,830,284,198],circuits:[349,830,305,198],medkit:[353,584,273,229],blade:[12,15,317,305],armor:[341,321,270,249],boots:[650,335,305,235],backpack:[35,581,280,240],battery:[1002,577,184,240]} as const;
export function ItemIcon({name,width=40}:{name:keyof typeof ITEMS;width?:number}){const [x,y,w,h]=ITEMS[name];return <Sprite sheet={5} x={x} y={y} w={w} h={h} width={width}/>}
// Nine-slice the empty inventory slot, preserving the original metal corners.
export function Frame(){return <AtlasFrame/>}
export function UIIcon({name,width=32}:{name:'bag'|'quests'|'craft'|'daily'|'settings'|'interact'|'close';width?:number}){
 const icons={bag:[979,78,43,43],quests:[332,491,33,42],craft:[333,449,34,31],daily:[1175,1034,51,45],settings:[1184,78,45,46],interact:[1021,549,34,41],close:[1048,640,42,40]} as const;const [x,y,w,h]=icons[name];return <Sprite sheet={6} x={x} y={y} w={w} h={h} width={width}/>;
}
export {DECOR} from './world-decor';
