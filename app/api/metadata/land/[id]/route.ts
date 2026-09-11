import {parcels} from '@/packages/game-core/world';
import {runtimeEnv} from '@/lib/server';
export async function GET(request:Request,context:{params:Promise<{id:string}>}) {
 const {id}=await context.params;
 const p=/^[1-9][0-9]*$/.test(id)?parcels.find(x=>x.id===Number(id)):undefined;
 if(!p)return Response.json({error:'Unknown parcel'},{status:404});
 const origin=runtimeEnv().AUTH_ORIGIN||new URL(request.url).origin;
 return Response.json({
  name:`Trash Panda United — Land #${p.id}`,
  description:`A ${p.width} × ${p.height} parcel in Trash Town. Permanent buildings transfer with the land. Separate decoration NFTs remain with their owners. The image is a parcel location diagram, not a representation of constructed buildings.`,
  image:new URL(`/assets/land-nft/${p.id}.png`,origin).href,
  external_url:new URL('/land',origin).href,
  attributes:[{trait_type:'Region',value:'Trash Town'},{trait_type:'Rarity',value:p.rarity},{trait_type:'Building slots',value:p.buildingSlots},{trait_type:'X',value:p.x},{trait_type:'Y',value:p.y}]
 },{headers:{'Cache-Control':'public, max-age=300'}});
}
