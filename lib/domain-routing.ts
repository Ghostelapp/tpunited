export const LANDING_HOST='tpunited.xyz';
export const GAME_HOST='game.tpunited.xyz';
export function domainRoute(raw:string):{kind:'redirect'|'rewrite';url:string}|null{
 const u=new URL(raw),production=u.hostname===LANDING_HOST||u.hostname===GAME_HOST;
 if(u.pathname==='/home'){
  u.pathname='/';if(production){u.protocol='https:';u.host=LANDING_HOST}return {kind:'redirect',url:u.href};
 }
 if(u.hostname===LANDING_HOST&&(u.pathname==='/game'||u.pathname.startsWith('/game/'))){u.protocol='https:';u.host=GAME_HOST;if(u.pathname==='/game')u.pathname='/';return {kind:'redirect',url:u.href}}
 if(u.hostname===GAME_HOST&&u.pathname==='/'){u.pathname='/game';return {kind:'rewrite',url:u.href}}
 return null;
}
