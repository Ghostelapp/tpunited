'use client';
import {useCallback,useEffect,useState} from 'react';
import {formatUnits,parseAbi} from 'viem';
import {useAuth} from './auth-provider';
import {publicClient} from '@/packages/blockchain/config';
import {execute} from '@/packages/blockchain/transactions';
import {walletError} from '@/lib/wallet-client';
const abi=parseAbi(['function balanceOf(address) view returns(uint256)','function nextClaimAt(address) view returns(uint256)','function totalSupply() view returns(uint256)','function MAX_SUPPLY() view returns(uint256)','function CLAIM_AMOUNT() view returns(uint256)','function claim()']);
export default function TestToken(){
 const a=useAuth(),c=a.config,address=a.account,token=c?.testToken;
 const [data,setData]=useState<{balance:bigint;next:bigint;amount:bigint;exhausted:boolean}|null>(null);
 const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState(''),[hash,setHash]=useState(''),[now,setNow]=useState(0);
 const load=useCallback(async()=>{
  if(!c||!token||!address||c.chainId!==84532)return;
  const rpc=publicClient(c);
  const [balance,next,total,max,amount]=await Promise.all([
   rpc.readContract({address:token,abi,functionName:'balanceOf',args:[address]}),
   rpc.readContract({address:token,abi,functionName:'nextClaimAt',args:[address]}),
   rpc.readContract({address:token,abi,functionName:'totalSupply'}),
   rpc.readContract({address:token,abi,functionName:'MAX_SUPPLY'}),
   rpc.readContract({address:token,abi,functionName:'CLAIM_AMOUNT'})]);
  return {balance,next,amount,exhausted:total+amount>max};
 },[c,token,address]);
 useEffect(()=>{let alive=true;setData(null);setHash('');setError('');setStatus('');setNow(Math.floor(Date.now()/1000));load().then(d=>{if(alive&&d)setData(d)}).catch(e=>{if(alive)setError(walletError(e))});const timer=setInterval(()=>setNow(Math.floor(Date.now()/1000)),1000);return()=>{alive=false;clearInterval(timer)}},[load]);
 if(!c||c.chainId!==84532||!token||!address)return null;
 const remaining=data?Math.max(0,Number(data.next)-now):0;
 async function claim(){if(busy||!c||!token)return;setBusy(true);setError('');setHash('');try{await execute(c,{address:token,abi,functionName:'claim',args:[]},setStatus,setHash);const d=await load();if(d)setData(d)}catch(e){setError(walletError(e))}finally{setBusy(false)}}
 return <section className="wallet-detail" aria-label="Test token faucet"><strong>TEST TOKEN · tTPU</strong><p>Balance: {data?formatUnits(data.balance,18):'…'} tTPU</p><p className="small-note">Free test currency. No monetary value, leaderboard points or guaranteed mainnet conversion. Claiming requires Base Sepolia ETH for gas.</p><button className="btn lime" disabled={busy||!data||remaining>0||data.exhausted||a.mismatch||!a.authenticated||!a.networkVerified||a.chain!==84532} onClick={claim}>{busy?'WAITING FOR CONFIRMATION…':data?.exhausted?'FAUCET SUPPLY EXHAUSTED':remaining>0?`AVAILABLE IN ${Math.ceil(remaining/60)} MIN`:`CLAIM ${data?formatUnits(data.amount,18):'1000'} tTPU`}</button><p className="small-note">One claim per wallet every 24 hours. Connect and sign in on Base Sepolia.</p><button className="text-link" disabled={busy} onClick={async()=>{setError('');try{const d=await load();if(d)setData(d)}catch(e){setError(walletError(e))}}}>REFRESH BALANCE</button>{status&&<p role="status">{status}</p>}{error&&<p className="error" role="alert">{error}</p>}{hash&&<a href={`${c.explorer}/tx/${hash}`} target="_blank" rel="noreferrer">VIEW TRANSACTION ↗</a>}<a className="text-link" href="/land">TEST A LAND PURCHASE</a></section>;
}
