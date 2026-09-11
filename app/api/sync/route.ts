import {syncChain} from '@/apps/indexer/sync';
import {identity,sameOrigin,json,fail} from '@/lib/server';
export async function POST(req:Request){try{sameOrigin(req);await identity(req);return json(await syncChain())}catch(e){return fail(e)}}
