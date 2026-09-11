import {db,HttpError} from './server';
import {landSnapshot,wallet} from './decorations';
export type Home={parcel:number;owner:string;version:string;visibility:'private'|'public'|'invited';guests:string;workshop:number;warehouse:number;garden:number;harvest_at:number;revision:number};
export async function homeAccess(user:string,parcel:number){
 const land=await landSnapshot(parcel);if(!land)throw new HttpError('This parcel has no owner yet.',404);
 const saved=await db().prepare('SELECT * FROM parcel_homes WHERE parcel=?').bind(parcel).first<Home>();
 const home:Home=saved?{...saved}: {parcel,owner:land.owner,version:land.version,visibility:'private',guests:'[]',workshop:0,warehouse:0,garden:0,harvest_at:0,revision:0};
 // Buildings stay with the land. Previous invitations never survive a transfer.
 if(home.owner!==land.owner||home.version!==land.version){home.owner=land.owner;home.version=land.version;home.visibility='private';home.guests='[]'}
 const canEdit=land.owner===await wallet(user);
 if(!canEdit&&home.visibility!=='public'&&!(home.visibility==='invited'&&(JSON.parse(home.guests) as string[]).includes(user)))throw new HttpError('This parcel is private. Ask its owner for an invitation.',403);
 return {land,home,canEdit};
}
export async function initializeHome(home:Home){
 await db().prepare('INSERT INTO parcel_homes(parcel,owner,version) VALUES(?,?,?) ON CONFLICT(parcel) DO UPDATE SET owner=excluded.owner,version=excluded.version,visibility=\'private\',guests=\'[]\',revision=parcel_homes.revision+1 WHERE parcel_homes.owner<>excluded.owner OR parcel_homes.version<>excluded.version').bind(home.parcel,home.owner,home.version).run();
 return (await db().prepare('SELECT * FROM parcel_homes WHERE parcel=?').bind(home.parcel).first<Home>())!;
}
export const upgradeCost=(level:number)=>[80,160,280][level]??0;
