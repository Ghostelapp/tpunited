import test from 'node:test';
import assert from 'node:assert/strict';
import {drawRaccoonSkin} from '../components/tpu/raccoon-skin.ts';
import {drawAdminSkin} from '../components/tpu/admin-skin.ts';

test('both outfits keep all frames inside the atlas and feet fixed through state changes',()=>{
 const calls: number[][]=[];
 const ctx={drawImage:(_image:unknown,...args:number[])=>calls.push(args)} as unknown as CanvasRenderingContext2D;
 const image={} as HTMLImageElement;
 for(const draw of [drawRaccoonSkin,drawAdminSkin]){
  for(const walking of [false,true]){
   for(const age of [-1,0,87.5,175,262.5,349.99,350,Infinity]){
    for(const distance of [0,20,40,60,80,10000]){
     draw(ctx,image,walking,distance,age,900);
     const [sx,sy,sw,sh,dx,dy,dw,dh]=calls.at(-1)!;
     assert.ok(sx>=0&&sx+sw<=1536&&sy>=0&&sy+sh<=1152);
     assert.equal(dx+192*dw/sw,0);
     assert.equal(dy+352*dh/sh,0);
     assert.equal(sy,age>=0&&age<350?768:walking?384:0);
    }
   }
  }
 }
});

test('attack completes all four poses and returns to idle at the cooldown boundary',()=>{
 const starts:number[]=[];
 const ctx={drawImage:(_image:unknown,x:number)=>starts.push(x)} as unknown as CanvasRenderingContext2D;
 for(const age of [0,87.5,175,262.5,350])drawRaccoonSkin(ctx,{} as HTMLImageElement,false,0,age,0);
 assert.deepEqual(starts,[0,384,768,1152,0]);
});
