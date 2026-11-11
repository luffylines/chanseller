"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CloudOff, Crown, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";

const plans=[
 {name:"Free",monthly:0,yearly:0,description:"Explore the essential tools in a local workspace.",features:["10 image edits per month (future plan proposal)","Basic AI copywriter access (future)","Local photo editor preview","No payment setup"],popular:false,available:true},
 {name:"Pro",monthly:299,yearly:239,description:"More room to create for individual online sellers.",features:["300 image edits / month (proposed)","Full AI creative toolkit (planned)","Premium scene presets (planned)","Priority processing (planned)"],popular:true,available:false},
 {name:"Business",monthly:999,yearly:799,description:"For serious sellers who manage many products.",features:["Unlimited images (proposed, subject to limits)","Batch processing (planned)","Brand kits & watermark tools","Team access (planned)"],popular:false,available:false}
];
export default function PricingPage(){
 const [term,setTerm]=useState<"monthly"|"yearly">("monthly");
 return <div className="marketing-site">
  <header className="marketing-header"><div className="marketing-container marketing-nav"><Brand/><nav aria-label="Site navigation"><Link href="/">Home</Link><Link href="/#features">Features</Link><Link href="/pricing" className="active">Pricing</Link><Link href="/#about">About</Link></nav><div className="marketing-nav-actions"><Link href="/login" className="marketing-login">Log in</Link><Link href="/dashboard" className="ui-btn ui-btn-primary">Get Started <ArrowRight size={16}/></Link></div></div></header>
  <main className="pricing-main reference-pricing"><div className="marketing-container">
   <div className="marketing-section-heading"><span><Sparkles size={15}/> PLANS FOR EVERY SELLER</span><h1>Simple, affordable plans<br/>for every seller.</h1><p>Start with the local preview. Future plans are shown for illustration only.</p>
    <div className="billing-toggle" role="group" aria-label="Preview billing frequency"><button className={term==="monthly"?"selected":""} aria-pressed={term==="monthly"} onClick={()=>setTerm("monthly")}>Monthly</button><button className={term==="yearly"?"selected":""} aria-pressed={term==="yearly"} onClick={()=>setTerm("yearly")}>Yearly <span>Save 20%*</span></button></div>
   </div>
   <div className="pricing-page-grid">{plans.map(p=><article key={p.name} className={`pricing-page-card ${p.popular?"highlight":""}`}>
    {p.popular&&<span className="most-popular">POPULAR · CONCEPT</span>}
    <div className="pricing-card-icon"><Crown size={20}/></div><h2>{p.name}</h2>
    <div className="pricing-price">₱{(term==="monthly"?p.monthly:p.yearly).toLocaleString("en-PH")}<span>/month{term==="yearly"?" equivalent":""}</span></div>
    <p>{p.description}</p><div className="price-divider"/>
    <ul>{p.features.map(f=><li key={f}><Check size={17}/>{f}</li>)}</ul>
    {p.available?<Link className="ui-btn ui-btn-primary full-width" href="/dashboard">Get Started <ArrowRight size={16}/></Link>:<button disabled className="ui-btn ui-btn-outline full-width">Coming Soon <ArrowRight size={16}/></button>}
   </article>)}</div>
   <div className="pricing-info-banner"><CloudOff size={20}/><p>*Proposed pricing only. Annual prices are illustrative monthly equivalents. Subscriptions, payment gateway, credits and cloud login are not active.</p></div>
  </div></main>
  <footer className="marketing-footer"><div className="marketing-container"><Brand/><span>© 2026 ChanSeller · Local development preview</span><Link href="/">Back to homepage ↗</Link></div></footer>
 </div>;
}
