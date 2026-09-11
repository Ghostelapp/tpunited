import {network} from 'hardhat';import {createPublicClient,createWalletClient,custom,parseEther} from 'viem';import assert from 'node:assert/strict';import fs from 'node:fs';
const connection=await network.create('local');try{
const transport=custom(connection.provider),rpc=createPublicClient({transport});const [admin,buyer,treasury,other]=await connection.provider.request({method:'eth_accounts'});const w=account=>createWalletClient({account,transport});
async function deploy(n,args=[]){const a=JSON.parse(fs.readFileSync(`packages/contracts/artifacts/${n}.json`));const hash=await w(admin).deployContract({...a,args,chain:null});const r=await rpc.waitForTransactionReceipt({hash});assert.equal(r.status,'success');return {address:r.contractAddress,abi:a.abi}}
async function send(c,account,functionName,args=[]){const hash=await w(account).writeContract({...c,functionName,args,chain:null});assert.equal((await rpc.waitForTransactionReceipt({hash})).status,'success')}
const token=await deploy('TrashPandaTestToken'),decor=await deploy('TrashPandaDecorations',[admin,treasury,'https://example.invalid/api/metadata/decorations/']);const price=parseEther('100');
await assert.rejects(()=>rpc.simulateContract({...decor,functionName:'configureSale',args:[1n,token.address,price,true],account:other}));
await send(decor,admin,'configureSale',[1n,token.address,price,true]);await send(token,buyer,'claim');
await assert.rejects(()=>rpc.simulateContract({...decor,functionName:'buy',args:[1n,token.address,price],account:buyer}));await send(token,buyer,'approve',[decor.address,price]);
await assert.rejects(()=>rpc.simulateContract({...decor,functionName:'buy',args:[1n,token.address,price+1n],account:buyer}));
await send(decor,buyer,'buy',[1n,token.address,price]);assert.equal((await rpc.readContract({...decor,functionName:'ownerOf',args:[1n]})).toLowerCase(),buyer.toLowerCase());assert.equal(await rpc.readContract({...token,functionName:'balanceOf',args:[treasury]}),price);assert.equal(await rpc.readContract({...token,functionName:'allowance',args:[buyer,decor.address]}),0n);
await assert.rejects(()=>rpc.simulateContract({...decor,functionName:'buy',args:[1n,token.address,price],account:other}));await assert.rejects(()=>rpc.simulateContract({...decor,functionName:'configureSale',args:[1n,token.address,price,true],account:admin}));
assert.equal(await rpc.readContract({...decor,functionName:'tokenURI',args:[1n]}),'https://example.invalid/api/metadata/decorations/1');
await send(decor,buyer,'safeTransferFrom',[buyer,other,1n]);assert.equal(await rpc.readContract({...decor,functionName:'transferVersion',args:[1n]}),2n);
await send(decor,admin,'configureSale',[2n,token.address,price,true]);await assert.rejects(()=>rpc.simulateContract({...decor,functionName:'buy',args:[2n,token.address,price],account:treasury}));
console.log('PASS decoration authorization, exact payment, approval, NFT mint, duplicate rejection, metadata, transfer version and treasury buyer rejection.');
}finally{await connection.close()}
