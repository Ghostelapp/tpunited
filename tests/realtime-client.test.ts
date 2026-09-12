import test from 'node:test';
import assert from 'node:assert/strict';
import {RealtimeClient} from '../components/tpu/realtime-client.ts';
import type {Input} from '../packages/realtime/protocol';

test('client waits for authority, reconnects without replay, and stops on takeover',t=>{
 t.mock.timers.enable({apis:['setTimeout','setInterval','Date']});
 const globals=globalThis as unknown as Record<string,unknown>,oldWindow=globals.window,oldSocket=globals.WebSocket;
 class Socket {
  static OPEN=1;static instances:Socket[]=[];
  readyState=1;bufferedAmount=0;sent:string[]=[];
  onopen?:()=>void;onmessage?:(event:{data:string})=>void;onclose?:(event:{code:number;reason:string})=>void;
  constructor(public url:string){Socket.instances.push(this);}
  send(data:string){this.sent.push(data);}
  close(code=1000,reason=''){this.readyState=3;this.onclose?.({code,reason});}
  snapshot(tick:number){this.onmessage?.({data:JSON.stringify({type:'snapshot',tick,ack:0})});}
 }
 globals.WebSocket=Socket;globals.window=Object.assign(new EventTarget(),{location:{href:'https://game.test/game'}});
 const resets:boolean[]=[],status:boolean[]=[];
 const client=new RealtimeClient(s=>resets.push(!!s.reset),connected=>status.push(connected)).start();
 const input:Input={type:'input',seq:1,scene:-1,action:{type:'heal'},motion:[]};
 try{
  const first=Socket.instances[0];assert.equal(String(first.url),'wss://game.test/api/game/socket');
  assert.equal(client.send(input),false);first.onopen?.();assert.equal(client.send(input),false);
  first.snapshot(1);assert.equal(client.send(input),true);assert.deepEqual(resets,[true]);
  first.snapshot(2);assert.deepEqual(resets,[true,false]);
  first.close(1006,'network lost');assert.equal(status.at(-1),false);assert.equal(client.send(input),false);
  t.mock.timers.tick(1000);const second=Socket.instances[1];assert.ok(second);assert.deepEqual(second.sent,[]);
  second.snapshot(3);assert.equal(resets.at(-1),true);assert.equal(second.sent.length,0,'uncertain heal must not be replayed');
  second.bufferedAmount=70000;assert.equal(client.send(input),false);second.bufferedAmount=0;
  second.close(4009,'Another tab');t.mock.timers.tick(20000);assert.equal(Socket.instances.length,2);
 }finally{client.stop();globals.window=oldWindow;globals.WebSocket=oldSocket;}
});
