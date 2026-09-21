import {formatUnits,parseUnits,parseAbi,type Address} from 'viem';
import {registry,publicClient} from '@/packages/blockchain/config';
import {db,runtimeEnv,HttpError} from './server';
export type Web3Quest={verification:string;chain_id:number;target:string;requirement_amount:string;token_id:string};
export const WEB3_METHODS=['wallet_verified','native_balance','erc20_balance','erc721_balance','erc1155_balance'];
const balanceAbi=parseAbi(['function balanceOf(address owner) view returns (uint256)','function decimals() view returns (uint8)']);
const multiAbi=parseAbi(['function balanceOf(address owner,uint256 id) view returns (uint256)']);
export async function web3Progress(user:string,c:Web3Quest){
 if(![8453,84532].includes(c.chain_id))throw new HttpError('Unsupported quest network.',409);
 const wallet=await db().prepare('SELECT address FROM account_wallets WHERE user_id=? AND chain_id=? ORDER BY created_at,address LIMIT 1').bind(user,c.chain_id).first<{address:Address}>();
 if(!wallet)return {complete:false,current:'0',required:c.requirement_amount,message:'Sign in with your wallet on the required network first.'};
 if(c.verification==='wallet_verified')return {complete:true,current:'1',required:'1',wallet:wallet.address,chainId:c.chain_id};
 const env=runtimeEnv(),configured=registry(env);
 const config=configured.chainId===c.chain_id?configured:registry({...env,BLOCKCHAIN_NETWORK:c.chain_id===8453?'base-mainnet':'base-sepolia',BASE_RPC_URL:undefined,BASE_RPC_FALLBACK:undefined});
 const rpc=publicClient(config);
 // A finalized block prevents rewards based on pending or reverted balances.
 const block=await rpc.getBlock({blockTag:'finalized'});if(block.number===null)throw new HttpError('Waiting for a finalized block.',503);
 let balance:bigint,decimals=0;
 if(c.verification==='native_balance'){decimals=18;balance=await rpc.getBalance({address:wallet.address,blockNumber:block.number});}
 else{
  if(!/^0x[0-9a-fA-F]{40}$/.test(c.target))throw new HttpError('Quest contract is not configured.',409);
  const address=c.target as Address;
  if(c.verification==='erc1155_balance')balance=await rpc.readContract({address,abi:multiAbi,functionName:'balanceOf',args:[wallet.address,BigInt(c.token_id)],blockNumber:block.number});
  else{
   if(c.verification==='erc20_balance')decimals=await rpc.readContract({address,abi:balanceAbi,functionName:'decimals',blockNumber:block.number});
   balance=await rpc.readContract({address,abi:balanceAbi,functionName:'balanceOf',args:[wallet.address],blockNumber:block.number});
  }
 }
 if(!Number.isInteger(decimals)||decimals<0||decimals>36)throw new HttpError('Unsupported token precision.',409);
 if((c.requirement_amount.split('.')[1]?.length??0)>decimals)throw new HttpError('Quest amount has more decimal places than the token supports.',409);
 const required=parseUnits(c.requirement_amount,decimals);if(required<=0n)throw new HttpError('Quest balance must be positive.',409);
 return {complete:balance>=required,current:formatUnits(balance,decimals),required:c.requirement_amount,wallet:wallet.address,chainId:c.chain_id,block:block.number.toString(),contract:c.target,tokenId:c.token_id};
}
