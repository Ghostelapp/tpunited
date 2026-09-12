import {db} from './server';
import {legacyFor,type GameState} from '@/packages/game-core/world';
export async function hydrateLegacy(user:string,state:GameState){
 const counts=await db().prepare('SELECT (SELECT COUNT(*) FROM legacy_visits WHERE visitor=?) visited,(SELECT COUNT(*) FROM legacy_visits WHERE owner=?) hosted').bind(user,user).first<{visited:number;hosted:number}>();
 state.legacy??=legacyFor(state);state.legacy.visited=counts?.visited??0;state.legacy.hosted=counts?.hosted??0;return state;
}
export async function recordLegacyVisit(visitor:string,ownerWallet:string){
 // Account identity comes from the wallet registry; never from a client-supplied owner ID.
 await db().prepare("INSERT INTO legacy_visits(visitor,owner,created_at) SELECT ?,w.user_id,? FROM account_wallets w JOIN registrations r ON r.user_id=w.user_id AND r.status='active' WHERE lower(w.address)=lower(?) AND w.user_id<>? ON CONFLICT(visitor,owner) DO NOTHING").bind(visitor,Date.now(),ownerWallet,visitor).run();
}
