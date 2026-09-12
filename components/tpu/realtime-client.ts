import type {Input,ServerMessage,Snapshot} from '@/packages/realtime/protocol';

// A reconnect starts a new sequence and discards unacknowledged input. Never replay
// an uncertain purchase, heal or reward on a different connection.
export class RealtimeClient {
 private socket?:WebSocket;
 private retry?:ReturnType<typeof setTimeout>;
 private heartbeat?:ReturnType<typeof setInterval>;
 private stopped=false;
 private attempt=0;
 private lastMessage=0;
 private opened=false;
 constructor(private receive:(message:Snapshot)=>void,private status:(connected:boolean,message:string)=>void){}
 start(){this.connect();return this;}
 private connect(){
  if(this.stopped)return;
  this.opened=false;this.status(false,'Connecting to the shared world…');
  const url=new URL('/api/game/socket',window.location.href);url.protocol=url.protocol==='https:'?'wss:':'ws:';
  const socket=new WebSocket(url);this.socket=socket;this.lastMessage=Date.now();
  socket.onopen=()=>{this.lastMessage=Date.now();};
  socket.onmessage=event=>{
   if(this.stopped||this.socket!==socket)return;
   this.lastMessage=Date.now();
   try{
    const message=JSON.parse(event.data) as ServerMessage;
    if(message.type==='snapshot'){
     if(!this.opened){this.opened=true;message.reset=true;this.attempt=0;}
     this.receive(message);this.status(true,'');
    }else if(message.type==='chat')window.dispatchEvent(new CustomEvent('tpu-chat-realtime',{detail:message.messages}));
    else if(message.type==='error'){this.status(false,message.error);socket.close(1011,'World synchronization interrupted');}
   }catch{socket.close(1002,'Invalid server message');}
  };
  socket.onclose=event=>{
   if(this.stopped||this.socket!==socket)return;
   this.opened=false;
   if(event.code===4009||event.code===1008){this.stopped=true;this.status(false,event.reason||'Connection closed. Reload to reconnect.');return;}
   if(event.code===4001){this.stopped=true;this.status(false,'Session expired. Sign in again.');window.dispatchEvent(new Event('tpu-auth-expired'));return;}
   this.status(false,'Disconnected. Reconnecting…');
   this.retry=setTimeout(()=>this.connect(),Math.min(10000,500*2**Math.min(this.attempt++,4))+Math.random()*300);
  };
  clearInterval(this.heartbeat);
  this.heartbeat=setInterval(()=>{
   if(this.stopped)return;
   if(Date.now()-this.lastMessage>10000){this.status(false,'Connection stalled. Reconnecting…');socket.close();return;}
   if(socket.readyState===WebSocket.OPEN)socket.send(JSON.stringify({type:'ping'}));
  },2000);
 }
 send(input:Input){
  if(!this.opened||this.socket?.readyState!==WebSocket.OPEN||this.socket.bufferedAmount>65536)return false;
  this.socket.send(JSON.stringify(input));return true;
 }
 stop(){this.stopped=true;clearInterval(this.heartbeat);clearTimeout(this.retry);this.socket?.close(1000,'Leaving world');}
}
