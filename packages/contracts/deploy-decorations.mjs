import fs from 'node:fs';
import {createPublicClient,createWalletClient,http,isAddress} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {baseSepolia} from 'viem/chains';
if(process.env.BLOCKCHAIN_NETWORK!=='base-sepolia')throw Error('Base Sepolia only.');
const account=privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const treasury=process.env.TREASURY_ADDRESS,origin=process.env.AUTH_ORIGIN;
if(!treasury||!isAddress(treasury)||!origin?.startsWith('https://'))throw Error('Set TREASURY_ADDRESS and HTTPS AUTH_ORIGIN.');
const transport=http(process.env.BASE_RPC_URL||'https://sepolia.base.org'),rpc=createPublicClient({chain:baseSepolia,transport}),wallet=createWalletClient({chain:baseSepolia,transport,account});
if(await rpc.getChainId()!==84532)throw Error('Wrong RPC network.');
const uri=new URL('/api/metadata/decorations/',origin).href;
const artifact=JSON.parse(fs.readFileSync('packages/contracts/artifacts/TrashPandaDecorations.json'));
fs.mkdirSync('deployments',{recursive:true});const file='deployments/decorations-base-sepolia.json';let saved=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;
if(saved&&(saved.deployer.toLowerCase()!==account.address.toLowerCase()||saved.treasury.toLowerCase()!==treasury.toLowerCase()||saved.uri!==uri))throw Error('Saved deployment differs. Inspect it before changing collection.');
if(!saved){const hash=await wallet.deployContract({...artifact,args:[account.address,treasury,uri]});saved={deployer:account.address,treasury,uri,hash,chainId:84532};fs.writeFileSync(file,JSON.stringify(saved,null,2));console.log('Submitted',hash)}
const receipt=await rpc.waitForTransactionReceipt({hash:saved.hash,confirmations:2});if(receipt.status!=='success'||!receipt.contractAddress)throw Error('Deployment failed. Inspect the saved transaction.');
const code=await rpc.getCode({address:receipt.contractAddress});if(!code||code==='0x')throw Error('Missing deployed contract.');
fs.writeFileSync(file,JSON.stringify({...saved,address:receipt.contractAddress},null,2));console.log(JSON.stringify({DECORATION_CONTRACT:receipt.contractAddress},null,2));
