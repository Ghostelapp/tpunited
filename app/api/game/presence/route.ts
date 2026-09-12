import {LEGACY} from '@/packages/game-core/world';
import {db,identity,json,fail} from '@/lib/server';
// Presence never hydrates NFT ownership or returns another player's inventory.
export async function GET(req:Request){try{
 const id=await identity(req);
 const rows=await db().prepare("SELECT username,json_extract(state,'$.x') AS x,json_extract(state,'$.y') AS y,json_extract(state,'$.interior') AS interior,json_extract(state,'$.legacy.title') AS legacyTitle,json_extract(state,'$.legacy.claimed') AS legacyClaims FROM players WHERE updated_at>? AND user_id<>? ORDER BY updated_at DESC LIMIT 30").bind(Date.now()-30000,id).all<{username:string;x:number;y:number;interior:number|null;legacyTitle:string|null;legacyClaims:string|null}>();
 const buildings=new URL(req.url).searchParams.get('buildings')==='1'?(await db().prepare('SELECT id,parcel,x,y,rotation,type FROM buildings').all()).results:undefined;
 return json({buildings,players:rows.results.map(p=>({username:p.username,x:p.x,y:p.y,interior:p.interior??undefined,title:p.legacyTitle&&JSON.parse(p.legacyClaims??'{}')[p.legacyTitle]!==undefined?LEGACY.find(q=>q.id===p.legacyTitle)?.title:undefined}))});
}catch(e){return fail(e)}}

