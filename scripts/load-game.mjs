// Authenticated HTTP load test. Run only with dedicated staging test accounts.
// Never commit sessions.json. Format: [{"cookie":"__Host-tpu_session=..."}, ...]
import {readFile} from 'node:fs/promises';
import {setTimeout as sleep} from 'node:timers/promises';
const arg=(key,fallback)=>{const i=process.argv.indexOf('--'+key);return i<0?fallback:process.argv[i+1]};
const origin=new URL(arg('origin','http://127.0.0.1:5173'));
if(!['localhost','127.0.0.1'].includes(origin.hostname)&&!process.argv.includes('--allow-remote'))throw Error('Use an isolated staging environment and pass --allow-remote explicitly.');
const count=Number(arg('players','25')),seconds=Number(arg('seconds','30'));
if(!Number.isInteger(count)||count<1||count>200||!Number.isFinite(seconds)||seconds<1||seconds>3600)throw Error('Use 1–200 players and 1–3600 seconds.');
const sessions=JSON.parse(await readFile(arg('sessions','sessions.json'),'utf8')).slice(0,count);
if(sessions.length!==count||new Set(sessions.map(s=>s.cookie)).size!==count)throw Error('One distinct active test-account session per player is required.');
const stats={requests:0,errors:0,statuses:{},latencies:[]};
async function hit(session,path,body){const start=performance.now();try{const response=await fetch(new URL(path,origin),{method:body?'POST':'GET',headers:{cookie:session.cookie,origin:origin.origin,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});await response.arrayBuffer();stats.statuses[response.status]=(stats.statuses[response.status]??0)+1;if(!response.ok)stats.errors++}catch{stats.errors++}finally{stats.requests++;stats.latencies.push(performance.now()-start)}}
const start=performance.now(),end=start+seconds*1000;
await Promise.all(sessions.map(async(session,index)=>{await sleep(index*2);let nextPresence=0;while(performance.now()<end){const tick=performance.now();await hit(session,'/api/game',{type:'tick',batch:crypto.randomUUID(),motion:[{dx:0,dy:0,ms:40}]});if(tick>=nextPresence){await hit(session,'/api/game/presence');nextPresence=tick+6000}await sleep(Math.max(0,400-(performance.now()-tick)))}}));
stats.latencies.sort((a,b)=>a-b);const percentile=p=>Math.round(stats.latencies[Math.min(stats.latencies.length-1,Math.floor(stats.latencies.length*p))]??0);
console.log(JSON.stringify({players:count,durationSeconds:(performance.now()-start)/1000,requests:stats.requests,errors:stats.errors,statuses:stats.statuses,p50ms:percentile(.5),p95ms:percentile(.95),p99ms:percentile(.99)},null,2));
if(stats.errors)process.exitCode=1;
