'use client';
import {useEffect,type RefObject} from 'react';
const selectors=['game-chat','player-hud','quest-hud','game-tools','action-bar','game-message','touch-stick','minimap-anchor','boss-anchor','game-announcements'];
export function useHudLayout(root:RefObject<HTMLDivElement|null>,editing:boolean,ready:boolean,message:string,reset:number){
 useEffect(()=>{const host=root.current;if(!host||!ready)return;const key=()=>`tpu-hud-v1-${host.clientWidth<850?'mobile':'desktop'}`;let saved:Record<string,{x:number;y:number}>={};let drag:{el:HTMLElement;id:number;x:number;y:number;left:number;top:number}|null=null;
 const elements=selectors.flatMap(name=>{const el=host.querySelector<HTMLElement>(`.${name}`);if(!el)return [];el.dataset.hud=name;return [el]});
 const place=(el:HTMLElement,x:number,y:number)=>{const left=Math.max(6,Math.min(host.clientWidth-el.offsetWidth-6,x)),top=Math.max(6,Math.min(host.clientHeight-el.offsetHeight-6,y));Object.assign(el.style,{left:`${left}px`,top:`${top}px`,right:'auto',bottom:'auto',transform:'none'});return {x:left/host.clientWidth,y:top/host.clientHeight}};
 const restore=()=>{try{saved=JSON.parse(localStorage.getItem(key())||'{}');if(!saved||typeof saved!=='object'||Array.isArray(saved))saved={}}catch{saved={}}for(const el of elements){for(const p of ['left','top','right','bottom','transform'])el.style.removeProperty(p);const p=saved[el.dataset.hud!];if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))place(el,p.x*host.clientWidth,p.y*host.clientHeight)}};restore();
 const down=(e:PointerEvent)=>{if(!editing)return;const el=(e.target as HTMLElement).closest<HTMLElement>('[data-hud]');if(!el||!host.contains(el))return;e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect(),h=host.getBoundingClientRect();drag={el,id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left-h.left,top:r.top-h.top};el.setPointerCapture(e.pointerId)};
 const move=(e:PointerEvent)=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();saved[drag.el.dataset.hud!]=place(drag.el,drag.left+e.clientX-drag.x,drag.top+e.clientY-drag.y)};
 const up=(e:PointerEvent)=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();try{localStorage.setItem(key(),JSON.stringify(saved))}catch{}drag=null};
 const click=(e:MouseEvent)=>{if(editing&&(e.target as HTMLElement).closest('[data-hud]')){e.preventDefault();e.stopPropagation()}};
 const obs=new ResizeObserver(restore);obs.observe(host);for(const el of elements)obs.observe(el);host.addEventListener('pointerdown',down,true);host.addEventListener('pointermove',move,true);host.addEventListener('pointerup',up,true);host.addEventListener('pointercancel',up,true);host.addEventListener('click',click,true);
 return()=>{obs.disconnect();host.removeEventListener('pointerdown',down,true);host.removeEventListener('pointermove',move,true);host.removeEventListener('pointerup',up,true);host.removeEventListener('pointercancel',up,true);host.removeEventListener('click',click,true)};
 },[root,editing,ready,message,reset]);
}
