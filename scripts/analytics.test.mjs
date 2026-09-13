import test from 'node:test';
import assert from 'node:assert/strict';
import {Browser,fixture,moduleAt,request,reset,sqlite} from './api-harness.mjs';
const analytics=moduleAt('app/api/analytics/route.ts'),report=moduleAt('app/api/admin/analytics/route.ts'),helpers=moduleAt('lib/analytics.ts');
const event=(extra={})=>({consent:true,visitor:crypto.randomUUID(),session:crypto.randomUUID(),view:crypto.randomUUID(),kind:'view',path:'/home',...extra});
const send=(body,headers={},cookie='')=>{const r=request('/api/analytics',body,cookie);for(const [k,v] of Object.entries(headers))r.headers.set(k,v);return analytics.POST(r)};
const admin=()=>fixture('owner','0x'+'1'.repeat(40),'ADMIN');
test.beforeEach(reset);
test('collection is opt-in, same-origin, bounded and rejects forged identity',async()=>{
 assert.equal((await send(event({consent:false}))).status,400);
 assert.equal((await send(event(),{origin:'https://evil.test'})).status,403);
 assert.equal((await send(event({userId:'owner'}))).status,400);
 assert.equal((await send(event({path:'x'.repeat(5000)}))).status,413);
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM analytics_views').get().n,0);
});
test('normalises sensitive paths and referrers; derives device and country on server',async()=>{
 const body=event({path:'/parcel/42?token=secret',referrer:'https://search.test/find?q=secret#private',source:'launch',campaign:'alpha'});
 const r=request('/api/analytics',body);r.headers.set('user-agent','Mozilla/5.0 (iPhone) Mobile Safari/605');r.headers.set('cf-ipcountry','ZZ');r.cf={country:'PL'};
 assert.equal((await analytics.POST(r)).status,200);
 const v=sqlite.prepare('SELECT * FROM analytics_views').get();assert.equal(v.path,'/parcel/:id');assert.equal(v.referrer,'search.test');assert.equal(v.country,'PL');assert.equal(v.device,'Mobile');assert.equal(v.os,'iOS');assert.equal(v.browser,'Safari');assert.equal(v.source,'launch');assert.equal(v.user_id,null);
 assert.equal(helpers.analyticsPath('/api/auth/callback?token=secret'),null);assert.equal(helpers.analyticsPath('/admin/users'),null);assert.equal(helpers.analyticsPath('/wallet/0xsecret'),'/other');assert.equal(helpers.attribution('javascript:alert(1)','https://game.test'),'Direct / internal');
});
test('known bots, privacy signals and admins are excluded',async()=>{
 const owner=admin();for(const headers of [{'user-agent':'Googlebot'},{dnt:'1'},{'sec-gpc':'1'}])assert.equal((await send(event(),headers)).status,200);
 assert.equal((await send(event(),{},owner.cookie)).status,200);assert.equal((await send(event({path:'/admin'}))).status,200);
 assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM analytics_views').get().n,0);
});
test('page IDs deduplicate retries; heartbeat cannot inflate views or elapsed time',async()=>{
 const b=event();await send(b);await send(b);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM analytics_views').get().n,1);
 sqlite.prepare('UPDATE analytics_views SET started_at=? WHERE id=?').run(Date.now()-20000,b.view);
 await send({...b,kind:'heartbeat',activeSeconds:15});await send({...b,kind:'heartbeat',activeSeconds:15});assert.equal(sqlite.prepare('SELECT active_seconds FROM analytics_views').get().active_seconds,15);
 await send({...b,kind:'heartbeat',activeSeconds:86400});assert.ok(sqlite.prepare('SELECT active_seconds FROM analytics_views').get().active_seconds<=21);
 await send({...b,kind:'heartbeat',visitor:crypto.randomUUID(),activeSeconds:0});assert.ok(sqlite.prepare('SELECT active_seconds FROM analytics_views').get().active_seconds>=20);
 await send({...b,view:crypto.randomUUID(),kind:'heartbeat'});assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM analytics_views').get().n,1);
});
test('reports require administrator session, use real account identity and aggregate distinct visitors',async()=>{
 const owner=admin(),user=fixture('scavenger','0x'+'2'.repeat(40));const a=event();await send(a,{},user.cookie);await send({...a,view:crypto.randomUUID(),path:'/game'}, {},user.cookie);await send(event({path:'/register'}));
 assert.equal((await new Browser().call('admin/analytics')).status,401);assert.equal((await user.call('admin/analytics')).status,403);
 const response=await owner.call('admin/analytics');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const d=response.body;
 assert.equal(d.summary.views,3);assert.equal(d.summary.visitors,2);assert.equal(d.summary.sessions,2);assert.equal(d.summary.authenticated,1);assert.equal(d.summary.gameVisitors,1);assert.equal(d.summary.singlePageSessions,1);assert.equal(d.online,2);assert.equal(d.daily[0].views,3);assert.equal(d.recent.filter(v=>v.username==='scavenger').length,2);assert.equal(d.recent.some(v=>v.username===null),true);assert.equal(d.breakdowns.path.find(v=>v.label==='/game').views,1);
});
test('date validation, date filtering and retention',async()=>{
 const owner=admin(),b=event();await send(b);sqlite.prepare('UPDATE analytics_views SET started_at=?,last_seen=?').run(Date.now()-91*86400000,Date.now()-91*86400000);
 const get=url=>report.GET(request(url,undefined,owner.cookie));
 assert.equal((await get('/api/admin/analytics?from=2026-02-31')).status,400);assert.equal((await get('/api/admin/analytics?from=2000-01-01&to=2999-01-01')).status,400);
 const r=await get('/api/admin/analytics');assert.equal(r.status,200);assert.equal((await r.json()).summary.views,0);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM analytics_views').get().n,0);
});
test('collection limits bursts without storing raw network addresses',async()=>{
 const b=event(),headers={'cf-connecting-ip':'192.0.2.12'};await send(b,headers);const key=sqlite.prepare('SELECT key FROM analytics_limits').get().key;assert.match(key,/^[a-f0-9]{64}$/);assert.ok(!key.includes('192.0.2'));
 sqlite.prepare('UPDATE analytics_limits SET count=360').run();assert.equal((await send(event(),headers)).status,429);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM analytics_views').get().n,1);
});
