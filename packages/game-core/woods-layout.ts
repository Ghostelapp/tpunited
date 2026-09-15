// Shared authored routes: terrain, foliage clearance and minimap use the same geometry.
export const WOODS_WORLD_WIDTH=6200;
export const WOODS_CANOPY_START=3300;
export type TrailPoint=readonly [number,number];
export const WOODS_TRAILS:readonly {width:number;points:readonly TrailPoint[]}[]=[
 {width:100,points:[[2200,760],[2700,760],[2980,840],[3300,900],[3700,820],[4140,930],[4610,800],[5100,890],[5520,820],[6030,820]]},
 {width:52,points:[[3500,860],[3590,650],[3650,510],[3970,430],[4200,350],[4350,520],[4420,880]]},
 {width:50,points:[[3700,820],[3760,1090],[4020,1210],[4420,1200],[4740,1330],[4950,1360],[5190,1210],[5370,845]]},
 {width:44,points:[[4610,800],[4690,580],[4830,480],[5100,560],[5200,870]]},
];
export function trailDistance(x:number,y:number,points:readonly TrailPoint[]){
 let best=Infinity;
 for(let i=1;i<points.length;i++){
  const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay;
  const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
  best=Math.min(best,Math.hypot(x-ax-t*dx,y-ay-t*dy));
 }
 return best;
}
export const WOODS_PROPS=[
 // The checkpoint opens onto a disused service road, with the ranger off to its north.
 {index:0,x:2385,y:645,size:155},{index:1,x:2385,y:935,size:155},
 {index:2,x:2500,y:650,size:175},{index:4,x:2620,y:665,size:135},
 {index:3,x:2740,y:1040,size:155},{index:3,x:2850,y:490,size:125},
 {index:8,x:2950,y:1130,size:100},{index:9,x:3130,y:590,size:115},
 {index:5,x:2910,y:735,size:65},{index:5,x:3460,y:795,size:65},
 {index:9,x:3540,y:1060,size:105},{index:10,x:3250,y:1170,size:100},
 {index:4,x:4390,y:235,size:100},{index:3,x:4920,y:1260,size:180},
 {index:3,x:5080,y:1425,size:130},{index:5,x:4770,y:1200,size:65},
 {index:0,x:6030,y:745,size:150},{index:1,x:6030,y:980,size:150},
] as const;
// Visible large objects have foot collisions; signs and small rubble remain passable.
export const WOODS_SOLIDS=WOODS_PROPS.filter(p=>[0,1,2,3,4].includes(p.index)).map(p=>({x:p.x,y:p.y-10,w:p.size*.55,h:25}));
