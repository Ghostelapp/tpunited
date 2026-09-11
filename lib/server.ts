import {ZodError} from 'zod';
import {env} from 'cloudflare:workers';
import {requireUser} from './auth';
export const runtimeEnv=()=>env as unknown as Record<string,string|undefined>;
export function db(){if(!env.DB)throw new Error('Progress service is unavailable. Please try again.');return env.DB;}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store'}})}
export async function identity(req:Request){return (await requireUser(req)).id;}
export class HttpError extends Error{constructor(message:string,public status=400){super(message)}}
export function fail(e:unknown){if(e instanceof ZodError)return json({error:"Invalid request. Check the entered values."},400);if(e instanceof HttpError)return json({error:e.message},e.status);console.error('API failure',e instanceof Error?e.message:'unknown');return json({error:'Service unavailable. Your progress has not been changed. Please retry.'},503)}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new HttpError('Invalid request origin.',403)}
export type PlayerRow={user_id:string;username:string;state:string;revision:number;updated_at:number;created_at:number};

export async function readJson(req:Request,limit=32768):Promise<unknown>{
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw new HttpError('JSON request required.',415);
 if(Number(req.headers.get('content-length')??0)>limit)throw new HttpError('Request is too large.',413);
 const reader=req.body?.getReader();if(!reader)throw new HttpError('Request body is missing.');let length=0;const chunks:Uint8Array[]=[];
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();throw new HttpError('Request is too large.',413)}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}try{return JSON.parse(new TextDecoder().decode(bytes))}catch{throw new HttpError('Invalid JSON request.',400)}
}
