import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,moduleAt,reset,sqlite,env,chain,request} from './api-harness.mjs';
const A='0x'+'1'.repeat(40),B='0x'+'2'.repeat(40),LAND='0x'+'3'.repeat(40);let alice,bob,owner,version;
beforeEach(()=>{reset();alice=fixture('alice',A);bob=fixture('bob',B);owner=A;version=1;env.LAND_CONTRACT=LAND;chain.read=({functionName})=>functionName==='ownerOf'?owner:functionName==='transferVersion'?BigInt(version):null});
async function call(path,body,who=alice){const r=await moduleAt('app/api/'+path.split('?')[0]+'/route.ts')[body===undefined?'GET':'POST'](request('/api/'+path,body,who.cookie));return {status:r.status,body:await r.json()}}
const visit=(who=alice,parcel=1,x=100)=>call('parcel/presence',{parcel,x,y:100},who);
const privacy=(visibility,guests=[])=>call('homestead',{action:'privacy',parcel:1,visibility,guests});
function age(){sqlite.prepare('UPDATE parcel_presence SET updated_at=updated_at-1000').run()}
test('private access, invitation and revocation apply to presence and chat',async()=>{
 assert.equal((await visit(bob)).status,403);await privacy('invited',['bob']);assert.equal((await visit()).status,200);assert.equal((await visit(bob)).status,200);age();
 const visible=await visit();assert.equal(visible.body.players.length,1);assert.equal(visible.body.players[0].username,'bob');assert.deepEqual(Object.keys(visible.body.players[0]).sort(),['username','x','y']);
 assert.equal((await call('parcel/chat',{parcel:1,message:'Hello'},bob)).status,200);
 await privacy('private');assert.equal((await visit(bob)).status,403);assert.equal((await call('parcel/chat?parcel=1',undefined,bob)).status,403);age();assert.equal((await visit()).body.players.length,0);
});
test('parcel channels isolate history, expire presence, and reject posting without a visit',async()=>{
 await privacy('public');assert.equal((await call('parcel/chat',{parcel:1,message:'Remote'},bob)).status,403);
 await visit(bob);await call('parcel/chat',{parcel:1,message:'Parcel one'},bob);
 await visit();assert.equal((await call('parcel/chat?parcel=1')).body.messages.length,1);
 age();await visit(alice,2);assert.equal((await call('parcel/chat?parcel=2')).body.messages.length,0);assert.equal((await call('parcel/chat?parcel=1')).status,403);
 sqlite.prepare('UPDATE parcel_presence SET updated_at=0').run();assert.equal((await call('parcel/chat?parcel=1',undefined,bob)).status,403);
});
test('land transfer hides previous ownership-era messages and presence',async()=>{
 await privacy('public');await visit();await call('parcel/chat',{parcel:1,message:'Old owner history'});owner=B;version++;assert.equal((await visit()).status,403);await visit(bob);
 assert.equal((await call('parcel/chat?parcel=1',undefined,bob)).body.messages.length,0);assert.equal((await visit(alice)).status,403);
});
test('bounds, identity spoofing, message length and spam are rejected without changing player economy',async()=>{
 assert.equal((await visit(alice,1,1e9)).status,400);assert.equal((await call('parcel/presence',{parcel:1,x:100,y:100,username:'bob'})).status,400);
 await visit();assert.equal((await visit()).status,429);
 assert.equal((await call('parcel/chat',{parcel:1,message:'x'.repeat(401)})).status,400);assert.equal((await call('parcel/chat',{parcel:1,message:'Valid'})).status,200);assert.equal((await call('parcel/chat',{parcel:1,message:'Spam'})).status,429);
 assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM economy').get().n,0);
});
test('banned visitors are filtered and cannot continue reading',async()=>{
 await privacy('public');await visit(bob);sqlite.prepare("UPDATE registrations SET status='banned' WHERE user_id='bob'").run();assert.equal((await visit()).body.players.length,0);assert.equal((await call('parcel/chat?parcel=1',undefined,bob)).status,403);
});
