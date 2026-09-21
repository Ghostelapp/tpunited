import {db,runtimeEnv,HttpError} from './server';
import {approveQuest,verifyInternal,type Quest} from './social-quests';
import {discordMemberMatches} from './social-rules';
import {WEB3_METHODS,web3Progress,type Web3Quest} from './quest-web3';
export type AutomaticQuest=Quest&Web3Quest;
export async function verifyAutomatic(user:string,c:AutomaticQuest){
 const now=Date.now();
 const approved=await db().prepare("SELECT id FROM submissions WHERE user_id=? AND campaign_id=? AND status='approved'").bind(user,c.id).first();
 if(approved)return {verified:true,message:'Already completed. Points were awarded once.'};
 // Reserve a short lease before external calls to bound concurrent requests.
 const lease=await db().prepare("INSERT INTO quest_checks(user_id,campaign_id,checked_at,status,message) VALUES(?,?,?,'checking','Verification in progress.') ON CONFLICT(user_id,campaign_id) DO UPDATE SET checked_at=excluded.checked_at,status='checking',message=excluded.message WHERE quest_checks.checked_at<=?").bind(user,c.id,now,now-60000).run();
 if(!lease.meta.changes){const recent=await db().prepare('SELECT status,message,progress FROM quest_checks WHERE user_id=? AND campaign_id=?').bind(user,c.id).first<{status:string;message:string;progress:string|null}>();return {verified:recent?.status==='verified',message:recent?.message??'Retry in one minute.',progress:recent?.progress?JSON.parse(recent.progress):undefined,cached:true};}
 try{
  let result:{verified:boolean;message:string;progress?:unknown};
  if(WEB3_METHODS.includes(c.verification)){
   const progress=await web3Progress(user,c);if(progress.complete)await approveQuest(user,c,JSON.stringify({method:c.verification,...progress}));
   result={verified:progress.complete,progress,message:progress.complete?'Verified on-chain. Points awarded.':('message' in progress&&progress.message)||'Required finalized balance has not been reached yet.'};
  }else if(c.verification.startsWith('discord_')){
   const account=await db().prepare("SELECT external_id FROM social_accounts WHERE user_id=? AND provider='discord'").bind(user).first<{external_id:string}>();
   if(!account)throw new HttpError('Connect Discord once using the quest button.',409);
   const token=runtimeEnv().DISCORD_BOT_TOKEN;if(!token)throw new HttpError('Use Connect & verify Discord; automatic rechecks await bot setup.',409);
   const r=await fetch(`https://discord.com/api/v10/guilds/${c.target}/members/${account.external_id}`,{headers:{Authorization:'Bot '+token},signal:AbortSignal.timeout(8000)});
   if(r.status!==404&&!r.ok)throw new HttpError(r.status===429?'Discord rate limit. Retrying later.':'Discord integration is unavailable. Retry later.',503);
   const member=r.status===404?null:await r.json() as {pending?:boolean;roles?:string[]};const complete=!!member&&discordMemberMatches(c,member);
   if(complete)await approveQuest(user,c,JSON.stringify({method:c.verification,discord:account.external_id,guild:c.target,role:c.role_id}));
   result={verified:complete,message:complete?'Discord requirement verified. Points awarded.':'Join the server, complete screening and obtain the required role.'};
  }else result=await verifyInternal(user,c);
  await db().prepare('UPDATE quest_checks SET status=?,message=?,progress=? WHERE user_id=? AND campaign_id=? AND checked_at=?').bind(result.verified?'verified':'incomplete',result.message,JSON.stringify(result.progress??null),user,c.id,now).run();return result;
 }catch(e){const message=e instanceof HttpError?e.message:'Verification provider is unavailable. No points awarded; retry later.';await db().prepare("UPDATE quest_checks SET status='error',message=?,progress=NULL WHERE user_id=? AND campaign_id=? AND checked_at=?").bind(message,user,c.id,now).run();return {verified:false,message,status:'error'};}
}
export async function verifyQuestBatch(user:string){
 const now=Date.now();const candidates=await db().prepare("SELECT c.* FROM campaigns c LEFT JOIN quest_checks q ON q.campaign_id=c.id AND q.user_id=? WHERE c.kind='social' AND c.verification<>'manual' AND c.status='active' AND c.starts_at<=? AND c.ends_at>? AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.campaign_id=c.id AND s.user_id=? AND s.status='approved') AND (q.checked_at IS NULL OR q.checked_at<=?) ORDER BY COALESCE(q.checked_at,0),c.created_at,c.id LIMIT 4").bind(user,now,now,user,now-60000).all<AutomaticQuest>();
 // Parallel bounded batch: one unavailable integration does not block other quests.
 const results=await Promise.all(candidates.results.map(async c=>({id:c.id,...await verifyAutomatic(user,c)})));
 return {results,checked:results.length,verified:results.filter(r=>r.verified).length,retryAfter:60};
}

// Cloudflare scheduled worker: rewards also progress with the board closed.
// Oldest unchecked pairs go first; completed quests never enter the queue again.
export async function runScheduledQuests(){
 const now=Date.now();
 const pending=await db().prepare("SELECT c.*,r.user_id FROM registrations r JOIN campaigns c ON c.kind='social' AND c.verification<>'manual' AND c.status='active' AND c.starts_at<=? AND c.ends_at>? LEFT JOIN quest_checks q ON q.user_id=r.user_id AND q.campaign_id=c.id WHERE r.status='active' AND (c.verification NOT LIKE 'discord_%' OR ?=1) AND (q.checked_at IS NULL OR q.checked_at<=?) AND NOT EXISTS(SELECT 1 FROM submissions s WHERE s.user_id=r.user_id AND s.campaign_id=c.id AND s.status='approved') ORDER BY COALESCE(q.checked_at,0),r.created_at,c.id,r.user_id LIMIT 20").bind(now,now,runtimeEnv().DISCORD_BOT_TOKEN?1:0,now-60000).all<AutomaticQuest&{user_id:string}>();
 for(let offset=0;offset<pending.results.length;offset+=4){const results=await Promise.allSettled(pending.results.slice(offset,offset+4).map(c=>verifyAutomatic(c.user_id,c)));for(const r of results)if(r.status==='rejected')console.error('Scheduled quest check failed; it will retry.');}
 return {checked:pending.results.length};
}
