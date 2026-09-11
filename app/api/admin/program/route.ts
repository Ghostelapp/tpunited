import {db,json,fail,sameOrigin,readJson,HttpError} from '@/lib/server';
import {adminIdentity,audit} from '@/lib/admin';
import {programRules,programSeasonId,programQuests} from '@/lib/program';
import {z} from 'zod';
export async function GET(req:Request){try{await adminIdentity(req);const interest=await db().prepare('SELECT preference,COUNT(*) AS count FROM founder_interest GROUP BY preference').all();const season=await db().prepare('SELECT id,title,status FROM seasons WHERE id=?').bind(programSeasonId).first();const metrics=await db().prepare("SELECT (SELECT COUNT(*) FROM registrations WHERE status='active') active_accounts,(SELECT COUNT(*) FROM players WHERE json_extract(state,'$.quest')='complete') starter_quest_completed,(SELECT COUNT(*) FROM founder_interest) founder_interests,(SELECT COUNT(*) FROM referrals) attributed_signups,(SELECT COUNT(*) FROM referrals WHERE status='approved') approved_referrals,(SELECT COUNT(*) FROM (SELECT user_id FROM season_events WHERE season_id=? AND points>0 AND category IN ('daily','explore','dungeon') GROUP BY user_id HAVING COUNT(DISTINCT day)>=3)) three_day_players").bind(programSeasonId).first();return json({interest:interest.results,season,metrics})}catch(e){return fail(e)}}
export async function POST(req:Request){try{sameOrigin(req);const actor=await adminIdentity(req);const b=z.object({action:z.enum(['prepare','launch'])}).strict().parse(await readJson(req));const now=Date.now();await db().batch([
 db().prepare("INSERT INTO seasons(id,title,status,rules,starts_at,ends_at,created_at) VALUES(?,?,'draft',?,0,?,?) ON CONFLICT(id) DO NOTHING").bind(programSeasonId,'Season 01 · Founding Scavengers',JSON.stringify(programRules),42*86400000,now),
 ...programQuests.map(q=>db().prepare("INSERT INTO campaigns(id,kind,title,description,url,status,points,min_points,amount_wei,max_recipients,starts_at,ends_at,created_at) VALUES(?,'social',?,?,'','draft',20,0,'0',100,?,?,?) ON CONFLICT(id) DO NOTHING").bind(q.id,q.title,q.description,now,now+42*86400000,now)),audit(actor,'program_prepare',programSeasonId)
]);if(b.action==='launch'){
 const s=await db().prepare('SELECT status,ends_at FROM seasons WHERE id=?').bind(programSeasonId).first<{status:string;ends_at:number}>();
 if(s?.status==='frozen')throw new HttpError('This program season is already frozen.',409);
 if(s?.status==='draft'){
 const active=await db().prepare("SELECT id FROM seasons WHERE active_slot=1 AND status='active'").first();if(active)throw new HttpError('An active season already exists. Freeze it before launching this program.',409);
 try{await db().batch([
 db().prepare("UPDATE seasons SET status='active',active_slot=1,starts_at=?,ends_at=?+ends_at WHERE id=? AND status='draft'").bind(now,now,programSeasonId),
 ...programQuests.map(q=>db().prepare("UPDATE campaigns SET status='active',starts_at=(SELECT starts_at FROM seasons WHERE id=?),ends_at=(SELECT ends_at FROM seasons WHERE id=?) WHERE id=? AND status='draft' AND EXISTS(SELECT 1 FROM seasons WHERE id=? AND status='active')").bind(programSeasonId,programSeasonId,q.id,programSeasonId)),audit(actor,'program_launch',programSeasonId)
 ])}catch(e){if(String(e).includes('UNIQUE'))throw new HttpError('Another season started. Reload the season panel.',409);throw e}
 }
 }return GET(req)}catch(e){return fail(e)}}
