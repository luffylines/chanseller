"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronDown, CircleHelp, Crown, FileText, Home, Images, Layers3, LayoutDashboard, Menu, Package, Palette, PenLine, Settings, Sparkles, WandSparkles, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";

const mainLinks = [
  {href:"/dashboard", title:"Dashboard", icon:LayoutDashboard},
  {href:"/studio", title:"Product Studio", icon:Images},
  {href:"/copywriter", title:"AI Copywriter", icon:PenLine},
  {href:"/products", title:"My Products", icon:Package},
  {href:"/templates", title:"Templates", icon:Layers3},
  {href:"/brand-kit", title:"Brand Kit", icon:Palette}
] as const;
const otherLinks = [
  {href:"/usage", title:"Usage & Plan", icon:BarChart3},
  {href:"/settings", title:"Settings", icon:Settings}
] as const;

export function AppShell({children,title,description,actions}:{children:React.ReactNode;title:string;description:string;actions?:React.ReactNode}) {
  const current=usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const [help,setHelp]=useState(false);
  const sidebar=<>
    <div className="app-logo"><Brand to="/"/></div>
    <div className="sidebar-nav-title">WORKSPACE</div>
    <nav className="sidebar-nav" aria-label="Seller dashboard">
      {mainLinks.map(item=><Link key={item.href} onClick={()=>setMobileOpen(false)} className={`app-nav-item ${current===item.href?"active":""}`} href={item.href}><item.icon size={18}/><span>{item.title}</span>{current===item.href&&<span className="nav-active-dot"/>}</Link>)}
      <div className="sidebar-divider"/>
      {otherLinks.map(item=><Link key={item.href} onClick={()=>setMobileOpen(false)} className={`app-nav-item ${current===item.href?"active":""}`} href={item.href}><item.icon size={18}/><span>{item.title}</span></Link>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="sidebar-upgrade"><span className="upgrade-icon"><Crown size={21}/></span><h3>Make more magic.</h3><p>Plans are being prepared. Your local workspace is free during development.</p><Link href="/pricing">Explore plans <span>↗</span></Link></div>
      <div className="sidebar-local"><span className="online-dot"/> Local preview <small>No cloud database</small></div>
    </div>
  </>;

  return <div className="app-layout">
    <aside className={`app-sidebar ${mobileOpen?"sidebar-open":""}`}>{sidebar}</aside>
    {mobileOpen&&<button className="sidebar-overlay" aria-label="Close menu" onClick={()=>setMobileOpen(false)}/>}
    <div className="app-main">
      <header className="app-topbar">
        <div className="topbar-left"><button className="mobile-menu-button" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen?<X size={22}/>:<Menu size={22}/>}</button><div className="topbar-crumb"><Link href="/dashboard">Workspace</Link><ChevronDown size={13} className="crumb-arrow"/><strong>{title}</strong></div></div>
        <div className="topbar-right"><span className="mode-pill"><span/> Local mode</span><button aria-label="How does the preview work?" title="Preview help" onClick={()=>setHelp(v=>!v)} className="round-icon-button"><CircleHelp size={19}/></button><Link href="/settings" className="avatar-button" aria-label="Settings">C</Link></div>
      </header>
      {help&&<div className="local-help-banner"><strong>Development preview:</strong> Your saved projects and drafts stay in this browser (IndexedDB). No real account, paid plan, cloud database or deployment is active. Background removal requires the local Python image worker. <button aria-label="Close help" onClick={()=>setHelp(false)}><X size={16}/></button></div>}
      <main className="app-content">
        <div className="app-page-header"><div className="app-title-group"><span className="app-overline"><Sparkles size={14}/> YOUR CREATIVE WORKSPACE</span><h1>{title}</h1><p>{description}</p></div>{actions&&<div className="app-page-actions">{actions}</div>}</div>
        {children}
      </main>
      <footer className="app-footer"><span>ChanSeller © 2026 · Local-first development preview</span><Link href="/">Back to homepage ↗</Link></footer>
    </div>
  </div>;
}
