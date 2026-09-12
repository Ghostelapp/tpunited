import {z} from 'zod';
import {identity,sameOrigin,readJson,db,json,fail,HttpError} from '@/lib/server';
import {parcelId,socialAccess} from '@/lib/parcel-social';
import {PARCEL_TILE} from '@/packages/game-core/parcel-scenery';
export async function POST(req:Request){try{
 sameOrigin(req);const user=await identity(req);
 const b=z.object({parcel:parcelId,x:z.number().finite().min(0),y:z.number().finite().min(0)}).strict().parse(await readJson(req));
 const a=await socialAccess(user,b.parcel);
 if(b.x>a.parcel.width*PARCEL_TILE||b.y>a.parcel.height*PARCEL_TILE)throw new HttpError('Position outside this parcel.');
 const now=Date.now();
 const written=await db().prepare('INSERT INTO parcel_presence(user_id,parcel,version,x,y,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET parcel=excluded.parcel,version=excluded.version,x=excluded.x,y=excluded.y,updated_at=excluded.updated_at WHERE parcel_presence.updated_at<=?').bind(user,b.parcel,a.version,Math.round(b.x),Math.round(b.y),now,now-700).run();
 if(!written.meta.changes)throw new HttpError('Please wait before refreshing presence.',429);
 // Read current privacy on every request; revoked guests disappear immediately from new snapshots.
 const rows=await db().prepare("SELECT r.username,p.x,p.y FROM parcel_presence p JOIN registrations r ON r.user_id=p.user_id JOIN account_wallets w ON w.user_id=p.user_id WHERE p.parcel=? AND p.version=? AND p.updated_at>? AND p.user_id<>? AND r.status='active' AND (?='public' OR lower(w.address)=? OR (?='invited' AND EXISTS(SELECT 1 FROM json_each(?) WHERE value=p.user_id))) ORDER BY p.updated_at DESC LIMIT 30").bind(b.parcel,a.version,now-10000,user,a.home.visibility,a.home.owner.toLowerCase(),a.home.visibility,a.home.guests).all();
 return json({players:rows.results});
}catch(e){return fail(e)}}
