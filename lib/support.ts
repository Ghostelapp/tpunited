import {db,HttpError} from './server';import {requireUser} from './auth';
export const isStaff=(role:string)=>role==='ADMIN'||role==='SUPER_ADMIN';
export type Ticket={id:number;user_id:string;kind:string;category:string;title:string;description:string;steps:string;expected:string;actual:string;context:string;status:string;priority:string;assigned_to:string|null;revision:number;created_at:number;updated_at:number};
export async function access(req:Request,id:number){const user=await requireUser(req);const ticket=await db().prepare('SELECT * FROM support_tickets WHERE id=?').bind(id).first<Ticket>();if(!ticket||(!isStaff(user.role)&&ticket.user_id!==user.id))throw new HttpError('Ticket not found.',404);return {user,ticket,staff:isStaff(user.role)}}
