import {nonce} from '@/lib/auth';
import {fail} from '@/lib/server';
export async function POST(req:Request){try{return await nonce(req)}catch(e){return fail(e)}}
