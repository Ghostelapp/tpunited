import {NextResponse,type NextRequest} from 'next/server';
import {domainRoute} from './lib/domain-routing';
export function middleware(req:NextRequest){
 const route=domainRoute(req.url);
 if(!route)return NextResponse.next();
 return route.kind==='rewrite'?NextResponse.rewrite(new URL(route.url)):NextResponse.redirect(new URL(route.url),307);
}
export const config={matcher:['/','/home','/game/:path*']};
