import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

const root=process.cwd();
const config=JSON.parse(fs.readFileSync('wrangler.realtime.json','utf8'));
config.main='../packages/realtime/worker.ts';
config.d1_databases=[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000',migrations_dir:'../drizzle'}];
config.vars={BLOCKCHAIN_NETWORK:'base-sepolia'};
fs.mkdirSync('.realtime-build',{recursive:true});
fs.writeFileSync('.realtime-build/wrangler.local.json',JSON.stringify(config,null,2));
const command=process.argv.includes('--migrate')
 ?['d1','migrations','apply','DB','--local']
 :['dev','--port','8788','--inspector-port','0'];
const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js',...command,'--config','.realtime-build/wrangler.local.json','--persist-to',path.join(root,'.wrangler/state')],{
 stdio:'inherit',env:{...process.env,WRANGLER_REGISTRY_PATH:path.join(root,'.wrangler/dev-registry'),MINIFLARE_REGISTRY_PATH:path.join(root,'.wrangler/registry'),CLOUDFLARE_CF_FETCH_ENABLED:'false'},
});
child.on('exit',code=>process.exit(code??1));child.on('error',error=>{console.error(error.message);process.exitCode=1;});
