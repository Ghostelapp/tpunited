'use client';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
export function TouchStick({onMove}:{onMove:(x:number,y:number)=>void}){
 const [knob,setKnob]=useState({x:0,y:0});const active=useRef<number|null>(null);const moveRef=useRef(onMove);moveRef.current=onMove;
 const reset=()=>{active.current=null;setKnob({x:0,y:0});moveRef.current(0,0)};
 useEffect(()=>{const stop=()=>{active.current=null;setKnob({x:0,y:0});moveRef.current(0,0)};window.addEventListener('blur',stop);document.addEventListener('visibilitychange',stop);return()=>{window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',stop)}},[]);
 const move=(e:PointerEvent<HTMLDivElement>)=>{if(active.current!==e.pointerId)return;e.preventDefault();const r=e.currentTarget.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,len=Math.hypot(x,y),radius=36;const scale=Math.min(1,radius/Math.max(1,len));setKnob({x:x*scale,y:y*scale});moveRef.current(len<8?0:x*scale/radius,len<8?0:y*scale/radius)};
 return <div className="touch-stick" role="group" aria-label="Movement joystick" onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{if(active.current!==null)return;active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);move(e)}} onPointerMove={move} onPointerUp={e=>{if(active.current===e.pointerId)reset()}} onPointerCancel={reset} onLostPointerCapture={reset}><span className="stick-direction">✥</span><span className="stick-knob" style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/><small>MOVE</small></div>
}
