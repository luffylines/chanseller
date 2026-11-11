"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { type CopyResult, type Language, type Platform, type ProductInput, type Tone } from "@/lib/copy";
import { generateId, getDrafts, saveDraft, type SavedDraft } from "@/lib/local-data";
import { downloadBlob, safeFilename } from "@/lib/image";
import { ArrowRight, Check, ClipboardCopy, Download, FilePenLine, FileText, Globe, History, LoaderCircle, PenLine, Save, Sparkles, WandSparkles } from "lucide-react";

const initial:ProductInput={name:"",category:"",features:"",price:"",platform:"Shopee",tone:"Friendly",language:"Taglish"};
const platforms:Platform[]=["Shopee","Lazada","TikTok Shop","Facebook","Instagram"];
const tones:Tone[]=["Friendly","Premium","Playful","Minimal"];
const languages:Language[]=["Taglish","English","Filipino"];
type Tab="listing"|"caption"|"hashtags";
export default function CopywriterPage(){
  const [product,setProduct]=useState<ProductInput>(initial);
  const [output,setOutput]=useState<CopyResult|null>(null);
  const [tab,setTab]=useState<Tab>("listing");
  const [generating,setGenerating]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [copied,setCopied]=useState("");
  const [history,setHistory]=useState<SavedDraft[]>([]);
  useEffect(()=>{getDrafts().then(d=>setHistory(d)).catch(()=>{});},[]);
  function update<K extends keyof ProductInput>(k:K,v:ProductInput[K]){setProduct(p=>({...p,[k]:v}));setNotice("");}
  async function generate(){
    if(!product.name.trim()){setError("Enter your product name to generate a listing.");return;}
    if(generating)return;
    setError("");setNotice("");setGenerating(true);
    try{
      const res=await fetch("/api/copy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(product)});
      const value:CopyResult & {error?:string;warning?:string}=await res.json();
      if(!res.ok)throw new Error(value.error||"Copy generation failed.");
      setOutput(value);setTab("listing");
      if(value.warning)setNotice(value.warning);
    }catch(e){setError(e instanceof Error?e.message:"Unable to generate copy.");}
    finally{setGenerating(false);}
  }
  async function copyText(text:string,key:string){try{await navigator.clipboard.writeText(text);setCopied(key);setTimeout(()=>setCopied(""),2000);}catch{setError("Clipboard was blocked. Select the text to copy manually.");}}
  async function save(){
    if(!output||saving)return;setSaving(true);setError("");
    try{
      const entry:SavedDraft={id:generateId(),name:product.name,platform:product.platform,createdAt:Date.now(),title:output.title,description:output.description,caption:output.caption,hashtags:output.hashtags,source:output.source};
      await saveDraft(entry);setHistory(h=>[entry,...h]);setNotice("Draft saved locally in this browser.");
    }catch(e){setError(e instanceof Error?e.message:"Could not save draft.");}
    finally{setSaving(false);}
  }
  function exportDraft(){
    if(!output)return;
    const text=[`Product: ${product.name}`,`Platform: ${product.platform}`,`Source: ${output.source==="gemini"?"Gemini AI":"Local template"}`,"","TITLE",output.title,"","DESCRIPTION",output.description,"","CAPTION",output.caption,"","HASHTAGS",output.hashtags].join("\n");
    downloadBlob(new Blob([text],{type:"text/plain;charset=utf-8"}),`${safeFilename(product.name)}-listing.txt`);
  }
  function loadDraft(d:SavedDraft){setProduct(p=>({...p,name:d.name,platform:d.platform as Platform}));setOutput({title:d.title,description:d.description,caption:d.caption,hashtags:d.hashtags,source:d.source});setError("");setNotice("Loaded a saved local draft.");setTab("listing");}
  return <AppShell title="AI Copywriter" description="Write compelling product titles, descriptions and marketing copy in seconds." actions={<Link href="/studio" className="ui-btn ui-btn-outline"><PenLine size={16}/> Edit a Product Photo</Link>}>
    <div className="copywriter-grid">
      <section className="workspace-card copywriter-form-panel">
        <div className="panel-heading"><span className="panel-icon blue"><WandSparkles size={20}/></span><div><h2>Product information</h2><p>Tell us what makes your product special.</p></div></div>
        <div className="copywriter-fields">
          <label className="form-field">Product name <b>*</b><input placeholder="e.g. Wireless Headphones" maxLength={120} value={product.name} onChange={e=>update("name",e.target.value)}/></label>
          <label className="form-field">Category <span className="field-optional">Optional</span><input placeholder="e.g. Electronics & Accessories" maxLength={90} value={product.category} onChange={e=>update("category",e.target.value)}/></label>
          <label className="form-field">Product details <span className="field-optional">Only real, verified facts</span><textarea placeholder="e.g. Bluetooth 5.3, foldable, white color, 40-hour battery life if verified" rows={5} maxLength={1200} value={product.features} onChange={e=>update("features",e.target.value)}/></label>
          <label className="form-field">Price <span className="field-optional">Optional</span><input placeholder="₱ 0.00" maxLength={60} value={product.price} onChange={e=>update("price",e.target.value)}/></label>
          <div className="form-field"><span>Target platform</span><div className="platform-chips">{platforms.map(p=><button aria-pressed={product.platform===p} className={product.platform===p?"selected":""} key={p} onClick={()=>update("platform",p)}>{p}</button>)}</div></div>
          <div className="form-two-col"><label className="form-field">Writing tone<select value={product.tone} onChange={e=>update("tone",e.target.value as Tone)}>{tones.map(t=><option key={t}>{t}</option>)}</select></label><label className="form-field">Language<select value={product.language} onChange={e=>update("language",e.target.value as Language)}>{languages.map(t=><option key={t}>{t}</option>)}</select></label></div>
          <button disabled={generating} className="ui-btn ui-btn-primary full-width generate-button" onClick={generate}>{generating?<LoaderCircle size={17} className="spin"/>:<Sparkles size={17}/>} {generating?"Generating…":"Generate with AI"} <ArrowRight size={17}/></button>
          <div className="copywriter-note"><Globe size={16}/><span>AI generation needs your own Gemini API key. Otherwise a clearly labeled local template is created. Only typed copy fields are sent to Gemini when enabled.</span></div>
        </div>
      </section>
      <section className="workspace-card copywriter-output-panel">
        <div className="copywriter-output-top"><div className="copy-tab-list" role="tablist" aria-label="Copy output sections">{([{id:"listing",label:"Product Listing"},{id:"caption",label:"Captions"},{id:"hashtags",label:"Hashtags"}] as {id:Tab;label:string}[]).map(t=><button role="tab" aria-selected={tab===t.id} className={tab===t.id?"selected":""} key={t.id} onClick={()=>setTab(t.id)}>{t.label}</button>)}</div>{output&&<span className="copy-source-badge">{output.source==="gemini"?"Gemini AI draft":"Template draft"}</span>}</div>
        {error&&<p role="alert" className="ui-error">{error}</p>}
        {notice&&<p role="status" className="ui-notice">{notice}</p>}
        {!output?<div className="empty-copywriter"><div className="empty-copy-icon"><WandSparkles size={36}/></div><h3>Make every word count.</h3><p>Enter the facts about your product and click Generate with AI. Your copy draft will appear here.</p><span className="copy-placeholder-lines"><i/><i/><i/><i/></span></div>:
        <div className="copy-results">
          {tab==="listing"&&<><div className="copy-result-block"><div className="result-block-head"><strong>Product Title</strong><button onClick={()=>copyText(output.title,"title")}><ClipboardCopy size={15}/>{copied==="title"?"Copied":"Copy"}</button></div><p>{output.title}</p></div><div className="copy-result-block"><div className="result-block-head"><strong>Product Description</strong><button onClick={()=>copyText(output.description,"description")}><ClipboardCopy size={15}/>{copied==="description"?"Copied":"Copy"}</button></div><p>{output.description}</p></div></>}
          {tab==="caption"&&<div className="copy-result-block"><div className="result-block-head"><strong>Marketing Caption</strong><button onClick={()=>copyText(output.caption,"caption")}><ClipboardCopy size={15}/>{copied==="caption"?"Copied":"Copy"}</button></div><p>{output.caption}</p></div>}
          {tab==="hashtags"&&<div className="copy-result-block"><div className="result-block-head"><strong>Suggested Hashtags</strong><button onClick={()=>copyText(output.hashtags,"hashtags")}><ClipboardCopy size={15}/>{copied==="hashtags"?"Copied":"Copy"}</button></div><p>{output.hashtags}</p></div>}
          <div className="copy-output-actions"><button className="ui-btn ui-btn-primary" disabled={saving} onClick={save}>{saving?<LoaderCircle size={16} className="spin"/>:<Save size={16}/>} Save Draft</button><button className="ui-btn ui-btn-outline" onClick={exportDraft}><Download size={16}/> Export TXT</button></div><div className="copy-review-note"><Check size={15}/> Always verify product claims and marketplace rules before publishing.</div>
        </div>}
      </section>
    </div>
    {history.length>0&&<section className="saved-drafts-section"><div className="content-section-heading"><div><h2><History size={18}/> Saved drafts</h2><p>Saved locally on this computer.</p></div></div><div className="drafts-grid">{history.slice(0,6).map(d=><button key={d.id} className="saved-draft-card" onClick={()=>{loadDraft(d);window.scrollTo({top:0,behavior:"smooth"});}}><FileText size={18}/><strong>{d.name}</strong><span>{d.platform}</span><ArrowRight size={16}/></button>)}</div></section>}
  </AppShell>;
}
