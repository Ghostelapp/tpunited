import {db} from './server';
// Attribution is immutable and can only be inserted by registration.
export function referralAtRegistration(userId:string,code:string,now:number){return db().prepare(`INSERT INTO referrals(user_id,referrer_id,status,note,created_at)
 SELECT ?,c.user_id,'pending','',? FROM referral_codes c JOIN registrations r ON r.user_id=c.user_id AND r.status='active'
 WHERE c.code=? AND c.user_id<>? AND EXISTS(SELECT 1 FROM registrations WHERE user_id=?)
 ON CONFLICT(user_id) DO NOTHING`).bind(userId,now,code,userId,userId)}
export const referralEligibleSQL=`SELECT f.user_id FROM referrals f
 JOIN registrations invited ON invited.user_id=f.user_id AND invited.status='active'
 JOIN registrations inviter ON inviter.user_id=f.referrer_id AND inviter.status='active'
 JOIN players p ON p.user_id=f.user_id
 JOIN account_wallets iw ON iw.user_id=invited.user_id
 JOIN account_wallets rw ON rw.user_id=inviter.user_id AND rw.address<>iw.address
 JOIN seasons s ON s.status='active' AND s.starts_at<=? AND s.ends_at>?
 WHERE f.user_id=? AND f.created_at<=? AND json_extract(p.state,'$.quest')='complete'
 AND json_extract(s.rules,'$.referral.points')>0
 AND (SELECT COUNT(DISTINCT day) FROM season_events e WHERE e.season_id=s.id AND e.user_id=f.user_id AND e.points>0 AND e.category IN ('daily','explore','dungeon'))>=3
 AND NOT EXISTS(SELECT 1 FROM season_exclusions x WHERE x.season_id=s.id AND x.user_id IN(f.user_id,f.referrer_id))
 AND (SELECT COUNT(*) FROM referrals a WHERE a.referrer_id=f.referrer_id AND a.season_id=s.id AND a.status='approved')<5
 AND COALESCE((SELECT SUM(e.points) FROM season_events e WHERE e.season_id=s.id AND e.user_id=f.referrer_id AND e.category='referral' AND e.day=strftime('%Y-%m-%d',?/1000,'unixepoch')),0)<json_extract(s.rules,'$.referral.cap')`;
export function eligibilityArgs(id:string,now:number){return [now,now,id,now-3*86400000,now]}
