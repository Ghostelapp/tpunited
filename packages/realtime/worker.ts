import {requireUser,session,SESSION_MAX} from '../../lib/auth';
import {db,fail,HttpError,sameOrigin,type PlayerRow} from '../../lib/server';
import {hydrateNfts} from '../../lib/nft';
import {hydrateLegacy} from '../../lib/legacy';
import {award,gameAchievements} from '../../lib/leaderboard';
import {legacyTitle,playerStats,type GameState,type Monster} from '../game-core/world';
import {inputSchema,TICK_MS,MAX_PLAYERS,type Input,type Snapshot,type ServerMessage} from './protocol';
import {initialMonsters,stepWorld} from './world';

type Connection={socket:WebSocket;id:string;username:string;hash:string;ack:number;pending?:Input;seen:number;messages:number;window:number};
type WorldRow={monsters:string;revision:number;updated_at:number};
type CachedGear={key:string;at:number;gear:GameState['nftGear'];equipment:GameState['equipment']};

export default {
 async fetch(req:Request,env:Cloudflare.Env){
  try{
   sameOrigin(req);
   const path=new URL(req.url).pathname;
   if(!['/api/game/socket','/api/community'].includes(path)||req.method!=='GET')throw new HttpError('Not found.',404);
   if(path==='/api/game/socket'&&req.headers.get('Upgrade')?.toLowerCase()!=='websocket')throw new HttpError('WebSocket required.',426);
   await requireUser(req);
   return await env.WORLD.get(env.WORLD.idFromName('trash-town-v1')).fetch(req);
  }catch(e){return fail(e)}
 },
};

export class SharedWorld {
 private connections=new Map<string,Connection>();
 private timer:ReturnType<typeof setInterval>|undefined;
 private queue:Promise<unknown>=Promise.resolve();
 private ticking=false;
 private tickNumber=0;
 private failures=0;
 private gear=new Map<string,CachedGear>();
 private verifying=new Set<string>();
 constructor(private ctx:DurableObjectState){}

 private serial<T>(operation:()=>Promise<T>):Promise<T>{
  const next=this.queue.then(operation);this.queue=next.catch(()=>{});return next;
 }
 private send(c:Connection,message:ServerMessage){
  try{c.socket.send(JSON.stringify(message));}catch{this.remove(c);}
 }
 private remove(c:Connection){
  if(this.connections.get(c.id)!==c)return;
  this.connections.delete(c.id);this.gear.delete(c.id);
  if(!this.connections.size&&this.timer){clearInterval(this.timer);this.timer=undefined;}
 }
 private close(c:Connection,code:number,reason:string){
  this.remove(c);try{c.socket.close(code,reason);}catch{}
 }
 async fetch(req:Request){return this.serial(async()=>{
  try{
   sameOrigin(req);const user=await requireUser(req),proof=await session(req);
   if(!proof?.user_id)throw new HttpError('Sign in again.',401);
   if(new URL(req.url).pathname==='/api/community'){
    const rows=await db().prepare('SELECT id,username,message,created_at FROM chat ORDER BY created_at DESC LIMIT 50').all<import('./protocol').ChatMessage>();
    const messages=rows.results.reverse();
    for(const c of this.connections.values())this.send(c,{type:'chat',messages});
    return Response.json({ok:true});
   }
   if(this.connections.size>=MAX_PLAYERS&&!this.connections.has(user.id))throw new HttpError('Town is full. Try again shortly.',503);
   const player=await db().prepare('SELECT user_id FROM players WHERE user_id=?').bind(user.id).first();
   if(!player)throw new HttpError('Create a character first.',409);
   await db().prepare("INSERT OR IGNORE INTO realtime_world(id,monsters,revision,updated_at) VALUES('town',?,0,?)").bind(JSON.stringify(initialMonsters()),Date.now()).run();
   const old=this.connections.get(user.id);if(old)this.close(old,4009,'This account connected in another tab.');
   const pair=new WebSocketPair(),socket=pair[1];socket.accept();
   const c:Connection={socket,id:user.id,username:user.username,hash:proof.hash,ack:0,seen:Date.now(),messages:0,window:Date.now()};
   this.connections.set(c.id,c);
   socket.addEventListener('message',event=>this.message(c,event.data));
   socket.addEventListener('close',()=>this.remove(c));socket.addEventListener('error',()=>this.remove(c));
   if(!this.timer)this.timer=setInterval(()=>{
    if(this.ticking)return;this.ticking=true;
    this.ctx.waitUntil(this.serial(()=>this.tick()).finally(()=>{this.ticking=false}));
   },TICK_MS);
   return new Response(null,{status:101,webSocket:pair[0]});
  }catch(e){return fail(e)}
 });}

 private message(c:Connection,data:string|ArrayBuffer){
  if(this.connections.get(c.id)!==c)return;
  const now=Date.now();
  if(now-c.window>=1000){c.window=now;c.messages=0;}
  if(++c.messages>30||typeof data!=='string'||data.length>8192){this.close(c,1008,'Message limit exceeded.');return;}
  c.seen=now;
  try{
   const raw=JSON.parse(data);
   if(raw.type==='ping')return;
   const input=inputSchema.parse(raw);
   if(input.seq<=c.ack)return;
   if(c.pending||input.seq!==c.ack+1)throw new Error('Wait for the previous input acknowledgement.');
   c.pending=input;
  }catch{this.close(c,1008,'Invalid multiplayer input.');}
 }

 private equipment(id:string,state:GameState,target?:string){
  const hasNft=[...Object.values(state.equipment??{}),target].some(v=>v?.startsWith('nft-'));
  if(!hasNft){state.nftGear=[];return {state,ready:true};}
  const key=JSON.stringify([state.equipment,target?.startsWith('nft-')?target:null]);
  const cached=this.gear.get(id),now=Date.now();
  if(cached&&cached.key===key&&now-cached.at<5000){state.nftGear=structuredClone(cached.gear);state.equipment=structuredClone(cached.equipment);return {state,ready:true};}
  // RPC work never blocks the simulation or another player's inputs. Bonuses
  // fail closed while ownership is unverified; equip waits for that proof.
  state.nftGear=[];
  if(!this.verifying.has(id)){
   this.verifying.add(id);
   let timeout:ReturnType<typeof setTimeout>|undefined;
   const task=Promise.race([hydrateNfts(id,structuredClone(state),target),new Promise<never>((_,reject)=>{timeout=setTimeout(()=>reject(Error('NFT verification timeout')),3000)})])
    .then(verified=>{if(this.connections.has(id))this.gear.set(id,{key,at:Date.now(),gear:structuredClone(verified.nftGear),equipment:structuredClone(verified.equipment)});})
    .catch(()=>{const c=this.connections.get(id);if(c?.pending?.action.type==='equip'){this.send(c,{type:'error',error:'NFT ownership could not be verified. Reconnect and try again.'});this.close(c,1011,'NFT verification unavailable.');}})
    .finally(()=>{clearTimeout(timeout);this.verifying.delete(id);});
   this.ctx.waitUntil(task);
  }
  return {state,ready:false};
 }

 private async tick(){
  if(!this.connections.size)return;
  try{
   const now=Date.now();
   for(const c of this.connections.values())if(now-c.seen>45000)this.close(c,4000,'Connection timed out.');
   const connections=[...this.connections.values()];if(!connections.length)return;
   const settings=await db().prepare("SELECT value FROM site_content WHERE key='game'").first<{value:string}>();
   if(settings&&JSON.parse(settings.value).maintenance){for(const c of connections)this.close(c,1013,'Maintenance in progress.');return;}
   const rows=await db().prepare(`SELECT p.*,s.hash,r.role FROM players p JOIN registrations r ON r.user_id=p.user_id JOIN auth_sessions s ON s.user_id=p.user_id WHERE s.hash IN (${connections.map(()=>'?').join(',')}) AND s.expires_at>? AND s.created_at>? AND r.status='active'`).bind(...connections.map(c=>c.hash),now,now-SESSION_MAX).all<PlayerRow&{hash:string;role:string}>();
   const active=connections.filter(c=>{if(rows.results.some(p=>p.user_id===c.id&&p.hash===c.hash))return true;this.close(c,4001,'Session expired. Sign in again.');return false;});
   if(!active.length)return;
   const world=await db().prepare("SELECT monsters,revision,updated_at FROM realtime_world WHERE id='town'").first<WorldRow>();
   if(!world)throw Error('Shared world missing.');
   const inputs=new Map(active.map(c=>[c.id,c.pending]));
   const before=new Map<string,GameState>();
   for(const c of active){
    const row=rows.results.find(p=>p.user_id===c.id)!;
    const equipment=this.equipment(c.id,JSON.parse(row.state),inputs.get(c.id)?.action.target);
    let state=equipment.state;
    if(!equipment.ready&&inputs.get(c.id)?.action.type==='equip'&&inputs.get(c.id)?.action.target?.startsWith('nft-'))inputs.set(c.id,undefined);
    if(!c.ack||inputs.get(c.id)?.action.type.startsWith('legacy'))state=await hydrateLegacy(c.id,state);
    before.set(c.id,state);
   }
   const elapsed=Math.min(250,Math.max(0,now-world.updated_at));
   const result=stepWorld(JSON.parse(world.monsters) as Monster[],active.map(c=>({id:c.id,state:before.get(c.id)!,input:inputs.get(c.id)})),elapsed,now,this.tickNumber);
   const statements:D1PreparedStatement[]=[db().prepare("INSERT OR REPLACE INTO realtime_commit_guard(id,ok) VALUES(1,(SELECT COUNT(*) FROM realtime_world WHERE id='town' AND revision=?))").bind(world.revision)];
   // Check ALL versions before ANY write. D1 rolls back the batch on CHECK failure.
   for(const c of active){const row=rows.results.find(p=>p.user_id===c.id)!;
    statements.push(db().prepare("INSERT OR REPLACE INTO realtime_commit_guard(id,ok) VALUES(1,(SELECT COUNT(*) FROM players p JOIN auth_sessions s ON s.user_id=p.user_id JOIN registrations r ON r.user_id=p.user_id WHERE p.user_id=? AND p.revision=? AND s.hash=? AND s.expires_at>? AND s.created_at>? AND r.status='active'))").bind(c.id,row.revision,c.hash,now,now-SESSION_MAX));
   }
   statements.push(db().prepare("UPDATE realtime_world SET monsters=?,revision=revision+1,updated_at=? WHERE id='town'").bind(JSON.stringify(result.monsters),now));
   for(const c of active){
    const state=result.players.get(c.id)!,previous=before.get(c.id)!;
    statements.push(db().prepare('UPDATE players SET state=?,revision=revision+1,updated_at=? WHERE user_id=?').bind(JSON.stringify(state),now,c.id));
    const change=state.scrap-previous.scrap;
    if(change)statements.push(db().prepare('INSERT INTO economy(id,user_id,kind,amount,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),c.id,'realtime',change,now));
    for(const event of gameAchievements(previous,state,now))statements.push(award(c.id,event.category,event.source,now));
   }
   await db().batch(statements);
   this.failures=0;this.tickNumber++;
   const peers=active.map(c=>{const s=result.players.get(c.id)!;return {adminSkin:rows.results.find(p=>p.user_id===c.id)?.role==='ADMIN',username:c.username,x:s.x,y:s.y,interior:s.interior,title:legacyTitle(s),hp:s.hp,maxHp:playerStats(s).hp,lastAttack:s.lastAttack};});
   for(const c of active){
    const input=inputs.get(c.id),previous=before.get(c.id)!,state=result.players.get(c.id)!;
    const reset=!!input&&input.scene!==(previous.interior??-1)||state.interior!==previous.interior||state.events.some(e=>e.startsWith('Rescued'));
    if(input){c.ack=input.seq;if(c.pending===input)c.pending=undefined;}
    const wire=structuredClone(state);
    for(const m of [...wire.monsters,...wire.dungeon?.monsters??[]]){delete m.navPath;delete m.navGoal;delete m.navAt;}
    const hits=state.interior===undefined?active.flatMap(p=>result.players.get(p.id)!.interior===undefined?result.players.get(p.id)!.hits??[]:[]):state.hits??[];
    const snapshot:Snapshot={type:'snapshot',tick:this.tickNumber,time:now,ack:c.ack,reset,online:active.length,character:{adminSkin:rows.results.find(p=>p.user_id===c.id)?.role==='ADMIN',username:c.username,state:wire,revision:rows.results.find(p=>p.user_id===c.id)!.revision+1},players:peers.filter(p=>p.username!==c.username&&state.interior!==11&&p.interior===state.interior),hits};
    this.send(c,snapshot);
   }
  }catch(e){
   // A conflicting HTTP purchase/reward rolls back the whole tick; reload next tick.
   if(String(e).includes('CHECK constraint failed'))return;
   console.error('Multiplayer tick failed',e instanceof Error?e.message:'unknown');
   for(const c of this.connections.values())this.send(c,{type:'error',error:'World synchronization interrupted. Reconnecting safely.'});
   if(++this.failures>=3)for(const c of [...this.connections.values()])this.close(c,1011,'Progress service unavailable.');
  }
 }
}
