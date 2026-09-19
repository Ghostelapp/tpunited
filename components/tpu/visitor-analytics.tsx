'use client';
import {useEffect,useState,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {useAuth} from './auth-provider';
import {analyticsPath} from '@/lib/analytics';
const CHOICE='tpu-analytics-consent-v1',VISITOR='tpu-analytics-visitor-v1',SESSION='tpu-analytics-session-v1';
type Choice='yes'|'no'|null;
export default function VisitorAnalytics(){
 const pathname=usePathname(),auth=useAuth();const [choice,setChoice]=useState<Choice>(null),[loaded,setLoaded]=useState(false),[settings,setSettings]=useState(false);
 const countedPath=useRef<string|null>(null);
 useEffect(()=>{
  if(auth.initializing||!pathname||!analyticsPath(pathname)||['ADMIN','SUPER_ADMIN'].includes(auth.user?.role??'')||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  const count=()=>{if(document.visibilityState!=='visible'||countedPath.current===pathname)return;countedPath.current=pathname;
   void fetch('/api/analytics/count',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:pathname}),keepalive:true}).catch(()=>{});
  };
  count();document.addEventListener('visibilitychange',count);return()=>document.removeEventListener('visibilitychange',count);
 },[pathname,auth.initializing,auth.user?.role]);
 useEffect(()=>{const read=()=>{try{const value=localStorage.getItem(CHOICE);setChoice(value==='yes'||value==='no'?value:null)}catch{setChoice('no')}setLoaded(true)};read();window.addEventListener('storage',read);return()=>window.removeEventListener('storage',read)},[]);
 function choose(value:'yes'|'no'){try{localStorage.setItem(CHOICE,value);if(value==='no'){localStorage.removeItem(VISITOR);sessionStorage.removeItem(SESSION)}}catch{}setChoice(value);setSettings(false)}
 useEffect(()=>{
  if(auth.initializing||!loaded||choice!=='yes'||!pathname||!analyticsPath(pathname)||['ADMIN','SUPER_ADMIN'].includes(auth.user?.role??'')||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  let visitor:string,session:string;
  try{visitor=localStorage.getItem(VISITOR)??crypto.randomUUID();localStorage.setItem(VISITOR,visitor);const stored=JSON.parse(sessionStorage.getItem(SESSION)??'null') as {id:string;at:number}|null;session=stored&&Date.now()-stored.at<1800000?stored.id:crypto.randomUUID();sessionStorage.setItem(SESSION,JSON.stringify({id:session,at:Date.now()}))}catch{return}
  const view=crypto.randomUUID(),query=new URLSearchParams(window.location.search);
  const event={consent:true,visitor,session,view,path:pathname,referrer:document.referrer.slice(0,2048),source:(query.get('utm_source')??'').slice(0,80),medium:(query.get('utm_medium')??'').slice(0,80),campaign:(query.get('utm_campaign')??'').slice(0,100)};
  let alive=true,registered=false,pending=false,active=0,last=Date.now(),activity=last,visible=document.visibilityState==='visible';
  const accrue=()=>{const now=Date.now();if(visible)active+=Math.max(0,Math.min(now,activity+60000)-last);last=now;visible=document.visibilityState==='visible'};
  const interact=()=>{accrue();activity=Date.now()};
  async function send(){
   accrue();if(!alive||pending)return;pending=true;
   try{const response=await fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...event,kind:registered?'heartbeat':'view',activeSeconds:Math.min(86400,Math.floor(active/1000))}),keepalive:true});if(response.ok){registered=true;sessionStorage.setItem(SESSION,JSON.stringify({id:session,at:Date.now()}))}}catch{/* Analytics never blocks navigation or gameplay. */}finally{pending=false}
  }
  const visibility=()=>{accrue();if(visible)activity=Date.now();void send()};
  const timer=setInterval(()=>{if(document.visibilityState==='visible'&&Date.now()-activity<60000)void send()},15000);
  if(visible)void send();
  document.addEventListener('visibilitychange',visibility);
  const events=['pointerdown','pointermove','keydown','scroll','touchstart'] as const;for(const name of events)window.addEventListener(name,interact,{passive:true});
  return()=>{alive=false;clearInterval(timer);document.removeEventListener('visibilitychange',visibility);for(const name of events)window.removeEventListener(name,interact)};
 },[choice,loaded,pathname,auth.initializing,auth.user?.id,auth.user?.role]);
 if(!loaded||pathname?.startsWith('/admin'))return null;
 return <>{choice!==null&&!settings?<button className="analytics-preferences" onClick={()=>setSettings(true)} aria-label="Open analytics privacy settings">Privacy</button>:<aside className="analytics-consent" aria-label="Optional visitor analytics"><strong>HELP IMPROVE TRASH PANDA</strong><p>Basic anonymous page counts run without cookies. Allow additional visit statistics? We record pages, referral sites, campaign tags, country and device type. If signed in, visits include your username. A random browser ID recognises repeat visits. Data is kept for up to 90 days. <a href="/privacy">Details</a></p><div><button className="btn outline" onClick={()=>choose('no')}>DECLINE</button><button className="btn lime" onClick={()=>choose('yes')}>ALLOW ANALYTICS</button></div></aside>}</>;
}
