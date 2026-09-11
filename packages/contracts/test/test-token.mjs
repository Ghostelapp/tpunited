import {network} from 'hardhat';
import {createPublicClient,createWalletClient,custom,parseEther,keccak256,toHex} from 'viem';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const connection=await network.create('local');
try{
 const transport=custom(connection.provider),rpc=createPublicClient({transport});
 const [A,B]=await connection.provider.request({method:'eth_accounts'});
 const wallet=account=>createWalletClient({transport,account});
 const artifact=JSON.parse(fs.readFileSync('packages/contracts/artifacts/TrashPandaTestToken.json'));
 const hash=await wallet(A).deployContract({...artifact,args:[],chain:null});
 const receipt=await rpc.waitForTransactionReceipt({hash});assert.equal(receipt.status,'success');
 const c={address:receipt.contractAddress,abi:artifact.abi};
 const read=(functionName,args=[])=>rpc.readContract({...c,functionName,args});
 const send=async(account,functionName,args=[])=>{const hash=await wallet(account).writeContract({...c,functionName,args,chain:null});assert.equal((await rpc.waitForTransactionReceipt({hash})).status,'success')};
 assert.equal(await read('totalSupply'),0n);assert.equal(await read('symbol'),'tTPU');
 await send(A,'claim');assert.equal(await read('balanceOf',[A]),parseEther('1000'));
 await assert.rejects(()=>rpc.simulateContract({...c,functionName:'claim',account:A}));
 console.log('PASS initial claim and repeated claim rejection');
 await send(B,'claim');await send(A,'transfer',[B,parseEther('100')]);assert.equal(await read('balanceOf',[B]),parseEther('1100'));
 await assert.rejects(()=>rpc.simulateContract({...c,functionName:'claim',account:A}));
 console.log('PASS independent wallets, transfer does not reset cooldown');
 await connection.provider.request({method:'evm_increaseTime',params:[86400]});await connection.provider.request({method:'evm_mine'});
 await send(A,'claim');assert.equal(await read('balanceOf',[A]),parseEther('1900'));
 console.log('PASS cooldown expires and allows next claim');

 const deploy=async(name,args)=>{const artifact=JSON.parse(fs.readFileSync(`packages/contracts/artifacts/${name}.json`));const hash=await wallet(A).deployContract({...artifact,args,chain:null});const receipt=await rpc.waitForTransactionReceipt({hash});assert.equal(receipt.status,'success');return {address:receipt.contractAddress,abi:artifact.abi}};
 const write=async(contract,account,functionName,args)=>{const hash=await wallet(account).writeContract({...contract,functionName,args,chain:null});assert.equal((await rpc.waitForTransactionReceipt({hash})).status,'success')};
 const land=await deploy('TrashPandaLand',[A,100n,'https://example.invalid/land/']);
 const router=await deploy('TrashPandaPaymentRouter',[A,land.address,A]);
 await write(land,A,'grantRole',[keccak256(toHex('MINTER_ROLE')),router.address]);
 await write(router,A,'setCurrency',[c.address,true]);
 const price=parseEther('100');await write(router,A,'configureSale',[1n,c.address,price,true]);
 await assert.rejects(()=>rpc.simulateContract({...router,functionName:'buyLand',args:[1n,c.address,price],account:B}));
 await send(B,'approve',[router.address,price]);
 const before=await read('balanceOf',[A]);
 await write(router,B,'buyLand',[1n,c.address,price]);
 assert.equal((await rpc.readContract({...land,functionName:'ownerOf',args:[1n]})).toLowerCase(),B.toLowerCase());
 assert.equal(await read('balanceOf',[A])-before,price);
 assert.equal(await read('allowance',[B,router.address]),0n);
 console.log('PASS real tTPU purchase requires approval, transfers NFT and pays treasury exactly');
 // ERC20 base stores total supply at slot 2; inspect compiler layout assumptions through readback.
 const cap=await read('MAX_SUPPLY');
 await connection.provider.request({method:'hardhat_setStorageAt',params:[c.address,'0x2','0x'+cap.toString(16).padStart(64,'0')]});
 assert.equal(await read('totalSupply'),cap);
 await connection.provider.request({method:'evm_increaseTime',params:[86400]});await connection.provider.request({method:'evm_mine'});
 await assert.rejects(()=>rpc.simulateContract({...c,functionName:'claim',account:B}));console.log('PASS exhausted global supply rejects claims');
 console.log('Test-token scenarios passed locally; no network deployment performed.');
}finally{await connection.close()}
