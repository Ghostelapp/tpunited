import {env} from 'cloudflare:workers';
import {requireUser} from '@/lib/auth';
import {sameOrigin,fail,HttpError} from '@/lib/server';

export async function GET(req:Request){
 try{
  sameOrigin(req);
  await requireUser(req);
  if(req.headers.get('Upgrade')?.toLowerCase()!=='websocket')throw new HttpError('WebSocket upgrade required.',426);
  if(!env.REALTIME)throw new HttpError('Multiplayer server is not configured.',503);
  // Service binding preserves the original URL/cookies. No client identity headers.
  const response=await env.REALTIME.fetch(req.url,{method:'GET',headers:req.headers});
  // Vinext adds response headers. A service-binding response has immutable
  // headers, so clone it while explicitly preserving the upgraded socket.
  return new Response(response.body,{status:response.status,headers:new Headers(response.headers),webSocket:response.webSocket});
 }catch(e){return fail(e)}
}
