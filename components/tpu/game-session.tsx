'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Game from './game';
import TutorialPanel from './tutorial-panel';
import ParcelWorld from './parcel-world';
import Wallet from './wallet';
import {GameWindow} from './game-window';
import DecorationShop from './decoration-shop';
import {useAuth} from './auth-provider';
type Plot={id:number;width:number;height:number;rarity:string;owner:string|null};
export default function GameSession(){
 const a=useAuth();const request=useRef(0);const [parcelNumber,setParcelNumber]=useState('');const [visitError,setVisitError]=useState('');const [entering,setEntering]=useState(false);const [visits,setVisits]=useState<{parcel:number}[]>([]);const [scene,setScene]=useState<'town'|number|null>(null),[menu,setMenu]=useState<'travel'|'decorations'|'tutorial'|null>('travel'),[plots,setPlots]=useState<Plot[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const refresh=useCallback(async()=>{
  const current=++request.current;setLoading(true);setError('');setVisitError('');setPlots([]);setVisits([]);
  const address=a.user?.wallet.address.toLowerCase();
  try{
   const results=await Promise.allSettled([
    fetch('/api/land').then(async r=>{const d=await r.json() as {parcels?:Plot[];error?:string};if(!r.ok)throw Error(d.error||'Could not load your land.');return (d.parcels??[]).filter(p=>address&&p.owner?.toLowerCase()===address)}),
    fetch('/api/homestead').then(async r=>{const d=await r.json() as {parcels?:{parcel:number}[];error?:string};if(!r.ok)throw Error(d.error||'Could not load parcel invitations.');return d.parcels??[]})
   ]);
   if(current!==request.current)return;
   const [land,visits]=results;
   if(land.status==='fulfilled')setPlots(land.value);else setError(land.reason instanceof Error?land.reason.message:'Could not load your land.');
   if(visits.status==='fulfilled')setVisits(visits.value);else setVisitError(visits.reason instanceof Error?visits.reason.message:'Could not load parcel invitations.');
  }finally{if(current===request.current)setLoading(false)}
 },[a.user?.wallet.address]);
 useEffect(()=>()=>{request.current++},[]);
 useEffect(()=>{const params=new URLSearchParams(window.location.search),id=Number(params.get('parcel'));if(Number.isInteger(id)&&id>0&&id<=100){setScene(id);setMenu(null)}else if(params.get('menu')==='decorations')setMenu('decorations');const listener=(e:Event)=>setMenu((e as CustomEvent).detail==='decorations'?'decorations':'travel');window.addEventListener('tpu-game-menu',listener);return()=>window.removeEventListener('tpu-game-menu',listener)},[]);
 useEffect(()=>{if(menu==='travel')void refresh();return()=>{request.current++}},[menu,refresh]);
 async function enter(id:number,owned=true){if(!Number.isInteger(id)||id<1||id>100){setError('Enter a parcel number from 1 to 100.');return}setEntering(true);setError('');try{const r=await fetch(`/api/parcel?id=${id}`);const d=await r.json() as {canEdit:boolean;error:string};if(!r.ok)throw Error(d.error);if(owned&&!d.canEdit)throw Error('This wallet no longer owns that parcel. Refresh your land list.');setScene(id);setMenu(null);window.history.replaceState(null,'','/game')}catch(e){setError((e as Error).message)}finally{setEntering(false)}}
 const availableVisits=visits.filter(v=>!plots.some(p=>p.id===v.parcel));
 const close=(v:boolean)=>{if(!v&&scene!==null)setMenu(null)};
 return <>{scene==='town'?<Game suspended={menu!==null} onTravel={()=>setMenu('travel')}/>:typeof scene==='number'?<ParcelWorld key={scene} id={scene} suspended={menu!==null} onTravel={()=>setMenu('travel')} onTown={()=>{setScene('town');setMenu(null);window.history.replaceState(null,'','/game')}}/>:<div className="game-app game-entry"><header className="game-header"><a className="game-back" href="/">TRASH PANDA <b>UNITED</b></a><Wallet/></header></div>}
 <button className="game-tutorial-trigger" onClick={()=>setMenu('tutorial')}>GETTING STARTED</button><TutorialPanel open={menu==='tutorial'} onClose={()=>setMenu(scene===null?'travel':null)}/>
 <GameWindow open={menu==='travel'} onOpenChange={close} title="CHOOSE YOUR DESTINATION" description="Start in Trash Town or enter your own parcel."><button className="destination-town" onClick={()=>{setScene('town');setMenu(null);window.history.replaceState(null,'','/game')}}><span>TRASH TOWN</span><small>Quests, combat and the town square</small></button><h3 className="destination-label">MY LAND</h3>{loading&&<p role="status">Checking your parcels…</p>}{error&&<p className="error" role="alert">{error}</p>}<div className="destination-grid">{plots.map(p=><button className="destination-card" disabled={loading||entering} key={p.id} onClick={()=>enter(p.id)}><img src={`/assets/land-nft/${p.id}.png`} alt=""/><strong>PARCEL #{p.id}</strong><small>{p.width} × {p.height} · {p.rarity}</small></button>)}</div>{!loading&&!error&&!plots.length&&<p>You do not own a parcel yet. You can enter Trash Town now.</p>}<button className="text-link" disabled={loading||entering} onClick={refresh}>REFRESH LAND & INVITATIONS</button><a className="text-link" href="/land">BROWSE LAND SALES</a><a className="text-link" href="/marketplace">PLAYER MARKETPLACE</a><h3 className="destination-label">VISIT OTHER PARCELS</h3><p>Public parcels and invitations. Access is checked when you enter.</p><div className="destination-grid">{availableVisits.map(v=><button className="destination-card" disabled={loading||entering} key={v.parcel} onClick={()=>enter(v.parcel,false)}>VISIT PARCEL #{v.parcel}</button>)}</div>{visitError&&<p className="error" role="alert">{visitError}</p>}{!loading&&!visitError&&!availableVisits.length&&<p>No other parcels are open for visits yet.</p>}<form className="parcel-visit-form" onSubmit={e=>{e.preventDefault();void enter(Number(parcelNumber),false)}}><label htmlFor="visit-parcel-number">VISIT BY PARCEL NUMBER</label><input id="visit-parcel-number" type="number" min="1" max="100" step="1" required value={parcelNumber} onChange={e=>setParcelNumber(e.target.value)} placeholder="1–100"/><button className="btn lime" disabled={entering||loading}>{entering?'CHECKING ACCESS…':'VISIT PARCEL'}</button><p>Private parcels require an invitation from their owner.</p></form><a className="text-link" href="/">TRASH PANDA UNITED · BACK TO HOME</a></GameWindow>
 <GameWindow open={menu==='decorations'} onOpenChange={v=>{if(!v)setMenu(scene===null?'travel':null)}} title="DECORATION NFTS" description="Buy decorations and manage the NFTs in your wallet."><DecorationShop/></GameWindow></>;
}
