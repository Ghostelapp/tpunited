import {z} from 'zod';
import {identity,sameOrigin,readJson,db,json,fail,HttpError} from '@/lib/server';
import {parcelId,socialAccess,requirePresence,recentMessages} from '@/lib/parcel-social';
export async function GET(req:Request){try{const user=await identity(req),id=parcelId.parse(Number(new URL(req.url).searchParams.get('parcel'))),a=await socialAccess(user,id);await requirePresence(user,id,a.version);return json({messages:await recentMessages(id,a.version)})}catch(e){return fail(e)}}
export async function POST(req:Request){try{
 sameOrigin(req);const user=await identity(req),b=z.object({parcel:parcelId,message:z.string().trim().min(1).max(400)}).strict().parse(await readJson(req));
 const a=await socialAccess(user,b.parcel);await requirePresence(user,b.parcel,a.version);const now=Date.now();
 const r=await db().prepare('INSERT INTO parcel_messages(id,user_id,parcel,version,message,created_at) SELECT ?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM parcel_messages WHERE user_id=? AND created_at>?)').bind(crypto.randomUUID(),user,b.parcel,a.version,b.message,now,user,now-3000).run();
 if(!r.meta.changes)throw new HttpError('Please wait 3 seconds before posting again.',429);
 await db().prepare('DELETE FROM parcel_messages WHERE parcel=? AND id NOT IN (SELECT id FROM parcel_messages WHERE parcel=? ORDER BY created_at DESC,id DESC LIMIT 200)').bind(b.parcel,b.parcel).run();
 return json({messages:await recentMessages(b.parcel,a.version)});
}catch(e){return fail(e)}}
