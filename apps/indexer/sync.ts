import {syncLand} from '@/packages/blockchain/indexer';
import {registry} from '@/packages/blockchain/config';
import {runtimeEnv} from '@/lib/server';
export async function syncChain(){return syncLand(registry(runtimeEnv()))}
