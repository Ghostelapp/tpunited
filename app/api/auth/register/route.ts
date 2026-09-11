import {register} from '@/lib/auth';
import {fail} from '@/lib/server';
export async function POST(req:Request){try{return await register(req)}catch(e){return fail(e)}}
