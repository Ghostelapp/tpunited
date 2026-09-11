import {db,json,fail} from '@/lib/server';
export async function GET(){try{const row=await db().prepare("SELECT value FROM site_content WHERE key='founder_offer'").first<{value:string}>();const data=row?JSON.parse(row.value):null;return json({offer:data?.status==='announced'?data.offer:null,purchasingEnabled:false})}catch(e){return fail(e)}}
