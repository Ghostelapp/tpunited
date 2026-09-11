'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Menu, X, ArrowUpRight, Skull} from 'lucide-react';
import Wallet from './wallet';
import {useAuth} from './auth-provider';
export default function Header(){const auth=useAuth();const admin=['ADMIN','SUPER_ADMIN'].includes(auth.user?.role??'');const [open,setOpen]=useState(false);return <header className="site-header"><Link className="brand" href="/" aria-label="Trash Panda United home"><Skull size={34}/><span>TRASH PANDA<strong>UNITED<span className="brand-slashes">{"///"}</span></strong></span></Link><nav className={open?'nav open':'nav'} aria-label="Main navigation"><a href="/game">THE GAME</a><a href="/campaigns">QUESTS & AIRDROPS</a><a href="/leaderboard">LEADERBOARD</a><a href="/land">LAND</a><a href="/marketplace">MARKETPLACE</a><a href="/program">TESTNET SEASON <ArrowUpRight size={12}/></a><a href="/support">SUPPORT</a></nav><div className="header-actions">{admin&&<a className="account-link" href="/admin">ADMIN</a>}<a className="account-link" href="/register">ACCOUNT</a><Wallet/><button className="mobile-menu" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>}
