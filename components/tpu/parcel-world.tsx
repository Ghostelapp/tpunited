'use client';
import {useEffect,useRef,useState,useCallback} from 'react';
import {GameChat} from './game-chat';
import {GameWindow} from './game-window';
import Wallet from './wallet';
import HomesteadPanel from './homestead-panel';
import {TouchStick} from './touch-stick';
import {Frame,UIIcon} from './world-assets';
import {Sprite} from './sprite';
import {useAuth} from './auth-provider';
import DecorationShop from './decoration-shop';
import {footprint} from '@/packages/game-core/parcel-layout';
import {PARCEL_TILE as T,parcelScenery} from '@/packages/game-core/parcel-scenery';
import type {Placement,Decoration} from '@/lib/decorations';
type Data={parcel:{id:number;width:number;height:number;rarity:string};placements:Placement[];buildings:{id:string;x:number;y:number;type:string}[];canEdit:boolean;owner:string|null;home?:{workshop:number;warehouse:number;garden:number};welcomeDecoration?:boolean};
type Point={x:number;y:number};
export default function ParcelWorld({id,onTown,onTravel,suspended=false}:{id:number;onTown:()=>void;onTravel:()=>void;suspended?:boolean}){
 const auth=useAuth();const [chatTyping,setChatTyping]=useState(false),[socialError,setSocialError]=useState(''),[visitors,setVisitors]=useState(0);const peers=useRef<{username:string;x:number;y:number;drawX:number;drawY:number}[]>([]);const [manage,setManage]=useState(false);
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[edit,setEdit]=useState(false),[shop,setShop]=useState(false),[selected,setSelected]=useState<Decoration|null>(null),[rotation,setRotation]=useState(0),[ready,setReady]=useState(false);
 const [stats,setStats]=useState<{hp:number;level?:number}|null>(null);
 const canvas=useRef<HTMLCanvasElement>(null),viewport=useRef<HTMLDivElement>(null),position=useRef<Point>({x:0,y:0}),camera=useRef<Point>({x:0,y:0}),target=useRef<Point|null>(null),hover=useRef<Point|null>(null),keys=useRef(new Set<string>()),analog=useRef<Point>({x:0,y:0});
 const images=useRef<Record<string,HTMLImageElement>>({}),transform=useRef({x:0,y:0,zoom:1,w:0,h:0});
 const live=useRef({data,edit,selected,rotation,paused:false,stats,name:''});live.current={data,edit,selected,rotation,paused:suspended||shop||manage||busy||chatTyping,stats,name:auth.user?.username??'Scavenger'};
 useEffect(()=>{fetch('/api/homestead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'visit',parcel:id})}).catch(()=>{})},[id]);
 const load=useCallback(async()=>{const r=await fetch(`/api/parcel?id=${id}`);const d=await r.json() as Data&{error:string};if(!r.ok)throw Error(d.error);setData(d);return d},[id]);
 useEffect(()=>{const controller=new AbortController();let alive=true;load().catch(e=>{if(alive)setError(e.message)});const timer=setInterval(()=>load().catch(e=>{if(alive){setError(e.message);setData(null)}}),30000);fetch('/api/game',{signal:controller.signal}).then(async r=>{if(!r.ok)return;const d=await r.json() as {character?:{state:{hp:number;level?:number}}};if(alive&&d.character)setStats({hp:d.character.state.hp,level:d.character.state.level})}).catch(()=>{});return()=>{alive=false;controller.abort();clearInterval(timer)}},[load]);
 useEffect(()=>{let alive=true;Promise.all([1,4,7,10].map(n=>new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>{images.current[String(n)]=image;resolve()};image.onerror=()=>reject(Error('Could not load world graphics. Reload to retry.'));image.src=`/assets/sheet-${n}.webp`;}))).then(()=>{if(alive)setReady(true)}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[]);
 useEffect(()=>{for(const p of [...(data?.placements??[]),...(selected?[selected]:[])])if(!images.current[p.image]){const im=new Image();im.src=p.image;images.current[p.image]=im}},[data,selected]);
 useEffect(()=>{if(!data||!ready||!canvas.current||!viewport.current)return;
  const c=canvas.current,g=c.getContext('2d');if(!g)return;
  const mapW=data.parcel.width*T,mapH=data.parcel.height*T;
  position.current={x:mapW/2,y:mapH-2*T};camera.current={...position.current};
  const scenery=parcelScenery(id,data.parcel.width,data.parcel.height);
  const ground=document.createElement('canvas');ground.width=mapW;ground.height=mapH;const gg=ground.getContext('2d')!;gg.fillStyle='#283239';gg.fillRect(0,0,mapW,mapH);gg.globalAlpha=.2;
  for(let y=0;y<mapH;y+=64)for(let x=0;x<mapW;x+=64){gg.save();gg.translate(x+(x/64%2?64:0),y+(y/64%2?64:0));gg.scale(x/64%2?-1:1,y/64%2?-1:1);gg.drawImage(images.current['10'],555,53,64,64,0,0,64,64);gg.restore()}gg.globalAlpha=1;
  let w=0,h=0,frame=0,last=performance.now(),distance=0,face=1;
  const resize=()=>{const r=viewport.current!.getBoundingClientRect();w=r.width;h=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);c.width=w*dpr;c.height=h*dpr;g.setTransform(dpr,0,0,dpr,0,0);g.imageSmoothingEnabled=false};
  const observer=new ResizeObserver(resize);observer.observe(viewport.current);resize();
  const clear=()=>{keys.current.clear();analog.current={x:0,y:0};target.current=null};
  const down=(e:KeyboardEvent)=>{if(live.current.paused||document.querySelector('[role="dialog"]'))return;if((e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]'))return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();keys.current.add(key);target.current=null}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
  const sprite=(sheet:number,sx:number,sy:number,sw:number,sh:number,x:number,y:number,dw:number,dh:number)=>g.drawImage(images.current[String(sheet)],sx,sy,sw,sh,x,y,dw,dh);
  function tick(now:number){const dt=Math.min((now-last)/1000,.04);last=now;const state=live.current;const d=state.data;if(!d){frame=requestAnimationFrame(tick);return}
   const boxes=d.placements.map(p=>({x:p.x*T,y:p.y*T,w:(p.rotation%180?p.height:p.width)*T,h:(p.rotation%180?p.width:p.height)*T})).concat(d.buildings.map(b=>({x:b.x*4*T,y:b.y*4*T,w:4*T,h:4*T})));
   const modules:{key:string;level:number;x:number;y:number;w:number;h:number}[]=[];
   for(const key of ['workshop','warehouse','garden'] as const){const level=d.home?.[key]??0;if(!level)continue;let placed=false;for(let y=2*T;y<mapH-6*T&&!placed;y+=5*T)for(let x=2*T;x<mapW-5*T;x+=5*T){const m={key,level,x,y,w:3*T,h:3*T};if([...boxes,...modules].some(b=>x<b.x+b.w&&x+m.w>b.x&&y<b.y+b.h&&y+m.h>b.y))continue;modules.push(m);placed=true;break}}
   boxes.push(...modules);
   const visibleScenery=scenery.filter(s=>!boxes.some(b=>s.x*T+48>b.x&&s.x*T-48<b.x+b.w&&s.y*T+20>b.y&&s.y*T-70<b.y+b.h));
   const sceneryBoxes=visibleScenery.map(s=>({x:s.x*T-15,y:s.y*T-10,w:30,h:16}));
   const free=(x:number,y:number)=>x>=14&&y>=14&&x<=mapW-14&&y<=mapH-14&&![...boxes,...sceneryBoxes].some(b=>x+9>b.x&&x-9<b.x+b.w&&y+5>b.y&&y-5<b.y+b.h);
   const p=position.current;if(!free(p.x,p.y)){outer:for(let y=mapH-16;y>0;y-=T)for(let x=16;x<mapW;x+=T)if(free(x,y)){p.x=x;p.y=y;break outer}}
   let dx=0,dy=0,moving=false;
   if(state.paused||document.querySelector('[role="dialog"]'))clear();else{dx=Number(keys.current.has('d')||keys.current.has('arrowright'))-Number(keys.current.has('a')||keys.current.has('arrowleft'))+analog.current.x;dy=Number(keys.current.has('s')||keys.current.has('arrowdown'))-Number(keys.current.has('w')||keys.current.has('arrowup'))+analog.current.y;
    let maxStep=190*dt;if(!dx&&!dy&&target.current){dx=target.current.x-p.x;dy=target.current.y-p.y;const dist=Math.hypot(dx,dy);maxStep=Math.min(maxStep,dist);if(dist<3){target.current=null;dx=dy=0}}
    const len=Math.hypot(dx,dy);if(len){const step=maxStep*Math.min(1,len);dx=dx/len*step;dy=dy/len*step;const before={...p};if(free(p.x+dx,p.y))p.x+=dx;if(free(p.x,p.y+dy))p.y+=dy;const moved=Math.hypot(p.x-before.x,p.y-before.y);distance+=moved;moving=moved>.01;if(moving&&dx)face=dx<0?-1:1;if(!moving)target.current=null}}
   const zoom=w<600?.65:w<850?.8:1;camera.current.x+=(p.x-camera.current.x)*(1-Math.exp(-dt*10));camera.current.y+=(p.y-camera.current.y)*(1-Math.exp(-dt*10));const halfW=Math.min(mapW/2,w/zoom/2),halfH=Math.min(mapH/2,h/zoom/2);camera.current.x=Math.max(halfW,Math.min(mapW-halfW,camera.current.x));camera.current.y=Math.max(halfH,Math.min(mapH-halfH,camera.current.y));transform.current={x:camera.current.x,y:camera.current.y,zoom,w,h};
   g!.clearRect(0,0,w,h);g!.fillStyle='#09151c';g!.fillRect(0,0,w,h);g!.save();g!.translate(w/2,h/2);g!.scale(zoom,zoom);g!.translate(-camera.current.x,-camera.current.y);g!.drawImage(ground,0,0);
   // Fence assets frame each private map, with an open entrance at the bottom.
   for(let x=0;x<mapW;x+=64){sprite(7,371,1075,91,75,x,-26,64,52);if(Math.abs(x-mapW/2)>70)sprite(7,371,1075,91,75,x,mapH-30,64,52)}
   g!.strokeStyle='#586963';g!.lineWidth=5;g!.strokeRect(1,1,mapW-2,mapH-2);
   const objects:{y:number;draw:()=>void}[]=[];
   for(const s of visibleScenery){const x=s.x*T,y=s.y*T;objects.push({y,draw:()=>{if(s.kind===0)sprite(7,325,984,93,49,x-35,y-37,70,37);else if(s.kind===1)sprite(10,633,692,69,103,x-17,y-50,34,50);else if(s.kind===2)sprite(7,8,940,45,93,x-15,y-62,30,62);else sprite(7,235,942,87,90,x-24,y-51,49,51)}})}
   if(d.welcomeDecoration)objects.push({y:mapH-40,draw:()=>{sprite(10,633,692,69,103,mapW/2+48,mapH-92,34,50);g!.fillStyle='#c8f76b';g!.font='11px monospace';g!.fillText('WELCOME',mapW/2+65,mapH-100)}});
   for(const m of modules)objects.push({y:m.y+m.h,draw:()=>{const size=60+m.level*12;if(m.key==='garden'){for(let i=0;i<m.level;i++)sprite(10,633,692,69,103,m.x+i*24,m.y+35,26,40)}else sprite(4,3,177,239,227,m.x,m.y+m.h-size,size,size);g!.textAlign='center';g!.font='11px monospace';g!.fillStyle='#d9efac';g!.fillText(`${m.key.toUpperCase()} ${m.level}`,m.x+m.w/2,m.y+m.h+15)}});
   for(const b of d.buildings)objects.push({y:(b.y*4+4)*T,draw:()=>sprite(4,3,177,239,227,b.x*4*T,b.y*4*T,4*T,4*T)});
   for(const item of d.placements){const bw=(item.rotation%180?item.height:item.width)*T,bh=(item.rotation%180?item.width:item.height)*T;objects.push({y:item.y*T+bh,draw:()=>{const im=images.current[item.image];g!.save();g!.translate(item.x*T+bw/2,item.y*T+bh/2);g!.rotate(item.rotation*Math.PI/180);if(im?.complete&&im.naturalWidth)g!.drawImage(im,-item.width*T/2,-item.height*T/2,item.width*T,item.height*T);g!.restore();if(state.edit){g!.strokeStyle=state.selected?.id===item.item_id?'#c8f76b':'#628786';g!.strokeRect(item.x*T,item.y*T,bw,bh)}}})}
   for(const peer of peers.current){const dx=peer.x-peer.drawX,dy=peer.y-peer.drawY;peer.drawX+=dx*(1-Math.exp(-dt*6));peer.drawY+=dy*(1-Math.exp(-dt*6));const walking=Math.hypot(dx,dy)>2;objects.push({y:peer.drawY,draw:()=>{g!.save();g!.translate(peer.drawX,peer.drawY);g!.fillStyle='#0007';g!.beginPath();g!.ellipse(0,1,23,9,0,0,Math.PI*2);g!.fill();g!.save();g!.scale(dx<0?-1:1,1);if(walking){const f=Math.floor(now/130)%8,starts=[513,611,700,789,879,966,1055,1144],widths=[97,89,89,89,87,89,89,96];sprite(1,starts[f],204,widths[f],154,-widths[f]*.26,-78,widths[f]*.52,80)}else sprite(1,15,204,115,154,-30,-78,60,80);g!.restore();g!.textAlign='center';g!.font='12px monospace';g!.fillStyle='#78e2df';g!.fillText(peer.username,0,-90);g!.restore()}})}
   objects.push({y:p.y,draw:()=>{g!.fillStyle='#0007';g!.beginPath();g!.ellipse(p.x,p.y+1,23,9,0,0,Math.PI*2);g!.fill();g!.save();g!.translate(p.x,p.y);g!.scale(face,1);if(moving){const f=Math.floor(distance/20)%8,starts=[513,611,700,789,879,966,1055,1144],widths=[97,89,89,89,87,89,89,96];sprite(1,starts[f],204,widths[f],154,-widths[f]*.26,-78,widths[f]*.52,80)}else sprite(1,15,204,115,154,-30,-78,60,80);g!.restore();g!.textAlign='center';g!.font='12px monospace';g!.fillStyle='#e6f2cd';g!.fillText(state.name,p.x,p.y-108);if(state.stats){g!.fillStyle='#081319';g!.fillRect(p.x-32,p.y-99,64,10);g!.fillStyle='#b9ee70';g!.fillRect(p.x-30,p.y-97,60*Math.max(0,Math.min(100,state.stats.hp))/100,6)}}});objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
   if(state.edit&&state.selected&&hover.current){const at=hover.current;let valid=true;try{footprint(at.x,at.y,state.selected.width,state.selected.height,state.rotation,d.parcel.width,d.parcel.height)}catch{valid=false}const bw=(state.rotation%180?state.selected.height:state.selected.width)*T,bh=(state.rotation%180?state.selected.width:state.selected.height)*T;g!.fillStyle=valid?'#bdf86755':'#ff446655';g!.fillRect(at.x*T,at.y*T,bw,bh)}
   g!.restore();frame=requestAnimationFrame(tick);
  }frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);observer.disconnect();clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear)};
 },[ready,id,!!data]);
 useEffect(()=>{
  if(!data||!ready)return;let alive=true,pending=false;const controller=new AbortController();
  async function heartbeat(){
   if(pending||document.hidden)return;pending=true;
   try{const r=await fetch('/api/parcel/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({parcel:id,...position.current}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(8000)])});const d=await r.json() as {players:{username:string;x:number;y:number}[];error:string};if(!alive)return;
    if(!r.ok){if(r.status===401||r.status===403){setData(null);setError(d.error)}throw Error(d.error||'Could not refresh visitors.')}
    peers.current=d.players.map(p=>{const previous=peers.current.find(v=>v.username===p.username);return {...p,drawX:previous?.drawX??p.x,drawY:previous?.drawY??p.y}});setVisitors(d.players.length);setSocialError('');
   }catch(e){if(alive){peers.current=[];setVisitors(0);setSocialError((e as Error).message)}}finally{pending=false}
  }
  void heartbeat();const timer=setInterval(heartbeat,2000);const visibility=()=>{if(document.hidden){peers.current=[];setVisitors(0)}else void heartbeat()};document.addEventListener('visibilitychange',visibility);
  return()=>{alive=false;controller.abort();clearInterval(timer);document.removeEventListener('visibilitychange',visibility);peers.current=[]};
 },[id,ready,!!data]);
 async function save(action:'place'|'remove',itemId:number,x=0,y=0){if(busy)return;setBusy(true);setError('');try{const r=await fetch('/api/parcel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,itemId,parcel:id,x,y,rotation})});const d=await r.json() as {error:string};if(!r.ok)throw Error(d.error);await load();setSelected(null)}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 const point=(e:React.PointerEvent<HTMLCanvasElement>|React.MouseEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect(),t=transform.current;return{x:(e.clientX-r.left-t.w/2)/t.zoom+t.x,y:(e.clientY-r.top-t.h/2)/t.zoom+t.y}};
 return <main className="game-app parcel-scene"><header className="game-header"><a className="game-back" href="/home" aria-label="Trash Panda United — home"><span>TRASH PANDA <b>UNITED</b></span></a><button className="game-location-button" onClick={onTown}>TOWN</button><span className="tag">PARCEL #{id}</span><button className="game-location-button" onClick={onTravel}>TRAVEL</button><Wallet/></header><div ref={viewport} className="parcel-scene-stage"><canvas ref={canvas} className="parcel-play-canvas" aria-label="Your parcel. Use WASD, arrow keys or tap to move." onPointerMove={e=>{const p=point(e);hover.current={x:Math.floor(p.x/T),y:Math.floor(p.y/T)}}} onPointerLeave={()=>hover.current=null} onClick={e=>{if(live.current.paused||!data||!ready)return;const p=point(e);if(edit&&selected)save('place',selected.id,Math.floor(p.x/T),Math.floor(p.y/T));else if(edit){const found=data.placements.find(i=>p.x>=i.x*T&&p.x<(i.x+(i.rotation%180?i.height:i.width))*T&&p.y>=i.y*T&&p.y<(i.y+(i.rotation%180?i.width:i.height))*T);if(found){setSelected({...found,id:found.item_id});setRotation(found.rotation)}else target.current=p}else target.current=p}}/>
 {data&&ready&&<GameChat key={id} parcel={id} onTyping={setChatTyping}/>}
 {(!data||!ready)&&<div className="parcel-load-overlay" role="status">{error||'Loading parcel…'}</div>}
 <div className="parcel-player-hud"><Frame/><Sprite width={42}/><div><strong>{auth.user?.username??'Scavenger'}</strong>{stats&&<><div className="parcel-hp"><i style={{width:`${Math.max(0,Math.min(100,stats.hp))}%`}}/></div><small>{stats.hp} / 100 HP</small></>}<small>{data?.canEdit?'YOUR LAND':'PRIVATE PARCEL'} · #{id}</small></div></div>
 <div className="parcel-location-hud"><Frame/><strong>{data?.parcel.rarity??'LAND'}</strong><small>{data?.parcel.width} × {data?.parcel.height} tiles</small><small>WASD / arrows · tap to walk</small><small>{visitors} OTHER VISITORS</small>{socialError&&<small role="status">Visitor connection interrupted</small>}</div>
 <div className="parcel-tools"><button title="Decoration NFTs" aria-label="Decoration NFTs" onClick={()=>setShop(true)}><UIIcon name="bag"/></button>{data?.canEdit&&<button title="Build mode" aria-label="Toggle build mode" aria-pressed={edit} onClick={()=>{setEdit(!edit);setSelected(null)}}><UIIcon name="craft"/></button>}<button title="Travel" aria-label="Travel" onClick={onTravel}><UIIcon name="interact"/></button></div>
 <TouchStick onMove={(x,y)=>{analog.current={x,y};if(x||y)target.current=null}}/>
 <div className="parcel-controls"><Frame/>{error&&data&&<p className="error" role="alert">{error}</p>}{edit&&<p>{selected?`Place ${selected.name}: tap a free tile`:'Select a decoration, or walk to choose a spot.'}</p>}<div className="parcel-control-buttons"><button className="btn outline" onClick={()=>setManage(true)}>HOMESTEAD</button>{data?.canEdit&&<button className="btn outline" onClick={()=>{setEdit(v=>!v);setSelected(null)}}>{edit?'FINISH BUILDING':'EDIT LAND'}</button>}<button className="btn outline" onClick={()=>setShop(true)}>DECORATION NFTS</button>{edit&&selected&&<><button className="btn outline" onClick={()=>setRotation(v=>(v+90)%360)}>ROTATE {rotation}°</button><button className="btn outline" onClick={()=>setSelected(null)}>CANCEL</button>{data?.placements.some(p=>p.item_id===selected.id)&&<button disabled={busy} className="btn outline" onClick={()=>save('remove',selected.id)}>REMOVE</button>}</>}</div></div></div>
 <HomesteadPanel id={id} open={manage} onClose={()=>setManage(false)} onChanged={()=>{load().catch(e=>setError(e.message))}}/>
 <GameWindow open={shop} onOpenChange={setShop} title="DECORATION NFTS" description="Owned NFTs can be placed on your land. The existing scenery is part of the map."><DecorationShop onSelect={data?.canEdit?i=>{setSelected(i);setRotation(0);setEdit(true);setShop(false)}:undefined}/></GameWindow></main>;
}
