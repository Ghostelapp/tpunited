import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Miniflare} from 'miniflare';
import {initialState} from '../packages/game-core/world.ts';

test('real Workers WebSockets: shared combat, persistence, chat, sessions and input security',async()=>{
 const realtime={name:'realtime',modules:true,scriptPath:'.realtime-build/worker.js',compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],durableObjects:{WORLD:{className:'SharedWorld',useSQLite:true}},d1Databases:{DB:'realtime-test'},bindings:{BLOCKCHAIN_NETWORK:'base-sepolia'}};
 const full=process.env.REALTIME_FULL_APP==='1';
 const mf=new Miniflare(full?{workers:[{name:'app',modules:['index.js',...fs.readdirSync('dist/server',{recursive:true}).map(String).filter(f=>f.endsWith('.js')&&f!=='index.js')].map(f=>({type:'ESModule' as const,path:path.resolve('dist/server',f)})),modulesRoot:'dist/server',compatibilityDate:'2026-05-22',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'realtime-test'},serviceBindings:{REALTIME:'realtime'},assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true,invoke_user_worker_ahead_of_assets:true}}},realtime]}:realtime);
 const sockets:WebSocket[]=[];
 try{
  const database=await mf.getD1Database('DB',full?'app':undefined);
  for(const file of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort()){
   for(const sql of fs.readFileSync('drizzle/'+file,'utf8').replaceAll('--> statement-breakpoint','').split(';').map(s=>s.trim()).filter(Boolean))await database.prepare(sql).run();
  }
  const hash=(token:string)=>createHash('sha256').update(token).digest('hex');
  const tokens=['a'.repeat(64),'b'.repeat(64)];
  for(let i=0;i<2;i++){
   const id='player'+i,address='0x'+String(i+1).repeat(40),state={...initialState(),x:1890,y:480,quest:'active',motionCredit:0};
   await database.batch([
    database.prepare("INSERT INTO registrations(user_id,username,email,status,role,created_at) VALUES(?,?,'','active','USER',?)").bind(id,id,Date.now()),
    database.prepare('INSERT INTO account_wallets VALUES(?,?,84532,?)').bind(address,id,Date.now()),
    database.prepare('INSERT INTO auth_sessions VALUES(?,?,?,84532,?,?)').bind(hash(tokens[i]),id,address,Date.now()+600000,Date.now()),
    database.prepare('INSERT INTO players VALUES(?,?,?,0,?,?)').bind(id,id,JSON.stringify(state),Date.now(),Date.now()),
   ]);
  }
  const headers=(token?:string)=>({origin:'https://game.test',Upgrade:'websocket',...(token?{cookie:'__Host-tpu_session='+token}:{})});
  assert.equal((await mf.dispatchFetch('https://game.test/api/game/socket',{headers:headers()})).status,401);
  assert.equal((await mf.dispatchFetch('https://game.test/api/game/socket',{headers:{...headers(tokens[0]),origin:'https://evil.test'}})).status,403);
  const open=async(token:string)=>{
   const response=await mf.dispatchFetch('https://game.test/api/game/socket',{headers:headers(token)});
   assert.equal(response.status,101,response.status===101?undefined:await response.text());const socket=response.webSocket!;socket.accept();sockets.push(socket as unknown as WebSocket);
   const messages:Record<string,any>[]=[];
   socket.addEventListener('message',event=>messages.push(JSON.parse(String(event.data))));
   async function wait(predicate:(m:Record<string,any>)=>boolean){
    const until=Date.now()+5000;
    while(Date.now()<until){const found=messages.find(predicate);if(found)return found;await new Promise(r=>setTimeout(r,25));}
    throw Error('Timed out waiting for WebSocket message: '+JSON.stringify(messages.slice(-1)));
   }
   return {socket,messages,wait};
  };
  const a=await open(tokens[0]),b=await open(tokens[1]);
  const first=await a.wait(m=>m.type==='snapshot'&&m.online===2);
  assert.equal(first.players[0].username,'player1');assert.equal(first.players[0].wallet,undefined);
  assert.equal(first.character.adminSkin,false);assert.equal(first.players[0].adminSkin,false);
  await database.prepare("UPDATE registrations SET role='ADMIN' WHERE user_id='player1'").run();
  const promotedA=await a.wait(m=>m.type==='snapshot'&&m.players[0]?.adminSkin===true);
  const promotedB=await b.wait(m=>m.type==='snapshot'&&m.character.adminSkin===true);
  await database.prepare("UPDATE registrations SET role='USER' WHERE user_id='player1'").run();
  await a.wait(m=>m.type==='snapshot'&&m.tick>promotedA.tick&&m.players[0]?.adminSkin===false);
  await b.wait(m=>m.type==='snapshot'&&m.tick>promotedB.tick&&m.character.adminSkin===false);
  const attack={type:'input',seq:1,scene:-1,action:{type:'attack',dx:1,dy:0},motion:[]};
  a.socket.send(JSON.stringify(attack));b.socket.send(JSON.stringify(attack));
  await a.wait(m=>m.ack===1);await b.wait(m=>m.ack===1);
  // A second wave kills the same monster once, regardless of who lands first.
  await new Promise(r=>setTimeout(r,550));
  a.socket.send(JSON.stringify({...attack,seq:2}));b.socket.send(JSON.stringify({...attack,seq:2}));
  const kill=await a.wait(m=>m.type==='snapshot'&&m.character.state.monsters[0].hp<=0);
  const shared=await b.wait(m=>m.type==='snapshot'&&m.tick===kill.tick);
  assert.deepEqual(kill.character.state.monsters,shared.character.state.monsters);
  assert.equal(kill.character.state.kills+shared.character.state.kills,1);
  assert.equal(kill.character.state.circuits+shared.character.state.circuits,1);
  const revision=kill.character.revision;
  a.socket.send(JSON.stringify({...attack,seq:2})); // duplicate is harmless
  const after=await a.wait(m=>m.type==='snapshot'&&m.character.revision>revision);
  assert.equal(after.ack,2);
  a.socket.send(JSON.stringify({...attack,seq:3,action:{type:'tick'},motion:Array.from({length:5},()=>({dx:-1,dy:0,ms:20}))}));
  const moved=await a.wait(m=>m.type==='snapshot'&&m.ack===3);
  const observed=await b.wait(m=>m.type==='snapshot'&&m.tick===moved.tick);
  assert.ok(moved.character.state.x<after.character.state.x);
  assert.equal(observed.players.find((p:Record<string,any>)=>p.username==='player0').x,moved.character.state.x);
  if(full){const legacy=await mf.dispatchFetch('https://game.test/api/game',{method:'POST',headers:{origin:'https://game.test',cookie:'__Host-tpu_session='+tokens[0],'content-type':'application/json'},body:JSON.stringify({type:'attack'})});assert.equal(legacy.status,426);}
  // Concurrent API-style mutation increments the same revision and must survive.
  await database.prepare("UPDATE players SET state=json_set(state,'$.scrap',json_extract(state,'$.scrap')+1000),revision=revision+1 WHERE user_id='player0'").run();
  await a.wait(m=>m.type==='snapshot'&&m.character.state.scrap>=1000);
  const id='chat-test';
  await database.prepare('INSERT INTO chat VALUES(?,?,?,?,?)').bind(id,'player0','player0','Hello real time',Date.now()-4000).run();
  const notify=full?await mf.dispatchFetch('https://game.test/api/community',{method:'POST',headers:{origin:'https://game.test',cookie:'__Host-tpu_session='+tokens[0],'content-type':'application/json'},body:JSON.stringify({message:'Second live message'})}):await mf.dispatchFetch('https://game.test/api/community',{headers:{origin:'https://game.test',cookie:'__Host-tpu_session='+tokens[0]}});
  assert.equal(notify.status,200);await b.wait(m=>m.type==='chat'&&m.messages.some((x:Record<string,string>)=>x.id===id));
  // Logout revokes an already open socket on the next authoritative tick.
  const closed=new Promise<number>(resolve=>b.socket.addEventListener('close',event=>resolve(event.code)));
  await database.prepare('DELETE FROM auth_sessions WHERE hash=?').bind(hash(tokens[1])).run();
  assert.equal(await Promise.race([closed,new Promise(r=>setTimeout(()=>r('timeout'),5000))]),4001);
  a.socket.close(1000,'reconnect test');
  const again=await open(tokens[0]);
  const resumed=await again.wait(m=>m.type==='snapshot');
  assert.equal(resumed.character.state.monsters[0].hp,kill.character.state.monsters[0].hp);
  assert.ok(resumed.character.state.scrap>=1000);assert.equal(resumed.ack,0);
  // A second tab replaces the old connection without losing committed progress.
  const replaced=new Promise<number>(resolve=>again.socket.addEventListener('close',event=>resolve(event.code)));
  const replacement=await open(tokens[0]);
  assert.equal(await Promise.race([replaced,new Promise(r=>setTimeout(()=>r('timeout'),5000))]),4009);
  const replacementState=await replacement.wait(m=>m.type==='snapshot');
  assert.ok(replacementState.character.state.scrap>=1000);
  assert.equal(replacementState.ack,0);
  const invalidClosed=new Promise<number>(resolve=>replacement.socket.addEventListener('close',event=>resolve(event.code)));
  replacement.socket.send(JSON.stringify({...attack,damage:9999}));
  assert.equal(await Promise.race([invalidClosed,new Promise(r=>setTimeout(()=>r('timeout'),5000))]),1008);
 }finally{for(const socket of sockets)try{socket.close()}catch{}await mf.dispose();}
});
