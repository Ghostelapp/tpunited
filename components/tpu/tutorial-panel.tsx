'use client';
import {useEffect,useState} from 'react';
import {GameWindow} from './game-window';
import {Sprite} from './sprite';
type Info={steps:{title:string;description:string;done:boolean}[];claimed:boolean;vault:number};
export default function TutorialPanel({open,onClose}:{open:boolean;onClose:()=>void}){
 const [data,setData]=useState<Info|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function load(){const r=await fetch('/api/tutorial');const d=await r.json() as Info&{error:string};if(!r.ok)throw Error(d.error);setData(d)}
 useEffect(()=>{if(open)load().catch(e=>setError(e.message))},[open]);
 async function action(withdraw=false){setBusy(true);setError('');try{const r=await fetch(withdraw?'/api/homestead':'/api/tutorial',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(withdraw?{action:'withdraw',amount:data?.vault}:{})});const d=await r.json() as {error:string};if(!r.ok)throw Error(d.error);await load()}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <GameWindow open={open} onOpenChange={v=>{if(!v)onClose()}} title="GETTING STARTED" description="Scrappy’s guide to your first day in Trash Town.">{error&&<p className="error" role="alert">{error}</p>}{data?<><ol className="tutorial-steps">{data.steps.map(s=><li key={s.title} className={s.done?'complete':''}><strong>{s.done?'✓ ':''}{s.title}</strong><p>{s.description}</p></li>)}</ol><div className="tutorial-reward"><Sprite sheet={10} x={633} y={692} w={69} h={103} width={40}/><div><strong>WELCOME PLANTER</strong><p>A regular decoration for the entrance of your owned parcels. No NFT purchase required.</p></div></div><button className="btn lime" disabled={busy||data.claimed||!data.steps.every(s=>s.done)} onClick={()=>action()}>{data.claimed?'REWARD UNLOCKED':'CLAIM WELCOME PLANTER'}</button>{data.vault>0&&<button className="btn outline" disabled={busy} onClick={()=>action(true)}>WITHDRAW {data.vault} STORED SCRAP</button>}</>:<p>Loading progress…</p>}<button className="text-link" disabled={busy} onClick={()=>load().catch(e=>setError(e.message))}>CHECK PROGRESS</button></GameWindow>
}
