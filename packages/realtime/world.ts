import {advance,applyMotion,applyWoodsAvailability,initialState,migrateTown,type GameState,type Monster} from '../game-core/world.ts';
import type {Input} from './protocol';

export type WorldPlayer={id:string;state:GameState;input?:Input};
// One authoritative list: old personal monster saves never seed the shared world.
export function initialMonsters(){return initialState().monsters;}
export function stepWorld(monsters:Monster[],players:WorldPlayer[],elapsed:number,now:number,rotation=0,rustyWoodsEnabled=true){
 const dt=Math.min(250,Math.max(0,elapsed));
 let shared=structuredClone(monsters);
 const moved=players.map(p=>{
  const relocated=!rustyWoodsEnabled&&p.state.interior===undefined&&p.state.x>2320;
  let state=applyWoodsAvailability(migrateTown(p.state),rustyWoodsEnabled);
  const input=!relocated&&p.input?.scene===(state.interior??-1)?p.input:undefined;
  state=applyMotion(state,input?.motion??[],dt,`rt:${input?.seq??0}`);
  return {...p,state,input,relocated};
 });
 const town=moved.filter(p=>p.state.interior===undefined);
 const assignments=new Map<string,Set<number>>(town.map(p=>[p.id,new Set()]));
 // Each enemy advances exactly once per tick, toward its nearest eligible player.
 for(const m of shared){
  const target=town.filter(p=>p.state.x>=1740&&p.state.hp>0).sort((a,b)=>Math.hypot(m.x-a.state.x,m.y-a.state.y)-Math.hypot(m.x-b.state.x,m.y-b.state.y)||a.id.localeCompare(b.id))[0]??town[0];
  if(target)assignments.get(target.id)!.add(m.id);
 }
 const result=new Map<string,GameState>();
 const offset=moved.length?rotation%moved.length:0;
 for(const p of [...moved.slice(offset),...moved.slice(0,offset)]){
  p.state.monsters=structuredClone(shared);
  // Movement is already applied. A move action must not apply a second time.
  const action=p.input?.action.type==='move'?{type:'tick' as const}:p.input?.action??{type:'tick' as const};
  const next=advance(p.state,action,dt,now,p.state.interior===undefined?{monsterIds:assignments.get(p.id)??new Set()}:{});
  if(p.relocated)next.events.push('Rusty Woods is closed. Returned to Trash Town.');
  if(p.state.interior===undefined)shared=next.monsters;
  result.set(p.id,next);
 }
 for(const state of result.values())state.monsters=structuredClone(shared);
 return {monsters:shared,players:result};
}
