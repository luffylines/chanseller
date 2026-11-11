"use client";

import Link from "next/link";
import { ArrowRight, Download, ImagePlus, Package, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { deleteProduct, formatDate, getProducts, type SavedProduct } from "@/lib/local-data";
import { downloadBlob, safeFilename } from "@/lib/image";

export default function ProductsPage() {
  const [items,setItems]=useState<SavedProduct[]>([]);
  const [loading,setLoading]=useState(true);
  const [urls,setUrls]=useState<Record<string,string>>({});
  const [query,setQuery]=useState("");
  const [sort,setSort]=useState<"newest"|"oldest"|"az">("newest");
  const [error,setError]=useState("");
  const [selected,setSelected]=useState<string|null>(null);
  const [busy,setBusy]=useState<string|null>(null);
  const filtered=useMemo(()=>items.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==="oldest"?a.createdAt-b.createdAt:sort==="az"?a.name.localeCompare(b.name):b.createdAt-a.createdAt),[items,query,sort]);
  useEffect(()=>{
    let active=true;
    getProducts().then(products=>{
      if(!active) return;
      setItems(products);
      const map:Record<string,string>={};
      for(const p of products)map[p.id]=URL.createObjectURL(p.image);
      setUrls(map);setLoading(false);
      const wanted=new URLSearchParams(window.location.search).get("open");
      if(wanted&&products.some(p=>p.id===wanted))setSelected(wanted);
    }).catch(e=>{if(active){setError(e instanceof Error?e.message:"Unable to load local projects.");setLoading(false);}});
    return()=>{active=false;};
  },[]);
  useEffect(()=>()=>Object.values(urls).forEach(u=>URL.revokeObjectURL(u)),[urls]);
  async function remove(id:string) {
    if(!window.confirm("Delete this local project? This cannot be undone.")) return;
    setBusy(id);setError("");
    try {await deleteProduct(id);setItems(a=>a.filter(p=>p.id!==id));setSelected(null);}
    catch(e){setError(e instanceof Error?e.message:"Couldn't delete the project.");}
    finally{setBusy(null);}
  }
  const active=items.find(i=>i.id===selected);
  return <AppShell title="My Products" description="All the studio images you've saved on this device." actions={<Link href="/studio" className="ui-btn ui-btn-primary"><Plus size={17}/> New Project</Link>}>
    <div className="section-toolbar"><div className="search-field"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." aria-label="Search saved products"/></div><div className="products-filter-controls"><select aria-label="Sort products" value={sort} onChange={e=>setSort(e.target.value as "newest"|"oldest"|"az")}><option value="newest">All Products · Newest</option><option value="oldest">Oldest first</option><option value="az">Name A to Z</option></select><span className="section-toolbar-note">{items.length} saved project{items.length===1?"":"s"}</span></div></div>
    {error&&<p className="ui-error">{error}</p>}
    {loading?<div className="empty-slate"><Package size={33}/><h2>Loading your projects…</h2></div>:
    items.length===0?<div className="empty-slate"><span className="empty-icon"><Package size={32}/></span><h2>Your product library starts here.</h2><p>Create a studio photo, click Save to My Products, and it'll show up here. Saved images live in this browser until you delete them.</p><Link href="/studio" className="ui-btn ui-btn-primary"><ImagePlus size={17}/> Open Product Studio</Link></div>:
    filtered.length===0?<div className="empty-slate"><Search size={32}/><h2>No matching products</h2><p>Try another search term.</p></div>:
    <div className="library-grid">{filtered.map(item=><article className="library-card" key={item.id}><button onClick={()=>setSelected(item.id)} className="library-photo" aria-label={`Preview ${item.name}`}><img src={urls[item.id]||""} alt={item.name}/></button><div className="library-info"><strong>{item.name}</strong><span>{formatDate(item.createdAt)} · {item.preset}</span><div className="library-actions"><button onClick={()=>downloadBlob(item.image,`${safeFilename(item.name)}-chanseller.png`)}><Download size={15}/> Download</button><button disabled={busy===item.id} className="delete-button" aria-label={`Delete ${item.name}`} onClick={()=>remove(item.id)}><Trash2 size={16}/></button></div></div></article>)}</div>}
    {active&&<div role="presentation" className="lightbox-backdrop" onClick={()=>setSelected(null)}><div role="dialog" aria-modal="true" aria-label={active.name} className="lightbox" onClick={e=>e.stopPropagation()}><div className="lightbox-top"><strong>{active.name}</strong><button onClick={()=>setSelected(null)} aria-label="Close preview"><X size={20}/></button></div><img src={urls[active.id]||""} alt={active.name}/><div className="lightbox-bottom"><small>Saved {formatDate(active.createdAt)}</small><button className="ui-btn ui-btn-primary" onClick={()=>downloadBlob(active.image,`${safeFilename(active.name)}-chanseller.png`)}><Download size={16}/> Download PNG</button></div></div></div>}
  </AppShell>;
}
