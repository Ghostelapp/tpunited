'use client';
import {toHex,type Address,type EIP1193Provider} from 'viem';
import type {Registry} from '@/packages/blockchain/config';
export let activeProvider:EIP1193Provider|null=null;
export let activeAccount:Address|null=null;
export let activeChain:number|null=null;
let cleanup=()=>{};
export function emitWallet(){window.dispatchEvent(new Event('tpu-wallet'))}
export function attachProvider(provider:EIP1193Provider){cleanup();activeProvider=provider;activeAccount=null;activeChain=null;emitWallet();const accounts=(value:unknown)=>{activeAccount=(value as Address[])[0]??null;emitWallet()};const chain=(value:unknown)=>{activeChain=Number(value);emitWallet()};const disconnect=()=>{activeAccount=null;activeChain=null;emitWallet()};provider.on?.('accountsChanged',accounts);provider.on?.('chainChanged',chain);provider.on?.('disconnect',disconnect);cleanup=()=>{provider.removeListener?.('accountsChanged',accounts);provider.removeListener?.('chainChanged',chain);provider.removeListener?.('disconnect',disconnect)};return {accounts,chain};}
export function detachProvider(){cleanup();cleanup=()=>{};activeProvider=null;activeAccount=null;activeChain=null;emitWallet()}
export async function readProvider(){const p=activeProvider;if(!p)return;const [accounts,chain]=await Promise.all([p.request({method:'eth_accounts'}),p.request({method:'eth_chainId'})]);if(p!==activeProvider)return;activeAccount=accounts[0]??null;activeChain=Number(chain);emitWallet()}
function rpcCode(error:unknown):number|undefined{
 const e=error as {code?:number;data?:{originalError?:{code?:number}};cause?:unknown}|null;
 return e?.data?.originalError?.code??e?.code;
}
export async function switchNetwork(c:Registry){
 const p=activeProvider;if(!p)throw Error('Connect a wallet first.');
 // Do not ask an extension to switch a chain that is already selected.
 const chain=Number(await p.request({method:'eth_chainId'}));
 if(chain!==c.chainId){
  try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:toHex(c.chainId)}]})}
  catch(e){if(rpcCode(e)!==4902)throw e;
   await p.request({method:'wallet_addEthereumChain',params:[{chainId:toHex(c.chainId),chainName:c.network,nativeCurrency:{name:'Ether',symbol:'ETH',decimals:18},rpcUrls:c.rpcUrls,blockExplorerUrls:[c.explorer]}]});
   if(Number(await p.request({method:'eth_chainId'}))!==c.chainId)await p.request({method:'wallet_switchEthereumChain',params:[{chainId:toHex(c.chainId)}]});
  }
 }
 await readProvider();
 if(p!==activeProvider)throw Error('Wallet changed. Please connect again.');
 if(activeChain!==c.chainId)throw Error(`Select ${c.network} in your wallet and retry.`);
}
// EIP-6963 avoids the window.ethereum race when several wallets are installed.
export async function browserProvider():Promise<EIP1193Provider>{
 const announced=new Map<EIP1193Provider,string>();
 const listener=(event:Event)=>{
  const detail=(event as CustomEvent).detail;
  if(detail?.provider&&typeof detail.provider.request==='function'&&typeof detail.info?.rdns==='string')announced.set(detail.provider,detail.info.rdns);
 };
 window.addEventListener('eip6963:announceProvider',listener);
 try{window.dispatchEvent(new Event('eip6963:requestProvider'));await new Promise(resolve=>setTimeout(resolve,250));}
 finally{window.removeEventListener('eip6963:announceProvider',listener);}
 const metamask=[...announced].find(([,rdns])=>rdns==='io.metamask')?.[0];if(metamask)return metamask;
 const injected=(window as unknown as {ethereum?:EIP1193Provider&{providers?:Array<EIP1193Provider&{isMetaMask?:boolean}>;isMetaMask?:boolean}}).ethereum;
 const legacy=injected?.providers?.find(p=>p.isMetaMask);if(legacy)return legacy;
 if(injected?.isMetaMask)return injected;
 const choices=[...new Set([...announced.keys(),...(injected?.providers??[])])];
 if(choices.length===1)return choices[0];
 if(choices.length>1)throw Error('Multiple browser wallets detected. Enable MetaMask for this site, or use Base Account.');
 if(injected&&typeof injected.request==='function')return injected;
 throw Error('No browser wallet detected. Enable MetaMask for this site, or use Base Account.');
}
export async function connectProvider(provider:EIP1193Provider,c:Registry){
 detachProvider();let stage='Wallet account access';
 try{
  const accounts=await provider.request({method:'eth_requestAccounts'});
  if(!Array.isArray(accounts)||!accounts.some(a=>/^0x[0-9a-fA-F]{40}$/.test(a)))throw Error('No Ethereum account was shared. Select an Ethereum account in your wallet.');
  attachProvider(provider);stage='Wallet network selection';await switchNetwork(c);
  if(!activeAccount||!/^0x[0-9a-fA-F]{40}$/.test(activeAccount))throw Error('The wallet did not expose an Ethereum account after connecting.');
 }catch(e){if(activeProvider===provider)detachProvider();throw Error(`${stage}: ${walletError(e)}`);}
}
// Recheck authoritative session and the provider immediately before each Web3 operation.
export async function requireWallet(c:Registry){const p=activeProvider;if(!p)throw Error('Connect your wallet first.');const response=await fetch('/api/auth/me',{cache:'no-store'});const d=await response.json() as {authenticated:boolean;networkVerified:boolean;user?:{wallet:{address:string}};error?:string};if(!response.ok||!d.authenticated||!d.user)throw Error(d.error||'Sign in with your wallet first.');if(!d.networkVerified)throw Error('Sign in again to verify this network.');await readProvider();if(p!==activeProvider||activeAccount?.toLowerCase()!==d.user.wallet.address.toLowerCase())throw Error('Wallet changed. Connect the wallet belonging to your signed-in account.');if(activeChain!==c.chainId)throw Error(`Switch your wallet to ${c.network}.`);return {provider:p,account:activeAccount!};}
export function walletError(e:unknown){
 const x=e as {code?:number;shortMessage?:string;message?:string}|null;
 const code=rpcCode(e),message=x?.shortMessage||x?.message||'Wallet request failed. Please try again.';
 if(code===4001)return 'Request declined in your wallet. You can try again.';
 if(code===-32002)return 'A wallet request is already pending. Open MetaMask and complete or reject that request before retrying.';
 if(/Unable to find any account for 60/i.test(message))return 'MetaMask could not provide an Ethereum account (account type 60). Select an Ethereum account in MetaMask. If it is already selected, update or restart the extension. No payment is needed. Original error: '+message;
 return message;
}
