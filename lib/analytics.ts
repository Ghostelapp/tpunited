import {z} from 'zod';
export const DAY=86_400_000;
export const analyticsEvent=z.object({
 consent:z.literal(true),visitor:z.string().uuid(),session:z.string().uuid(),view:z.string().uuid(),
 kind:z.enum(['view','heartbeat']),path:z.string().max(300),referrer:z.string().max(2048).default(''),
 source:z.string().max(80).default(''),medium:z.string().max(80).default(''),campaign:z.string().max(100).default(''),
 activeSeconds:z.number().int().min(0).max(86400).default(0),
}).strict();
// Only public route shapes enter analytics; never store tokens, queries, addresses or arbitrary paths.
export function analyticsPath(value:string){
 const path=value.split(/[?#]/)[0].replace(/\/$/,'')||'/';
 if(/^\/(admin|api)(\/|$)/i.test(path))return null;
 if(/^\/parcel\/\d+$/.test(path))return '/parcel/:id';
 return /^\/(home|game|land|community|marketplace|profile|register|program|campaigns|leaderboard|litepaper|support|decorations|privacy|terms)?$/.test(path)?path:'/other';
}
export function attribution(referrer:string,origin:string){try{const url=new URL(referrer);if(!['http:','https:'].includes(url.protocol)||url.origin===origin)return 'Direct / internal';return url.hostname.slice(0,150)}catch{return 'Direct / internal'}}
export function campaignLabel(value:string){return value.replace(/[^a-zA-Z0-9_. -]/g,'').slice(0,80)}
export function userAgentInfo(ua:string){
 return {bot:/bot|crawler|spider|headless|lighthouse|preview|curl|wget/i.test(ua),
 device:/ipad|tablet/i.test(ua)?'Tablet':/mobile|iphone|android/i.test(ua)?'Mobile':'Desktop',
 browser:/edg\//i.test(ua)?'Edge':/firefox|fxios/i.test(ua)?'Firefox':/opr\//i.test(ua)?'Opera':/chrome|crios/i.test(ua)?'Chrome':/safari/i.test(ua)?'Safari':'Other',
 os:/android/i.test(ua)?'Android':/iphone|ipad/i.test(ua)?'iOS':/windows/i.test(ua)?'Windows':/macintosh|mac os/i.test(ua)?'macOS':/linux/i.test(ua)?'Linux':'Other'};
}
export type AnalyticsBreakdown={label:string;views:number;visitors:number};
export type AnalyticsReport={from:string;to:string;generatedAt:number;summary:{views:number;visitors:number;sessions:number;activeSeconds:number;authenticated:number;gameVisitors:number;singlePageSessions:number};online:number;daily:{day:string;views:number;visitors:number}[];breakdowns:Record<string,AnalyticsBreakdown[]>;recent:{id:string;visitor:string;username:string|null;host:string;path:string;country:string;device:string;browser:string;referrer:string;started_at:number;last_seen:number;active_seconds:number}[]};
