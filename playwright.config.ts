import {defineConfig} from '@playwright/test';
// Run only against an isolated local D1 database. Never seed test users in production.
const baseURL=process.env.E2E_BASE_URL||'http://localhost:5173';
if(!['localhost','127.0.0.1'].includes(new URL(baseURL).hostname))throw Error('E2E requires an isolated local server.');
export default defineConfig({testDir:'./tests/e2e',timeout:90000,workers:1,use:{baseURL,trace:'retain-on-failure'},projects:[{name:'desktop',use:{viewport:{width:1280,height:900}}},{name:'mobile',use:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}]});
