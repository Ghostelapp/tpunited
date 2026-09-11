import {me} from '@/lib/auth';
import {fail} from '@/lib/server';
export async function GET(req:Request){try{return await me(req)}catch(e){return fail(e)}}
