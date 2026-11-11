"use client";

import { Check, Palette, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type BrandKit={name:string,tagline:string,primary:string,tone:string};
const initial:BrandKit={name:"",tagline:"",primary:"#3f9bf6",tone:"Friendly"};
export default function BrandKitPage(){
  const [brand,setBrand]=useState(initial);
  const [saved,setSaved]=useState(false);
  useEffect(()=>{try{const local=window.localStorage.getItem("chanseller-brand-kit");if(local)setBrand({...initial,...JSON.parse(local)});}catch{}},[]);
  function update<K extends keyof BrandKit>(k:K,v:BrandKit[K]){setBrand(b=>({...b,[k]:v}));setSaved(false);}
  function save(){try{window.localStorage.setItem("chanseller-brand-kit",JSON.stringify(brand));setSaved(true);}catch{setSaved(false);}}
  return <AppShell title="Your Brand Kit" description="Keep your brand basics in one place — saved locally in this browser.">
    <div className="brand-kit-grid"><section className="workspace-card brand-form"><div className="panel-heading"><span className="panel-icon blue"><Palette size={20}/></span><div><h2>Brand information</h2><p>Build a consistent identity for your product listings.</p></div></div>
    <label className="form-field">Brand or shop name<input maxLength={90} value={brand.name} onChange={e=>update("name",e.target.value)} placeholder="e.g. Chan's Finds"/></label>
    <label className="form-field">Tagline<input maxLength={120} value={brand.tagline} onChange={e=>update("tagline",e.target.value)} placeholder="e.g. Everyday essentials, made better"/></label>
    <label className="form-field">Primary brand color<div className="color-field"><input type="color" value={brand.primary} onChange={e=>update("primary",e.target.value)} aria-label="Choose brand color"/><input maxLength={7} value={brand.primary} onChange={e=>{if(/^#[a-fA-F0-9]{0,6}$/.test(e.target.value))update("primary",e.target.value);}} aria-label="Brand color hex"/></div></label>
    <label className="form-field">Preferred tone<select value={brand.tone} onChange={e=>update("tone",e.target.value)}><option>Friendly</option><option>Premium</option><option>Playful</option><option>Minimal</option></select></label>
    <button onClick={save} className="ui-btn ui-btn-primary"><Save size={17}/> Save Brand Kit</button>{saved&&<p className="ui-success"><Check size={16}/> Saved locally on this device.</p>}
    </section><div><section className="workspace-card brand-preview"><div className="panel-heading"><span className="panel-icon violet"><Sparkles size={20}/></span><div><h2>Brand preview</h2><p>A feel for how your storefront could look.</p></div></div><div className="brand-preview-stage" style={{background:`linear-gradient(135deg,${/^#[0-9a-fA-F]{6}$/.test(brand.primary)?brand.primary:"#3f9bf6"} 0%,#123a65 100%)`}}><div className="brand-preview-badge">YOUR BRAND</div><h3>{brand.name||"Your Shop Name"}</h3><p>{brand.tagline||"Your brand story starts here."}</p><span>SHOP THE COLLECTION ↗</span></div><div className="brand-preview-footer"><ShieldCheck size={16}/> Preview only; no automatic publishing or cloud sync.</div></section></div></div>
  </AppShell>;
}
