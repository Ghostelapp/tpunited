import {z} from 'zod';
import {db,json,fail,identity,sameOrigin,readJson,HttpError,type PlayerRow} from '@/lib/server';
import {homeAccess,initializeHome,upgradeCost,type Home} from '@/lib/homestead';
import {parcels} from '@/packages/game-core/world';
export async function GET(req:Request){try{
 const user=await identity(req),url=new URL(req.url),id=Number(url.searchParams.get('id'));
 const vault=await db().prepare('SELECT scrap FROM homestead_vaults WHERE user_id=?').bind(user).first<{scrap:number}>();
 if(!id){const rows=await db().prepare("SELECT parcel FROM parcel_homes WHERE visibility='public' OR (visibility='invited' AND EXISTS(SELECT 1 FROM json_each(guests) WHERE value=?)) ORDER BY parcel LIMIT 100").bind(user).all<{parcel:number}>();return json({parcels:rows.results,vault:vault?.scrap??0})}
 if(!parcels.some(p=>p.id===id))throw new HttpError('Unknown parcel.',404);const {home,canEdit}=await homeAccess(user,id);const player=await db().prepare('SELECT state FROM players WHERE user_id=?').bind(user).first<{state:string}>();
 let guests:string[]=[];if(canEdit)for(const uid of JSON.parse(home.guests) as string[]){const r=await db().prepare('SELECT username FROM registrations WHERE user_id=?').bind(uid).first<{username:string}>();if(r)guests.push(r.username)}
 return json({home:{...home,guests:canEdit?guests:[]},canEdit,vault:vault?.scrap??0,scrap:player?JSON.parse(player.state).scrap:0,costs:[80,160,280],now:Date.now()});
 }catch(e){return fail(e)}}
export async function POST(req:Request){try{
 sameOrigin(req);const user=await identity(req);const b=z.object({action:z.enum(['visit','privacy','upgrade','craft','harvest','deposit','withdraw']),parcel:z.number().int().min(1).max(100).optional(),module:z.enum(['workshop','warehouse','garden']).optional(),visibility:z.enum(['private','public','invited']).optional(),guests:z.array(z.string().min(1).max(40)).max(20).optional(),amount:z.number().int().min(1).max(100000).optional()}).strict().parse(await readJson(req));
 let home:Home|undefined;
 if(b.action!=='withdraw'){
 if(!b.parcel||!parcels.some(p=>p.id===b.parcel))throw new HttpError('Choose a parcel.');
 const access=await homeAccess(user,b.parcel);
 if(b.action==='visit'){await db().prepare('INSERT INTO tutorial_rewards(user_id,visited_at) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET visited_at=MAX(visited_at,excluded.visited_at)').bind(user,Date.now()).run();return json({ok:true})}
 if(!access.canEdit)throw new HttpError('Only the owner can manage this parcel.',403);
 home=await initializeHome(access.home);
 }
 if(b.action==='privacy'){
 const guests:string[]=[];for(const name of b.guests??[]){const found=await db().prepare('SELECT user_id FROM registrations WHERE username=? COLLATE NOCASE').bind(name.trim()).first<{user_id:string}>();if(!found)throw new HttpError(`Player ${name} was not found.`);guests.push(found.user_id)}
 if(!b.visibility)throw new HttpError('Choose visibility.');const result=await db().prepare('UPDATE parcel_homes SET visibility=?,guests=?,revision=revision+1 WHERE parcel=? AND revision=?').bind(b.visibility,JSON.stringify([...new Set(guests)]),home!.parcel,home!.revision).run();if(!result.meta.changes)throw new HttpError('Settings changed. Refresh and retry.',409);return json({ok:true});
 }
 const player=await db().prepare('SELECT * FROM players WHERE user_id=?').bind(user).first<PlayerRow>();if(!player)throw new HttpError('Create your character in town first.',409);
 await db().prepare('INSERT INTO homestead_vaults(user_id) VALUES(?) ON CONFLICT DO NOTHING').bind(user).run();
 const vault=(await db().prepare('SELECT scrap FROM homestead_vaults WHERE user_id=?').bind(user).first<{scrap:number}>())!;
 const state=JSON.parse(player.state),next={...state},now=Date.now(),stamp=crypto.randomUUID();let bank=vault.scrap;
 if(b.action==='upgrade'){if(!b.module)throw new HttpError('Choose a building.');const level=home![b.module];if(level>=3)throw new HttpError('Maximum level reached.');next.scrap-=upgradeCost(level);home![b.module]=level+1}
 if(b.action==='craft'){if(!home!.workshop)throw new HttpError('Build a workshop first.');next.scrap-=Math.max(6,18-4*home!.workshop);next.medkits+=1}
 if(b.action==='harvest'){if(!home!.garden)throw new HttpError('Build a garden first.');if(now-home!.harvest_at<86400000)throw new HttpError('The next harvest is not ready yet.',409);next.circuits+=2*home!.garden;home!.harvest_at=now}
 if(b.action==='deposit'){if(!home!.warehouse||!b.amount)throw new HttpError('Build a warehouse and enter an amount.');if(bank+b.amount>home!.warehouse*200)throw new HttpError('Warehouse capacity exceeded.');next.scrap-=b.amount;bank+=b.amount}
 if(b.action==='withdraw'){if(!b.amount||bank<b.amount)throw new HttpError('Not enough stored scrap.');next.scrap+=b.amount;bank-=b.amount}
 if(next.scrap<0)throw new HttpError('Not enough scrap.');next.writeId=stamp;
 const guard=home?' AND EXISTS(SELECT 1 FROM parcel_homes WHERE parcel=? AND revision=? AND owner=? AND version=?)':'';
 const params: (string|number)[]=[JSON.stringify(next),now,user,player.revision];if(home)params.push(home.parcel,home.revision,home.owner,home.version);
 const updated="EXISTS(SELECT 1 FROM players WHERE user_id=? AND revision=? AND json_extract(state,'$.writeId')=?)";
 const statements=[db().prepare(`UPDATE players SET state=?,updated_at=?,revision=revision+1 WHERE user_id=? AND revision=?${guard}`).bind(...params),db().prepare(`UPDATE homestead_vaults SET scrap=? WHERE user_id=? AND ${updated}`).bind(bank,user,user,player.revision+1,stamp)];
 if(home)statements.push(db().prepare(`UPDATE parcel_homes SET workshop=?,warehouse=?,garden=?,harvest_at=?,revision=revision+1 WHERE parcel=? AND revision=? AND ${updated}`).bind(home.workshop,home.warehouse,home.garden,home.harvest_at,home.parcel,home.revision,user,player.revision+1,stamp));
 statements.push(db().prepare(`INSERT INTO economy(id,user_id,kind,amount,created_at) SELECT ?,?,?,?,? WHERE ${updated}`).bind(stamp,user,`homestead_${b.action}`,next.scrap-state.scrap,now,user,player.revision+1,stamp));
 const results=await db().batch(statements);if(!results[0].meta.changes)throw new HttpError('Progress changed in another tab. Refresh and retry.',409);return json({ok:true});
 }catch(e){return fail(e)}}
