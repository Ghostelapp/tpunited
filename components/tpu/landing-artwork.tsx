// A responsive viewport into the original atlas, preserving the whole selected asset.
export function LandingArtwork({sheet,x,y,w,h,label}:{sheet:number;x:number;y:number;w:number;h:number;label:string}){
 return <svg className="landing-artwork" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}><svg width={w} height={h} viewBox={`${x} ${y} ${w} ${h}`} overflow="hidden"><image href={`/assets/sheet-${sheet}.webp?v=raccoon-20260914`} width="1254" height="1254"/></svg></svg>;
}
