import type { CSSProperties } from 'react';
export function Sprite({sheet=1,x=356,y=202,w=125,h=158,width=90,className=''}:{sheet?:number;x?:number;y?:number;w?:number;h?:number;width?:number;className?:string}) {
 const scale=width/w;
 return <span aria-hidden="true" className={`sprite ${className}`} style={{display:'inline-block',flexShrink:0,width,height:h*scale,backgroundImage:`url(/assets/sheet-${sheet}.webp?v=raccoon-20260914)`,backgroundSize:`${1254*scale}px ${1254*scale}px`,backgroundPosition:`${-x*scale}px ${-y*scale}px`,backgroundRepeat:'no-repeat',imageRendering:'pixelated'} as CSSProperties}/>;
}
