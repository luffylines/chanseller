"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, CloudOff, CreditCard, Images, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { getDrafts, getProducts } from "@/lib/local-data";

export default function UsagePage(){
  const [images,setImages]=useState(0);const [drafts,setDrafts]=useState(0);const [error,setError]=useState("");
  useEffect(()=>{Promise.all([getProducts(),getDrafts()]).then(([p,d])=>{setImages(p.length);setDrafts(d.length);}).catch(()=>setError("Could not read browser storage."));},[]);
  return <AppShell title="Usage & Plan" description="Your current local workspace and future subscription options.">
    <div className="usage-plan-grid"><section className="workspace-card"><div className="panel-heading"><span className="panel-icon blue"><CreditCard size={20}/></span><div><h2>Local Preview</h2><p>No active subscription or billing is configured.</p></div></div><div className="plan-large"><span>Current mode</span><strong>Free Development</strong><p>Build and test on your own computer.</p></div><div className="plan-feature-list"><span><CheckCircle2 size={17}/> Product image editing (local worker required)</span><span><CheckCircle2 size={17}/> Background presets & exports</span><span><CheckCircle2 size={17}/> Optional Gemini AI copywriting</span><span><CloudOff size={17}/> No cloud database or multi-device sync</span></div><Link href="/pricing" className="ui-btn ui-btn-outline">View future plans <ArrowRight size={16}/></Link></section>
    <section className="workspace-card"><div className="panel-heading"><span className="panel-icon mint"><BarChart3 size={20}/></span><div><h2>Your local activity</h2><p>Only actual saved items are counted.</p></div></div><div className="usage-stats"><div><Images size={19}/><small>Saved images</small><strong>{images}</strong></div><div><PenLine size={19}/><small>Listing drafts</small><strong>{drafts}</strong></div></div><div className="usage-note"><ShieldCheck size={18}/><div><strong>Everything stays in this browser.</strong><p>Usage credits and payments will be enabled only after a dedicated ChanSeller backend is set up.</p></div></div>{error&&<p className="ui-error">{error}</p>}</section></div>
  </AppShell>;
}
