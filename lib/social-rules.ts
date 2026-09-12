export type QuestRule={verification:string;target:string;role_id:string;threshold:number};
export function internalProgress(rule:QuestRule,state:{xp?:number}|null,tutorial:boolean){
 if(rule.verification==='tutorial')return {current:tutorial?1:0,required:1,complete:tutorial};
 if(rule.verification==='game_level'){const level=state?1+Math.floor(Math.max(0,Number(state.xp)||0)/100):0;return {current:Math.min(level,rule.threshold),required:rule.threshold,complete:level>=rule.threshold};}
 return null;
}
export function discordMemberMatches(rule:QuestRule,member:{pending?:boolean;roles?:string[]}){return member.pending!==true&&(rule.verification==='discord_member'||rule.verification==='discord_role'&&Array.isArray(member.roles)&&member.roles.includes(rule.role_id));}
