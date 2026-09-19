import {z} from 'zod';
import {db,json,fail,readJson,sameOrigin} from '@/lib/server';
import {analyticsPath,userAgentInfo,DAY} from '@/lib/analytics';
const schema=z.object({path:z.string().max(300)}).strict();
export async function POST(req:Request){try{
 sameOrigin(req);
 const {path:raw}=schema.parse(await readJson(req,512)),path=analyticsPath(raw);
 if(!path||req.headers.get('dnt')==='1'||req.headers.get('sec-gpc')==='1'||userAgentInfo(req.headers.get('user-agent')??'').bot)return json({ok:true,ignored:true});
 const day=new Date().toISOString().slice(0,10),host=new URL(req.url).hostname;
 // Only a daily counter is stored: no event record, identity, cookie or network address.
 await db().batch([
  db().prepare('INSERT INTO analytics_counts(day,host,path,views) VALUES(?,?,?,1) ON CONFLICT(day,host,path) DO UPDATE SET views=views+1').bind(day,host,path),
  db().prepare('DELETE FROM analytics_counts WHERE day<?').bind(new Date(Date.now()-89*DAY).toISOString().slice(0,10)),
 ]);
 return json({ok:true});
}catch(e){return fail(e)}}
