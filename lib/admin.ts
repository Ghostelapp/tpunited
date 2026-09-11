import {requireUser} from './auth';
import {db,HttpError} from './server';
export async function adminIdentity(req:Request){const u=await requireUser(req);if(u.role!=='ADMIN'&&u.role!=='SUPER_ADMIN')throw new HttpError('Administrator access required.',403);return u.id;}
export function audit(actor:string,action:string,target:string){return db().prepare('INSERT INTO admin_audit(id,actor,action,target,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),actor,action,target,Date.now())}
