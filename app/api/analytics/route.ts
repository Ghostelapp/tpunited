import {currentUser} from '@/lib/auth';
import {db,readJson,sameOrigin,json,fail,HttpError} from '@/lib/server';
import {analyticsEvent,analyticsPath,attribution,campaignLabel,userAgentInfo,DAY} from '@/lib/analytics';
export async function POST(req:Request){try{
 sameOrigin(req);
 const b=analyticsEvent.parse(await readJson(req,4096)),path=analyticsPath(b.path),agent=userAgentInfo(req.headers.get('user-agent')??'');
 if(!path||agent.bot||req.headers.get('dnt')==='1'||req.headers.get('sec-gpc')==='1')return json({ok:true,ignored:true});
 const now=Date.now(),database=db();
 // Ephemeral abuse limit, separate from authentication limits. No raw IP or complete UA is stored.
 const ip=req.headers.get('cf-connecting-ip')??b.visitor;
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${Math.floor(now/DAY)}:${ip}`));
 const key=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const rate=await database.prepare('INSERT INTO analytics_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END,expires_at=CASE WHEN expires_at<=? THEN excluded.expires_at ELSE expires_at END RETURNING count').bind(key,now+60000,now,now).first<{count:number}>();
 if((rate?.count??361)>360)throw new HttpError('Too many analytics events.',429);
 const user=await currentUser(req);
 if(user&&['ADMIN','SUPER_ADMIN'].includes(user.role))return json({ok:true,ignored:true});
 const cf=(req as Request&{cf?:{country?:string}}).cf,country=/^[A-Z]{2}$/.test(cf?.country??'')?cf!.country!:'Unknown';
 const origin=new URL(req.url);
 if(b.kind==='view'){
  await database.prepare('INSERT INTO analytics_views(id,visitor,session,user_id,host,path,referrer,source,medium,campaign,country,device,browser,os,started_at,last_seen,active_seconds) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO NOTHING')
   .bind(b.view,b.visitor,b.session,user?.id??null,origin.hostname,path,attribution(b.referrer,origin.origin),campaignLabel(b.source),campaignLabel(b.medium),campaignLabel(b.campaign),country,agent.device,agent.browser,agent.os,now,now).run();
 }else{
  // Absolute cumulative time makes retries idempotent. Server elapsed time caps forged values.
  await database.prepare('UPDATE analytics_views SET last_seen=?,active_seconds=MAX(active_seconds,MIN(?,CAST((?-started_at)/1000 AS INTEGER))),user_id=? WHERE id=? AND visitor=? AND session=? AND host=? AND path=? AND started_at>?')
   .bind(now,b.activeSeconds,now,user?.id??null,b.view,b.visitor,b.session,origin.hostname,path,now-DAY).run();
 }
 await database.batch([
  database.prepare('DELETE FROM analytics_views WHERE id IN (SELECT id FROM analytics_views WHERE started_at<? LIMIT 100)').bind(now-90*DAY),
  database.prepare('DELETE FROM analytics_limits WHERE key IN (SELECT key FROM analytics_limits WHERE expires_at<? LIMIT 100)').bind(now),
 ]);
 return json({ok:true});
}catch(e){return fail(e)}}
