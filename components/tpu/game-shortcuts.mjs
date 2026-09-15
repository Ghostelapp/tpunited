const movementKeys = new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright']);
/** @param {string} key */
export function isMovementKey(key) { return movementKeys.has(key); }
/**
 * UI shortcuts must be handled before the gameplay pause guard.
 * @param {string} key
 * @param {{panel:string,paused:boolean,editing:boolean,suspended:boolean,typing:boolean}} state
 */
export function gameplayShortcut(key, state) {
 if (state.suspended || state.typing) return;
 if (key === 'escape') {
  if (state.panel) return 'close-panel';
  if (state.editing) return 'finish-layout';
  return state.paused ? 'resume' : 'pause';
 }
 if (state.paused || state.panel || state.editing) return;
 switch (key) {
  case 'i': return 'inventory';
  case 'l': return 'daily';
  case 'j': return 'quests';
  case 'c': return 'craft';
  case 'p': return 'legacy';
  case 'e': return 'interact';
  case 'shift': return 'dodge';
  case 'b': return 'bandage';
  case 'q': return 'heal';
 }
}
