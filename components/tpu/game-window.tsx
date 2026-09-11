'use client';
import type {ReactNode} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Frame,UIIcon} from './world-assets';
export function GameWindow({open,onOpenChange,title,description,children}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;description:string;children:ReactNode}){return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="pixel-dialog game-panel-dialog unified-game-window"><Frame/><div className="game-panel-heading"><div className="game-panel-emblem"><UIIcon name="bag" width={30}/></div><div><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></div></div><div className="game-panel-body">{children}</div></DialogContent></Dialog>}
export function gameMenu(destination:'travel'|'decorations'){
 if(window.location.pathname==='/game')window.dispatchEvent(new CustomEvent('tpu-game-menu',{detail:destination}));
 else window.location.href=destination==='travel'?'/game':'/game?menu=decorations';
}
