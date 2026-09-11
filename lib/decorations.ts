import {BaseError,ContractFunctionRevertedError,parseAbi,type Address} from 'viem';
import {db,runtimeEnv,HttpError} from './server';
import {registry,publicClient,landAbi} from '@/packages/blockchain/config';
import {decorAbi} from '@/packages/blockchain/decorations';
export {decorAbi};
export type Decoration={id:number;name:string;description:string;image:string;rarity:string;width:number;height:number;status:string;chain_id:number;contract:Address};
export type Placement=Decoration&{item_id:number;parcel:number;x:number;y:number;rotation:number;owner:string;land_version:string;token_version:string};
export async function snapshot(address:Address,id:number){const c=registry(runtimeEnv()),rpc=publicClient(c);const abi=decorAbi;
 try{const [owner,safe,version,safeVersion]=await Promise.all([rpc.readContract({address,abi,functionName:'ownerOf',args:[BigInt(id)]}),rpc.readContract({address,abi,functionName:'ownerOf',args:[BigInt(id)],blockTag:'safe'}),rpc.readContract({address,abi,functionName:'transferVersion',args:[BigInt(id)]}),rpc.readContract({address,abi,functionName:'transferVersion',args:[BigInt(id)],blockTag:'safe'})]);if(owner.toLowerCase()!==safe.toLowerCase()||version!==safeVersion)throw new HttpError('NFT ownership is still confirming.',409);return {owner:owner.toLowerCase(),version:String(version)};
 }catch(e){if(e instanceof BaseError&&e.walk(x=>x instanceof ContractFunctionRevertedError) instanceof ContractFunctionRevertedError)return null;throw e}
}
export async function landSnapshot(id:number){const c=registry(runtimeEnv());if(!c.land)throw new HttpError('Land contract is not configured.',409);return snapshot(c.land,id)}
export async function wallet(user:string){const c=registry(runtimeEnv());const w=await db().prepare('SELECT address FROM account_wallets WHERE user_id=? AND chain_id=?').bind(user,c.chainId).first<{address:string}>();if(!w)throw new HttpError('Sign in on the configured network.',403);return w.address.toLowerCase()}
export async function decoration(id:number){const c=registry(runtimeEnv());const item=await db().prepare("SELECT * FROM decoration_items WHERE id=? AND status='published' AND chain_id=? AND contract=?").bind(id,c.chainId,c.decorations?.toLowerCase()||'').first<Decoration>();if(!item)throw new HttpError('Decoration not found.',404);return item}
export async function validPlacements(parcel:number,land:Awaited<ReturnType<typeof landSnapshot>>){
 const c=registry(runtimeEnv());const rows=await db().prepare('SELECT p.*,i.name,i.description,i.image,i.rarity,i.width,i.height,i.status,i.chain_id,i.contract FROM parcel_decorations p JOIN decoration_items i ON i.id=p.item_id WHERE p.parcel=? LIMIT 40').bind(parcel).all<Placement>();const valid:Placement[]=[];
 for(const row of rows.results){const token=row.chain_id===c.chainId&&row.contract.toLowerCase()===c.decorations?.toLowerCase()?await snapshot(row.contract,row.item_id):null;
 if(land&&token&&row.status==='published'&&land.owner===row.owner&&land.version===row.land_version&&token.owner===row.owner&&token.version===row.token_version)valid.push(row);
 else await db().prepare('DELETE FROM parcel_decorations WHERE item_id=? AND owner=? AND land_version=? AND token_version=? AND parcel=?').bind(row.item_id,row.owner,row.land_version,row.token_version,parcel).run();
 }return valid;
}
