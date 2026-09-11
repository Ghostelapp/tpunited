import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
import {moduleAt,request,env,reset} from './api-harness.mjs';
beforeEach(reset);
const root='https://tpunited.xyz',game='https://game.tpunited.xyz';
function configure(){env.AUTH_ORIGINS=root+','+game;env.AUTH_COOKIE_DOMAIN='tpunited.xyz'}
async function call(path,body,cookie='',origin=root){const res=await moduleAt('app/api/'+path+'/route.ts')[body===undefined?'GET':'POST'](request('/api/'+path,body,cookie,origin));return {status:res.status,body:await res.json(),cookies:res.headers.getSetCookie()}}
test('root game rewrite, landing return and old game links preserve query without open redirects',()=>{
 const {domainRoute}=moduleAt('lib/domain-routing.ts');
 assert.equal(domainRoute(root),null);
 assert.equal(domainRoute(game+'/?parcel=15').url,game+'/game?parcel=15');
 assert.equal(domainRoute(game+'/').kind,'rewrite');
 assert.equal(domainRoute(root+'/game?menu=decorations').url,game+'/?menu=decorations');
 assert.equal(domainRoute(game+'/home').url,root+'/');
 assert.equal(domainRoute('http://localhost:3000/home').url,'http://localhost:3000/');
 assert.equal(domainRoute('https://tpunited.xyz.evil.test/game'),null);
 assert.equal(domainRoute(game+'/api/auth/me'),null);
});
test('one signed wallet session works on both domains; logout revokes it on both',async()=>{
 configure();const account=privateKeyToAccount(generatePrivateKey());
 const nonce=await call('auth/nonce',{address:account.address,chainId:84532});assert.equal(nonce.status,200);
 const challenge=nonce.cookies[0];assert.match(challenge,/^__Host-tpu_challenge=/);assert.ok(!challenge.includes('Domain='));
 const signature=await account.signMessage({message:nonce.body.message});
 const verified=await call('auth/wallet',{id:nonce.body.id,address:account.address,signature},challenge.split(';')[0]);assert.equal(verified.status,200,JSON.stringify(verified.body));
 const session=verified.cookies.find(c=>c.startsWith('__Secure-tpu_session='));assert.ok(session);assert.match(session,/Domain=tpunited.xyz/);assert.match(session,/HttpOnly/);assert.match(session,/; Secure/);
 const cookie=session.split(';')[0];const registered=await call('auth/register',{username:'domainplayer',consent:true},cookie);assert.equal(registered.status,200);
 const user=await call('auth/me',undefined,cookie,game);assert.equal(user.status,200);assert.equal(user.body.user.id,registered.body.user.id);
 const loggedOut=await call('auth/logout',{},cookie,game);assert.equal(loggedOut.status,200);assert.ok(loggedOut.cookies.some(c=>c.startsWith('__Secure-tpu_session=')&&c.includes('Max-Age=0')&&c.includes('Domain=tpunited.xyz')));
 assert.equal((await call('auth/me',undefined,cookie,root)).body.authenticated,false);
});
test('challenge remains bound to signing host; unauthorized subdomain and cross-origin POST rejected',async()=>{
 configure();const account=privateKeyToAccount(generatePrivateKey());const body={address:account.address,chainId:84532};
 assert.equal((await call('auth/nonce',body,'','https://evil.tpunited.xyz')).status,403);
 const nonce=await call('auth/nonce',body);const signature=await account.signMessage({message:nonce.body.message});
 assert.notEqual((await call('auth/wallet',{id:nonce.body.id,address:account.address,signature},nonce.cookies[0].split(';')[0],game)).status,200);
 const req=new Request(game+'/api/auth/nonce',{method:'POST',headers:{origin:root,'content-type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await moduleAt('app/api/auth/nonce/route.ts').POST(req)).status,403);
});
