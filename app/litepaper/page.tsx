import type {Metadata} from 'next';
import paper from '@/content/litepaper.json';
import styles from './litepaper.module.css';

export const metadata:Metadata={title:'Litepaper v0.1 | Trash Panda United',description:paper.summary};
const pdf='/docs/trash-panda-united-litepaper-v0.1.pdf';

export default function Litepaper(){return <div className={styles.paper}>
 <header className={styles.top}><a href="/home" aria-label="Trash Panda United home">TRASH PANDA <strong>UNITED ///</strong></a><a href={pdf} download>DOWNLOAD PDF ↓</a></header>
 <main id="main">
  <section className={styles.hero} aria-labelledby="paper-title">
   <div className={styles.heroCopy}><p className={styles.kicker}>{paper.edition} / V{paper.version}</p><h1 id="paper-title">TRASH PANDA<br/><span>UNITED.</span></h1><p className={styles.tagline}>{paper.tagline}</p><p>{paper.intro}</p><div className={styles.actions}><a href={pdf} download>GET THE LITEPAPER ↓</a><a href="#world">READ ONLINE →</a></div><small>{paper.date} · Base Sepolia · Alpha</small></div>
  </section>
  <div className={styles.layout}>
   <nav className={styles.contents} aria-label="Litepaper chapters"><p>FIELD NOTES / INDEX</p>{paper.chapters.map(ch=><a key={ch.id} href={'#'+ch.id}><span>{ch.number}</span>{ch.title}</a>)}<a href={pdf} download>PDF / 8 PAGES ↓</a></nav>
   <div className={styles.chapters}>
    <div className={styles.intro}><p>{paper.summary}</p><small>{paper.statusNote}</small></div>
    {paper.chapters.map(ch=><section id={ch.id} key={ch.id} className={styles.chapter} aria-labelledby={ch.id+'-title'}>
     <p className={styles.kicker}>{ch.number} / {ch.eyebrow}</p><h2 id={ch.id+'-title'}>{ch.title}</h2><p className={styles.lead}>{ch.lead}</p>
     {ch.visual==='loop'&&<ol className={styles.loop} aria-label="Progression loop">{['Explore','Fight','Salvage','Upgrade','Return'].map((label,i)=><li key={label}><span>0{i+1}</span>{label}</li>)}</ol>}
     {ch.visual==='gear'&&<div className={styles.art}><figure><img src="/assets/equipment/neon-blaster.svg" alt="Neon Blaster from the current equipment artwork" width={512} height={512}/><figcaption>NEON BLASTER</figcaption></figure><figure><img src="/assets/equipment/scavenger-hood.svg" alt="Scavenger Hood from the current equipment artwork" width={512} height={512}/><figcaption>SCAVENGER HOOD</figcaption></figure><p>FROM THE CURRENT<br/>ARMORY ARTWORK</p></div>}
     {ch.table&&<div className={styles.tableWrap} role="region" aria-label="Economy layers" tabIndex={0}><table><thead><tr>{ch.table.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{ch.table.rows.map(row=><tr key={row[0]}>{row.map((cell,i)=>i===0?<th key={i} scope="row">{cell}</th>:<td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>}
     <div className={styles.blocks}>{ch.blocks.map(block=><article key={block.title}><h3>{block.title}</h3><p>{block.text}</p></article>)}</div>
     <p className={styles.callout}>{ch.callout}</p>
    </section>)}
    <aside className={styles.sources}><p>EDITION {paper.version} / {paper.date}</p><p>{paper.sourceNote}</p></aside>
   </div>
  </div>
  <section className={styles.join}><p className={styles.kicker}>FOR THE MISFITS. THE MAKERS. THE SCAVENGERS.</p><h2>See you in Trash Town.</h2><div className={styles.actions}>{paper.links.map(link=><a key={link.url} href={link.url}>{link.label} ↗</a>)}</div></section>
 </main><footer className={styles.footer}>TRASH PANDA UNITED / LITEPAPER V{paper.version}<a href="/home">BACK HOME ↑</a></footer>
</div>}
