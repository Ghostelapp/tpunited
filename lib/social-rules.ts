export type QuestRule={verification:string;target:string;role_id:string;threshold:number};
export function internalProgress(rule:QuestRule,state:{xp?:number;kills?:number;quest?:string;dungeon?:{cleared?:boolean}}|null,tutorial:boolean){
 if(rule.verification==='tutorial')return {current:tutorial?1:0,required:1,complete:tutorial};
 if(rule.verification==='game_level'){const level=state?1+Math.floor(Math.max(0,Number(state.xp)||0)/100):0;return {current:Math.min(level,rule.threshold),required:rule.threshold,complete:level>=rule.threshold};}
 if(rule.verification==='game_kills'){const current=Math.max(0,Number(state?.kills)||0);return {current:Math.min(current,rule.threshold),required:rule.threshold,complete:current>=rule.threshold};}
 if(rule.verification==='dungeon_clear'||rule.verification==='quest_complete'){const complete=rule.verification==='dungeon_clear'?state?.dungeon?.cleared===true:state?.quest==='complete';return {current:complete?1:0,required:1,complete};}
 return null;
}
export function discordMemberMatches(rule:QuestRule,member:{pending?:boolean;roles?:string[]}){return member.pending!==true&&(rule.verification==='discord_member'||rule.verification==='discord_role'&&Array.isArray(member.roles)&&member.roles.includes(rule.role_id));}
