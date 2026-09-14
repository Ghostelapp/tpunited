import test from 'node:test';
import assert from 'node:assert/strict';
import {gameplayShortcut, isMovementKey} from '../components/tpu/game-shortcuts.mjs';
const ready={panel:'',paused:false,editing:false,suspended:false,typing:false};
test('Escape pauses, resumes and closes the active UI first',()=>{
 assert.equal(gameplayShortcut('escape',ready),'pause');
 assert.equal(gameplayShortcut('escape',{...ready,paused:true}),'resume');
 assert.equal(gameplayShortcut('escape',{...ready,panel:'craft',paused:true}),'close-panel');
 assert.equal(gameplayShortcut('escape',{...ready,editing:true}),'finish-layout');
});
test('workshop shortcut matches the displayed C hint',()=>{
 assert.equal(gameplayShortcut('c',ready),'craft');
 for(const state of [{paused:true},{panel:'inventory'},{editing:true},{suspended:true},{typing:true}])
  assert.equal(gameplayShortcut('c',{...ready,...state}),undefined);
});
test('chat and external overlays own Escape and action keys',()=>{
 for(const key of ['escape',' ','e','shift','q','b'])
  for(const state of [{typing:true},{suspended:true}])
   assert.equal(gameplayShortcut(key,{...ready,...state}),undefined);
});
test('movement keys are limited to WASD and arrows',()=>{
 for(const key of ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'])assert.equal(isMovementKey(key),true);
 for(const key of ['c','escape',' ','q','control'])assert.equal(isMovementKey(key),false);
});
