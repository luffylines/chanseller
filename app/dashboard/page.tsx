"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Check, FilePenLine, ImagePlus, Images, Layers3, Package, PenLine, Plus, Sparkles, WandSparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getDrafts, getProducts, type SavedProduct } from "@/lib/local-data";

const examples = [
  {name:"Wireless Headphones",image:"/demo-headphones.svg",background:"ice"},
  {name:"Everyday Tote",image:"/demo-tote.svg",background:"sand"},
  {name:"Water Bottle",image:"/demo-bottle-blue.svg",background:"blush"},
  {name:"Sunglasses",image:"/demo-sunglasses.svg",background:"sage"},
  {name:"Classic Watch",image:"/demo-watch.svg",background:"stone"}
];
const actions = [
  {href:"/studio",icon:ImagePlus,title:"Edit Product Image",text:"Remove background and create studio photos",color:"primary"},
  {href:"/copywriter",icon:FilePenLine,title:"Generate Listing",text:"Draft a product title, description and details",color:"light"},
  {href:"/copywriter",icon:Sparkles,title:"Create Captions",text:"Write copy for marketplace and social posts",color:"light"},
  {href:"/templates",icon:Layers3,title:"Use a Template",text:"Try ready-made background styles",color:"light"}
];
export default function Dashboard() {
  const [projects,setProjects]=useState<SavedProduct[]>([]);
  const [drafts,setDrafts]=useState(0);
  const [previews,setPreviews]=useState<Record<string,string>>({});
  const [error,setError]=useState("");
  useEffect(()=>{
    let alive=true;
    Promise.all([getProducts(),getDrafts()]).then(([p,d])=>{
      if (!alive) return;
      setProjects(p);setDrafts(d.length);
      const urls:Record<string,string>={};
      p.forEach(item=>{urls[item.id]=URL.createObjectURL(item.image);});
      setPreviews(urls);
    }).catch(e=>{if(alive) setError(e instanceof Error?e.message:"Could not read local projects.");});
    return ()=>{alive=false;};
  },[]);
  useEffect(()=>()=>Object.values(previews).forEach(url=>URL.revokeObjectURL(url)),[previews]);
  const metrics=[
    {title:"Images Saved",value:projects.length,icon:Images,note:"Local projects",tone:"blue"},
    {title:"Listing Drafts",value:drafts,icon:FilePenLine,note:"Saved in browser",tone:"mint"},
    {title:"Workspaces",value:1,icon:Package,note:"Your local workspace",tone:"pink"},
    {title:"Your Plan",value:"Preview",icon:Zap,note:"No active billing",tone:"violet"}
  ];
  return <AppShell title="Your Seller Dashboard" description="Create, edit and manage product assets from one beautiful workspace." actions={<Link href="/studio" className="ui-btn ui-btn-primary"><Plus size={17}/> New Project</Link>}>
    <div className="welcome-banner"><div><span className="welcome-eyebrow"><Sparkles size={14}/> GOOD TO SEE YOU</span><h2>Ready to make something amazing? <span>✦</span></h2><p>Turn everyday product photos into better-looking listings.</p><Link className="welcome-button" href="/studio">Start creating <ArrowRight size={16}/></Link></div><div className="welcome-art" aria-hidden="true"><div className="welcome-sun"/><img src="/demo-headphones.svg" alt=""/></div></div>
    <section className="dashboard-metrics">{metrics.map(item=><div className="metric-card" key={item.title}><div className="metric-top"><span className={`metric-icon ${item.tone}`}><item.icon size={18}/></span><span className="metric-name">{item.title}</span></div><strong>{item.value}</strong><span className="metric-note">{item.note}</span></div>)}</section>
    <section className="content-section">
      <div className="content-section-heading"><div><h2>Quick Actions</h2><p>The fastest way to create something new.</p></div><Link href="/templates">Explore tools <ArrowRight size={15}/></Link></div>
      <div className="quick-actions">{actions.map(action=><Link href={action.href} key={action.title} className={`quick-action ${action.color==="primary"?"quick-primary":""}`}><span className="quick-icon"><action.icon size={23}/></span><h3>{action.title}</h3><p>{action.text}</p><ArrowUpRight className="quick-arrow" size={16}/></Link>)}</div>
    </section>
    <section className="content-section">
      <div className="content-section-heading"><div><h2>Recent Projects</h2><p>{projects.length?"Your saved product images in this browser.":"Nothing saved yet — try creating your first product image."}</p></div><Link href="/products">View all <ArrowRight size={15}/></Link></div>
      {error&&<p className="ui-error">{error}</p>}
      {projects.length?<div className="recent-gallery">{projects.slice(0,5).map(p=><Link href={`/products?open=${encodeURIComponent(p.id)}`} className="recent-product" key={p.id}><div className="recent-product-image"><img src={previews[p.id]||""} alt={p.name}/></div><strong>{p.name}</strong><small>Saved locally</small></Link>)}<Link href="/studio" className="recent-add"><Plus size={24}/><strong>New Project</strong></Link></div>:
      <div className="recent-gallery">{examples.map(ex=><Link href="/studio" className="recent-product" key={ex.name}><div className={`recent-product-image example-${ex.background}`}><img src={ex.image} alt={ex.name}/><span>EXAMPLE</span></div><strong>{ex.name}</strong><small>Try your own photo</small></Link>)}<Link href="/studio" className="recent-add"><Plus size={24}/><strong>New Project</strong></Link></div>}
    </section>
    <div className="dashboard-hint"><span><Check size={16}/> Privacy first</span> Your images stay on your device in this demo. No account or cloud database has been configured.</div>
  </AppShell>;
}
