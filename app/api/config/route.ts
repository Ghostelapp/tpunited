import {publicRegistry} from '@/packages/blockchain/config';
import {runtimeEnv,json} from '@/lib/server';
export async function GET(){return json(publicRegistry(runtimeEnv()))}
