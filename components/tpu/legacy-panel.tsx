'use client';
import {useState} from 'react';
import {LEGACY,legacyFor,legacyCount,type GameState,type Intent} from '@/packages/game-core/world';
import styles from './legacy-panel.module.css';
export function LegacyPanel({state,onAction}:{state:GameState;onAction:(a:Intent)=>void}){
 const [category,setCategory]=useState('All');const l=legacyFor(state),earned=LEGACY.filter(q=>l.unlocked[q.id]!==undefined);
 return <section className={styles.panel}>
 <div className={styles.summary}><strong>{earned.reduce((n,q)=>n+q.points,0)}<small>LEGACY POINTS</small></strong><p>{earned.length} / {LEGACY.length} badges unlocked<br/><small>Permanent achievements. Separate from season points and airdrop ranking.</small></p></div>
 <nav className={styles.categories} aria-label="Achievement categories">{['All',...new Set(LEGACY.map(q=>q.category))].map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
 <div className={styles.cards}>{LEGACY.filter(q=>category==='All'||q.category===category).map(q=>{const unlocked=l.unlocked[q.id]!==undefined,claimed=l.claimed[q.id]!==undefined,pinned=l.pins.includes(q.id),count=Math.min(q.goal,legacyCount(state,q.id));return <article key={q.id} className={unlocked?styles.unlocked:styles.card}>
 <div className={styles.heading}><span className={styles.badge} aria-label={unlocked?'Badge unlocked':'Badge locked'}>{unlocked?'◆':'◇'}</span><div><small>{q.category.toUpperCase()} · {q.points} LP</small><h3>{q.name}</h3></div><button aria-pressed={pinned} disabled={!pinned&&l.pins.length>=3} onClick={()=>onAction({type:'legacy_pin',target:q.id})}>{pinned?'Unpin':'Pin'}</button></div>
 <p>{q.text}</p><progress value={count} max={q.goal} aria-label={`${q.name}: ${count} of ${q.goal}`}/><small>{count} / {q.goal}{unlocked?` · Unlocked ${new Date(l.unlocked[q.id]).toISOString().slice(0,10)}`:''}</small>
 <p className={styles.reward}>TITLE: {q.title}{q.scrap?` · ${q.scrap} SCRAP`:''} · BADGE</p>
 <div className={styles.actions}><button disabled={!unlocked||claimed} onClick={()=>onAction({type:'legacy_claim',target:q.id})}>{claimed?'Reward collected':'Collect reward'}</button>{claimed&&<button aria-pressed={l.title===q.id} onClick={()=>onAction({type:'legacy_title',target:l.title===q.id?undefined:q.id})}>{l.title===q.id?'Hide title':'Wear title'}</button>}</div>
 </article>})}</div><p className={styles.note}>Track up to three goals. Kill totals carry over; discovery and crafting history starts with this update. Mastery requires a new sewer run. Community goals count distinct players, never chat messages.</p>
 </section>;
}
export function LegacyPins({state,onOpen}:{state:GameState;onOpen:()=>void}){return <div className={`legacy-pins ${styles.pins}`}>{legacyFor(state).pins.map(id=>{const q=LEGACY.find(q=>q.id===id);return q?<button key={id} onClick={onOpen}>{q.name} <span>{Math.min(q.goal,legacyCount(state,id))}/{q.goal}</span><progress max={q.goal} value={legacyCount(state,id)} aria-label={q.name}/></button>:null})}</div>}
