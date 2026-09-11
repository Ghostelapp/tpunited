import {refresh} from '@/lib/auth';
import {fail} from '@/lib/server';
export async function POST(req:Request){try{return await refresh(req)}catch(e){return fail(e)}}
