// Authored town furniture. Feet coordinates and collision footprints are shared
// by the renderer, authoritative movement and monster navigation.
export type TownProp={sx:number;sy:number;sw:number;sh:number;x:number;y:number;w:number;h:number;solid?:{w:number;h:number}};
export const TOWN_PROPS:TownProp[]=[
 // Street market west of the tavern: two stalls around an open courtyard.
 {sx:16,sy:1071,sw:122,sh:79,x:180,y:750,w:122,h:79,solid:{w:100,h:24}},
 {sx:147,sy:1071,sw:115,sh:79,x:375,y:750,w:115,h:79,solid:{w:94,h:24}},
 {sx:917,sy:937,sw:111,sh:97,x:280,y:585,w:89,h:78,solid:{w:60,h:20}},
 {sx:766,sy:1083,sw:80,sh:68,x:135,y:820,w:72,h:61,solid:{w:54,h:24}},
 // Pocket park, benches face the central walkway.
 {sx:325,sy:984,sw:93,sh:49,x:180,y:1080,w:70,h:37,solid:{w:58,h:16}},
 {sx:325,sy:984,sw:93,sh:49,x:375,y:1080,w:70,h:37,solid:{w:58,h:16}},
 // A service plaza north of the workshop, with a terminal and vending machine.
 {sx:235,sy:942,sw:87,sh:90,x:1360,y:240,w:62,h:64,solid:{w:42,h:18}},
 {sx:742,sy:937,sw:64,sh:99,x:1500,y:240,w:46,h:71,solid:{w:32,h:18}},
 // Loading yard north of the danger zone. No crates in the combat corridor.
 {sx:891,sy:1077,sw:137,sh:78,x:1815,y:235,w:105,h:60,solid:{w:86,h:24}},
 {sx:891,sy:1077,sw:137,sh:78,x:2110,y:235,w:105,h:60,solid:{w:86,h:24}},
 {sx:651,sy:1080,sw:112,sh:70,x:2240,y:200,w:101,h:63,solid:{w:82,h:24}},
].map(p=>({...p,h:p.w*p.sh/p.sw})); // One scale on both axes: never stretch atlas artwork.
export function townPropBlocked(x:number,y:number){return TOWN_PROPS.some(p=>p.solid&&Math.abs(x-p.x)<p.solid.w/2+12&&y>p.y-p.solid.h-12&&y<p.y+12)}
