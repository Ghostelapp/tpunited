import {spawnSync} from 'node:child_process';
const test=spawnSync(process.execPath,['--import','./scripts/register-test-typescript.mjs','--test','tests/realtime-integration.test.ts'],{stdio:'inherit',env:{...process.env,REALTIME_FULL_APP:'1'}});
if(test.error)throw test.error;process.exit(test.status??1);
