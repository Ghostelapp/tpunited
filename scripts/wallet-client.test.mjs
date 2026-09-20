import {test} from 'node:test';import assert from 'node:assert/strict';import {EventEmitter} from 'node:events';import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),A='0x1111111111111111111111111111111111111111',B='0x2222222222222222222222222222222222222222',config={chainId:84532,network:'Base Sepolia'};
function setup(){let me={networkVerified:true,authenticated:true,user:{wallet:{address:A}}},ok=true;const events=new EventTarget(),module={exports:{}};const js=ts.transpileModule(fs.readFileSync('lib/wallet-client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(`(function(require,module,exports){${js}})`,{window:events,Event,setTimeout,fetch:async()=>({ok,json:async()=>me})})(require,module,module.exports);class Provider extends EventEmitter{account=A;chain=84532;async request({method}){if(method==='eth_accounts')return this.account?[this.account]:[];if(method==='eth_chainId')return '0x'+this.chain.toString(16);throw Error('Unexpected request')}}return {api:module.exports,provider:new Provider(),events,setMe:value=>{me=value},offline:()=>{ok=false}}}
test('repeated provider attachment installs exactly one accounts/chain listener and detaches on cleanup',()=>{const {api,provider}=setup();for(let i=0;i<5;i++)api.attachProvider(provider);assert.equal(provider.listenerCount('accountsChanged'),1);assert.equal(provider.listenerCount('chainChanged'),1);api.detachProvider();assert.equal(provider.listenerCount('accountsChanged'),0);assert.equal(provider.listenerCount('chainChanged'),0)});
test('wallet connection without a server session cannot authorize Web3',async()=>{const {api,provider,setMe}=setup();api.attachProvider(provider);await api.readProvider();setMe({authenticated:false,user:null});await assert.rejects(api.requireWallet(config),/Sign in/)});
test('accountsChanged updates every subscriber and blocks wrong-wallet transaction',async()=>{const {api,provider,events}=setup();api.attachProvider(provider);await api.readProvider();let changes=0;events.addEventListener('tpu-wallet',()=>changes++);provider.account=B;provider.emit('accountsChanged',[B]);assert.equal(api.activeAccount,B);await assert.rejects(api.requireWallet(config),/Wallet changed/);assert.ok(changes>=1)});
test('chainChanged blocks wrong-network transaction, returning to correct chain restores it',async()=>{const {api,provider}=setup();api.attachProvider(provider);provider.chain=8453;provider.emit('chainChanged','0x2105');await assert.rejects(api.requireWallet(config),/Switch your wallet/);provider.chain=84532;provider.emit('chainChanged','0x14a34');assert.equal((await api.requireWallet(config)).account,A)});
test('provider account is reread before transaction even if wallet emits no change event',async()=>{const {api,provider}=setup();api.attachProvider(provider);await api.readProvider();provider.account=B;await assert.rejects(api.requireWallet(config),/Wallet changed/)});
test('disconnect clears provider state and denied signature has a readable message',async()=>{const {api,provider}=setup();api.attachProvider(provider);await api.readProvider();api.detachProvider();assert.equal(api.activeAccount,null);await assert.rejects(api.requireWallet(config),/Connect/);assert.match(api.walletError({code:4001}),/declined/)});

test('EIP-6963 chooses MetaMask instead of another extension on window.ethereum',async()=>{
 const {api,provider,events}=setup();const other={request:async()=>{throw Error('Wrong provider')}};events.ethereum=other;
 events.addEventListener('eip6963:requestProvider',()=>{for(const [p,rdns] of [[other,'other.wallet'],[provider,'io.metamask']]){const event=new Event('eip6963:announceProvider');event.detail={provider:p,info:{rdns}};events.dispatchEvent(event);}});
 assert.equal(await api.browserProvider(),provider);
});
test('legacy multi-provider MetaMask and absent extension are handled',async()=>{
 const {api,provider,events}=setup();provider.isMetaMask=true;events.ethereum={providers:[{request:async()=>[]},provider]};assert.equal(await api.browserProvider(),provider);
 delete events.ethereum;await assert.rejects(api.browserProvider(),/No browser wallet/);
});
test('connect on the selected chain avoids a redundant switch request',async()=>{
 const {api,provider}=setup(),methods=[];const request=provider.request.bind(provider);provider.request=async args=>{methods.push(args.method);if(args.method==='eth_requestAccounts')return [A];return request(args)};
 await api.connectProvider(provider,config);assert.equal(api.activeAccount,A);assert.equal(api.activeChain,84532);assert.ok(!methods.includes('wallet_switchEthereumChain'));
});
test('adding an unknown chain explicitly selects it when the wallet does not auto-switch',async()=>{
 const {api,provider}=setup();provider.chain=1;let known=false,switches=0;const request=provider.request.bind(provider);
 provider.request=async args=>{if(args.method==='eth_requestAccounts')return [A];if(args.method==='wallet_switchEthereumChain'){switches++;if(!known)throw {code:-32603,data:{originalError:{code:4902}}};provider.chain=84532;return null;}if(args.method==='wallet_addEthereumChain'){known=true;return null;}return request(args)};
 await api.connectProvider(provider,{...config,rpcUrls:['https://sepolia.base.org'],explorer:'https://sepolia.basescan.org'});assert.equal(switches,2);assert.equal(api.activeChain,84532);
});
test('failed account access names the stage and cannot leave a stale connected account',async()=>{
 const {api,provider}=setup();api.attachProvider(provider);await api.readProvider();provider.request=async()=>{throw Error('Unable to find any account for 60')};
 await assert.rejects(api.connectProvider(provider,config),/Wallet account access: MetaMask could not provide/);assert.equal(api.activeProvider,null);assert.equal(api.activeAccount,null);
});
test('empty accounts and failed network switches cannot report a successful connection',async()=>{
 const {api,provider}=setup();provider.request=async()=>[];await assert.rejects(api.connectProvider(provider,config),/No Ethereum account/);
 provider.request=async({method})=>method==='eth_requestAccounts'?[A]:method==='eth_accounts'?[A]:method==='eth_chainId'?'0x1':null;
 await assert.rejects(api.connectProvider(provider,config),/Wallet network selection: Select Base Sepolia/);assert.equal(api.activeProvider,null);
 assert.match(api.walletError({code:-32002}),/already pending/);
});
