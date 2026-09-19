import {adminIdentity} from '@/lib/admin';
import {db,json,fail,HttpError} from '@/lib/server';
import {DAY,type AnalyticsReport,type AnalyticsBreakdown} from '@/lib/analytics';
export async function GET(req:Request){try{
 await adminIdentity(req);
 const now=Date.now(),q=new URL(req.url).searchParams;
 const to=q.get('to')??new Date(now).toISOString().slice(0,10),from=q.get('from')??new Date(now-6*DAY).toISOString().slice(0,10);
 const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
 if(!valid(from)||!valid(to))throw new HttpError('Use valid YYYY-MM-DD dates.');
 const start=Date.parse(from),end=Date.parse(to)+DAY;
 if(start>=end||end-start>90*DAY||start<Math.floor(now/DAY)*DAY-89*DAY||Date.parse(to)>now)throw new HttpError('Choose up to 90 days within the last 90 days.');
 const database=db();
 await database.prepare('DELETE FROM analytics_views WHERE started_at<?').bind(now-90*DAY).run();
 const where='started_at>=? AND started_at<?';
 const summary=await database.prepare(`SELECT COUNT(*) views,COUNT(DISTINCT visitor) visitors,COUNT(DISTINCT session) sessions,COALESCE(SUM(active_seconds),0) activeSeconds,COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN visitor END) authenticated,COUNT(DISTINCT CASE WHEN path='/game' THEN visitor END) gameVisitors FROM analytics_views WHERE ${where}`).bind(start,end).first<Omit<AnalyticsReport['summary'],'singlePageSessions'>>();
 const single=await database.prepare(`SELECT COUNT(*) count FROM (SELECT session FROM analytics_views WHERE ${where} GROUP BY session HAVING COUNT(*)=1)`).bind(start,end).first<{count:number}>();
 const online=await database.prepare('SELECT COUNT(DISTINCT visitor) count FROM analytics_views WHERE last_seen>?').bind(now-60000).first<{count:number}>();
 const daily=await database.prepare(`SELECT strftime('%Y-%m-%d',started_at/1000,'unixepoch') day,COUNT(*) views,COUNT(DISTINCT visitor) visitors FROM analytics_views WHERE ${where} GROUP BY day ORDER BY day`).bind(start,end).all<AnalyticsReport['daily'][number]>();
 const breakdowns:Record<string,AnalyticsBreakdown[]>={};
 // Identifiers are fixed here, never read from request parameters.
 await Promise.all(['path','host','referrer','source','medium','campaign','country','device','browser','os'].map(async column=>{
  const rows=await database.prepare(`SELECT COALESCE(NULLIF(${column},''),'(not set)') label,COUNT(*) views,COUNT(DISTINCT visitor) visitors FROM analytics_views WHERE ${where} GROUP BY label ORDER BY views DESC,label LIMIT 20`).bind(start,end).all<AnalyticsBreakdown>();breakdowns[column]=rows.results;
 }));
 const recent=await database.prepare(`SELECT a.id,substr(a.visitor,1,8) visitor,r.username,a.host,a.path,a.country,a.device,a.browser,a.referrer,a.started_at,a.last_seen,a.active_seconds FROM analytics_views a LEFT JOIN registrations r ON r.user_id=a.user_id WHERE a.started_at>=? AND a.started_at<? ORDER BY a.started_at DESC LIMIT 100`).bind(start,end).all<AnalyticsReport['recent'][number]>();
 await database.prepare('DELETE FROM analytics_counts WHERE day<?').bind(new Date(now-89*DAY).toISOString().slice(0,10)).run();
 const total=await database.prepare('SELECT COALESCE(SUM(views),0) views FROM analytics_counts WHERE day>=? AND day<=?').bind(from,to).first<{views:number}>();
 const countDays=await database.prepare('SELECT day,SUM(views) views FROM analytics_counts WHERE day>=? AND day<=? GROUP BY day ORDER BY day').bind(from,to).all<{day:string;views:number}>();
 const pages=await database.prepare('SELECT host,path,SUM(views) views FROM analytics_counts WHERE day>=? AND day<=? GROUP BY host,path ORDER BY views DESC LIMIT 50').bind(from,to).all<{host:string;path:string;views:number}>();
 return json({traffic:{views:total?.views??0,daily:countDays.results,pages:pages.results},from,to,generatedAt:now,summary:{...summary!,singlePageSessions:single?.count??0},online:online?.count??0,daily:daily.results,breakdowns,recent:recent.results} satisfies AnalyticsReport);
}catch(e){return fail(e)}}
