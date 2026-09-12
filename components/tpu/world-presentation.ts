export type SpeechMessage={id:string;username:string;message:string;created_at:number};
export type SpeechStore=Map<string,SpeechMessage>;
export const SPEECH_TTL=8000;
export function updateSpeech(store:SpeechStore,messages:SpeechMessage[],now=Date.now()){
 for(const [name,m] of store)if(now-m.created_at>=SPEECH_TTL)store.delete(name);
 for(const m of messages){
  if(!Number.isFinite(m.created_at)||m.created_at>now+1000||now-m.created_at>=SPEECH_TTL)continue;
  const previous=store.get(m.username);
  if(!previous||m.created_at>previous.created_at)store.set(m.username,m);
 }
}
export function speechLines(text:string):string[]{
 const chars=Array.from(text.replace(/\s+/g,' ').trim());
 const clipped=chars.length>90?chars.slice(0,89).join('')+'…':chars.join('');
 const lines:string[]=[];let rest=clipped;
 while(rest){const chars=Array.from(rest);let end=Math.min(30,chars.length);if(end<chars.length){const space=chars.slice(0,end+1).lastIndexOf(' ');if(space>10)end=space;}
 lines.push(chars.slice(0,end).join(''));rest=chars.slice(end).join('').trimStart();}
 return lines.length>3?[...lines.slice(0,2),Array.from(lines[2]).slice(0,29).join('')+'…']:lines;
}
export function drawSpeech(ctx:CanvasRenderingContext2D,store:SpeechStore,name:string,x:number,y:number,now=Date.now()){
 const message=store.get(name);if(!message)return;
 const remaining=SPEECH_TTL-(now-message.created_at);if(remaining<=0){store.delete(name);return;}
 const lines=speechLines(message.message);if(!lines.length)return;
 ctx.save();ctx.font='13px monospace';ctx.textAlign='center';ctx.textBaseline='top';
 ctx.globalAlpha=Math.min(1,remaining/1000);const width=Math.max(...lines.map(line=>ctx.measureText(line).width))+20,height=lines.length*17+16,top=y-124-height;
 ctx.fillStyle='#0b1927f2';ctx.strokeStyle='#96c4b4';ctx.lineWidth=1;
 ctx.fillRect(x-width/2,top,width,height);ctx.strokeRect(x-width/2,top,width,height);
 ctx.beginPath();ctx.moveTo(x-5,top+height);ctx.lineTo(x,top+height+6);ctx.lineTo(x+5,top+height);ctx.fill();
 ctx.fillStyle='#f0f5df';lines.forEach((line,i)=>ctx.fillText(line,x,top+8+i*17));ctx.restore();
}
// World bounds constrain movement, not the camera. Keep the avatar away from edge HUDs.
export function followPlayer(camera:{x:number;y:number},player:{x:number;y:number},dt:number){
 const decay=Math.exp(-Math.max(0,dt)*10);
 return {x:player.x+Math.max(-24,Math.min(24,(camera.x-player.x)*decay)),y:player.y+Math.max(-24,Math.min(24,(camera.y-player.y)*decay))};
}
