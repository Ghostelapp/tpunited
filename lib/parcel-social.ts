import {z} from 'zod';
import {homeAccess} from './homestead';
import {db,HttpError} from './server';
import {parcels} from '@/packages/game-core/world';
export const parcelId=z.number().int().refine(id=>parcels.some(p=>p.id===id),'Unknown parcel.');
export async function socialAccess(user:string,id:number){
 const access=await homeAccess(user,id);
 return {...access,version:`${access.home.owner}:${access.home.version}`,parcel:parcels.find(p=>p.id===id)!};
}
export async function recentMessages(id:number,version:string){
 const result=await db().prepare("SELECT m.id,r.username,m.message,m.created_at FROM parcel_messages m JOIN registrations r ON r.user_id=m.user_id WHERE m.parcel=? AND m.version=? AND r.status='active' ORDER BY m.created_at DESC,m.id DESC LIMIT 50").bind(id,version).all();return result.results.reverse();
}
export async function requirePresence(user:string,id:number,version:string){
 const p=await db().prepare('SELECT user_id FROM parcel_presence WHERE user_id=? AND parcel=? AND version=? AND updated_at>?').bind(user,id,version,Date.now()-12000).first();if(!p)throw new HttpError('Enter this parcel before joining its chat.',403);
}
