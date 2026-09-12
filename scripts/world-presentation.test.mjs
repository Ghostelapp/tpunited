import test from 'node:test';
import assert from 'node:assert/strict';
import {followPlayer,updateSpeech,speechLines,drawSpeech} from '../components/tpu/world-presentation.ts';

test('camera follows all map edges and corners, including maps smaller than the viewport',()=>{
 for(const [width,height] of [[2400,1800],[800,600],[1400,1000],[280,280]]){
  for(const x of [14,width/2,width-14])for(const y of [14,height/2,height-14]){
   const p={x,y};let c={x:width/2,y:height/2};
   c=followPlayer(c,p,.016);
   assert.ok(Math.abs(c.x-x)<=24&&Math.abs(c.y-y)<=24);
   for(let i=0;i<120;i++)c=followPlayer(c,p,.016);
   assert.ok(Math.hypot(c.x-x,c.y-y)<.01);
  }
 }
});
test('only recent messages are displayed and stale poll responses cannot replace newer speech',()=>{
 const now=100000,store=new Map();
 const m=(id,created_at)=>({id,username:'Panda',message:id,created_at});
 updateSpeech(store,[m('expired',now-9000),m('future',now+9000)],now);
 assert.equal(store.size,0);
 updateSpeech(store,[m('new',now-100),m('older',now-200)],now);
 assert.equal(store.get('Panda').id,'new');
 updateSpeech(store,[m('older',now-200)],now+1000);
 assert.equal(store.get('Panda').id,'new');
 updateSpeech(store,[],now+8000);assert.equal(store.size,0);
});
test('speech wraps and truncates long text without splitting emoji',()=>{
 for(const text of ['hello','word '.repeat(80),'x'.repeat(400),'🐼'.repeat(100),'\n\t']){
  const lines=speechLines(text);assert.ok(lines.length<=3);
  assert.ok(lines.every(line=>Array.from(line).length<=30));
  assert.ok(lines.every(line=>!line.includes('\n')&&line.isWellFormed()));
 }
});
test('expired speech is removed without drawing',()=>{
 const store=new Map([['Panda',{id:'1',username:'Panda',message:'hello',created_at:0}]]);
 drawSpeech({},store,'Panda',0,0,8000);assert.equal(store.size,0);
});
