import fs from 'node:fs';
// Local production configuration for the user's existing Cloudflare resources.
const source='dist/server/wrangler.json';
if(!fs.existsSync(source))throw Error('Run npm run build first.');
const c=JSON.parse(fs.readFileSync(source,'utf8'));
c.name='trash-panda-united';c.workers_dev=true;
c.services=[...(c.services??[]).filter(s=>s.binding!=='REALTIME'),{binding:'REALTIME',service:'trash-panda-realtime'}];
c.routes=[{pattern:'tpunited.xyz',custom_domain:true},{pattern:'game.tpunited.xyz',custom_domain:true}];
c.d1_databases=[{binding:'DB',database_name:'trash-panda-testnet',database_id:'c8d649c0-0494-4f05-812f-a56c3361efa5',migrations_dir:'../../drizzle'}];
c.r2_buckets=[{binding:'BUCKET',bucket_name:'tpu'}];
c.vars={BLOCKCHAIN_NETWORK:'base-sepolia',TOKEN_ENABLED:'false',AUTH_ORIGINS:'https://tpunited.xyz,https://game.tpunited.xyz',AUTH_COOKIE_DOMAIN:'tpunited.xyz'};
const file='deployments/test-token-base-sepolia.json';
if(fs.existsSync(file)){
 const d=JSON.parse(fs.readFileSync(file,'utf8'));
 if(d.chainId!==84532||!/^0x[0-9a-fA-F]{40}$/.test(d.address||''))throw Error('Token deployment is incomplete. Finish token deployment first.');
 Object.assign(c.vars,{TEST_TOKEN_CONTRACT:d.address,PAYMENT_TOKEN:d.address,PAYMENT_TOKEN_SYMBOL:'tTPU',PAYMENT_TOKEN_DECIMALS:'18',TOKEN_ENABLED:'true'});
}
fs.writeFileSync('dist/server/wrangler.production.json',JSON.stringify(c,null,2));
console.log('Prepared dist/server/wrangler.production.json for existing testnet DB and R2. Remote secrets are not changed.');
