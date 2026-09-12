/** Cosmetic atlas. Authority comes from the registration role, never saved equipment. */
export const ADMIN_SKIN_URL='/assets/admin-founder-v1.webp';
export function drawAdminSkin(ctx:CanvasRenderingContext2D,image:HTMLImageElement,walking:boolean,distance:number,attackAge=Infinity){
 const attacking=attackAge>=0&&attackAge<350;
 const row=attacking?2:walking?1:0;
 const frame=attacking?Math.min(3,Math.floor(attackAge/88)):walking?Math.floor(distance/20)%4:Math.floor(Date.now()/300)%4;
 const top=[40,440,820][row],height=[355,345,350][row];
 ctx.drawImage(image,frame*313.5,top,313.5,height,-38,-80,76,82);
}
