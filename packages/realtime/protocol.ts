import {z} from 'zod';
import type {GameState} from '../game-core/world';

export const TICK_MS=100;
export const MAX_PLAYERS=30;
export const inputSchema=z.object({
 type:z.literal('input'),seq:z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
 scene:z.number().int().min(-1).max(11),
 action:z.object({
  type:z.enum(['move','attack','interact','heal','craft','tick','buy_medkit','sell_circuit','upgrade','salvage_quest','bounty_quest','daily_claim','cache','woods_event','enter','exit','dungeon_enter','equip','unequip','salvage','legacy_claim','legacy_pin','legacy_title','dodge']),
  dx:z.number().finite().min(-1).max(1).optional(),dy:z.number().finite().min(-1).max(1).optional(),target:z.string().max(30).optional(),
 }).strict(),
 motion:z.array(z.object({dx:z.number().finite().min(-1).max(1),dy:z.number().finite().min(-1).max(1),ms:z.number().finite().min(0).max(40)}).strict()).max(40),
}).strict().refine(v=>v.motion.reduce((n,m)=>n+m.ms,0)<=1000,'Too much movement');
export type Input=z.infer<typeof inputSchema>;
export type Peer={adminSkin?:boolean;username:string;x:number;y:number;interior?:number;title?:string;hp:number;maxHp:number;lastAttack:number};
export type ChatMessage={id:string;username:string;message:string;created_at:number};
export type Snapshot={type:'snapshot';tick:number;time:number;ack:number;reset?:boolean;online:number;character:{adminSkin?:boolean;username:string;state:GameState;revision:number};players:Peer[];hits:NonNullable<GameState['hits']>};
export type ServerMessage=Snapshot|{type:'error';error:string;fatal?:boolean}|{type:'chat';messages:ChatMessage[]};
