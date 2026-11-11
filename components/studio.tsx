"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, CircleHelp, ClipboardCopy, Download, Eraser, FileText, Home, Image as ImageIcon, ImagePlus, Layers3, LoaderCircle, MonitorCheck, Paintbrush, PenLine, RotateCcw, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, UploadCloud, WandSparkles, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { createStudioExport, downloadBlob, presets, safeFilename, type Adjustments, type PresetId } from "@/lib/image";
import { type CopyResult, type Language, type Platform, type ProductInput, type Tone } from "@/lib/copy";

type Section = "photo" | "copy";
const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);
const initialProduct: ProductInput = {
  name: "", category: "", features: "", price: "",
  platform: "Shopee", tone: "Friendly", language: "Taglish",
};

export function StudioApp() {
  const [section,setSection] = useState<Section>("photo");
  const [file,setFile] = useState<File|null>(null);
  const [original,setOriginal] = useState<string|null>(null);
  const [cutout,setCutout] = useState<string|null>(null);
  const originalRef = useRef<string|null>(null);
  const cutoutRef = useRef<string|null>(null);
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [processing,setProcessing] = useState(false);
  const [exporting,setExporting] = useState(false);
  const [photoError,setPhotoError] = useState("");
  const [dragging,setDragging] = useState(false);
  const [preset,setPreset] = useState<PresetId>("lavender");
  const [comparison,setComparison] = useState(55);
  const [adjustments,setAdjustments] = useState<Adjustments>({brightness:100,contrast:100,saturation:100});
  const [product,setProduct] = useState<ProductInput>(initialProduct);
  const [copyResult,setCopyResult] = useState<CopyResult|null>(null);
  const [copyError,setCopyError] = useState("");
  const [generating,setGenerating] = useState(false);
  const [copied,setCopied] = useState("");
  const [showHelp,setShowHelp] = useState(false);

  useEffect(() => () => {
    if (originalRef.current) URL.revokeObjectURL(originalRef.current);
    if (cutoutRef.current) URL.revokeObjectURL(cutoutRef.current);
  }, []);

  function replaceCutout(next: string|null) {
    if (cutoutRef.current) URL.revokeObjectURL(cutoutRef.current);
    cutoutRef.current = next;
    setCutout(next);
  }
  function receiveFile(next?: File) {
    if (!next) return;
    setPhotoError("");
    if (!accepted.has(next.type)) { setPhotoError("Upload a JPG, PNG, or WebP image."); return; }
    if (next.size > 8 * 1024 * 1024) { setPhotoError("Please use an image smaller than 8 MB."); return; }
    if (originalRef.current) URL.revokeObjectURL(originalRef.current);
    const url = URL.createObjectURL(next);
    originalRef.current = url;
    setFile(next);
    setOriginal(url);
    replaceCutout(null);
    setComparison(55);
    setAdjustments({brightness:100,contrast:100,saturation:100});
    if (!product.name.trim()) {
      const suggested = next.name.replace(/\.[^/.]+$/,"").replace(/[-_]+/g," ").trim();
      setProduct(prev => ({...prev,name:suggested}));
    }
  }
  function clearPhoto() {
    if (originalRef.current) URL.revokeObjectURL(originalRef.current);
    originalRef.current = null;
    setOriginal(null);
    setFile(null);
    replaceCutout(null);
    setPhotoError("");
  }
  async function removeBackground() {
    if (!file || processing) return;
    setProcessing(true);
    setPhotoError("");
    try {
      const form = new FormData();
      form.append("file",file);
      const base = process.env.NEXT_PUBLIC_BG_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${base.replace(/\/$/,"")}/remove-background`, {method:"POST",body:form});
      if (!response.ok) {
        const data: {detail?: string} = await response.json().catch(() => ({}));
        throw new Error(data.detail || `Processing failed (HTTP ${response.status}).`);
      }
      const blob = await response.blob();
      if (!blob.type.includes("png")) throw new Error("Unexpected output from the image worker.");
      replaceCutout(URL.createObjectURL(blob));
      setComparison(55);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown processing error";
      setPhotoError(message.includes("fetch") || message.includes("Failed to") ?
        "Cannot reach the local image worker. Start Python on port 8000 (see README), then retry." : message);
    } finally { setProcessing(false); }
  }
  async function exportStudio() {
    if (!cutout || exporting) return;
    setExporting(true);
    setPhotoError("");
    try {
      const blob = await createStudioExport(cutout,preset,adjustments);
      downloadBlob(blob,`${safeFilename(product.name || file?.name || "product")}-chanseller-studio.png`);
    } catch (e) { setPhotoError(e instanceof Error ? e.message : "Unable to export."); }
    finally { setExporting(false); }
  }
  async function exportTransparent() {
    if (!cutout) return;
    try {
      const response = await fetch(cutout);
      downloadBlob(await response.blob(),`${safeFilename(product.name || "product")}-transparent.png`);
    } catch { setPhotoError("Could not download the transparent image."); }
  }
  function update<K extends keyof ProductInput>(field: K, value: ProductInput[K]) {
    setProduct(p => ({...p,[field]:value}));
    setCopyResult(null); setCopyError("");
  }
  async function generateCopy() {
    if (generating) return;
    if (!product.name.trim()) { setCopyError("Enter the product name first."); return; }
    setGenerating(true); setCopyError("");
    try {
      const res = await fetch("/api/copy",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(product)});
      const json: CopyResult & {error?:string;warning?:string} = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not write product copy.");
      setCopyResult(json);
      if (json.warning) setCopyError(json.warning);
    } catch (e) { setCopyError(e instanceof Error ? e.message : "Copywriter is unavailable."); }
    finally { setGenerating(false); }
  }
  async function copyValue(text: string,key: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(()=>setCopied(""),1700); }
    catch { setCopyError("Clipboard permission was blocked. Select and copy the text manually."); }
  }
  function exportText() {
    if (!copyResult) return;
    const text = [`Platform: ${product.platform}`,`Product: ${product.name}`,`Source: ${copyResult.source === "gemini" ? "Gemini AI draft" : "Local template draft"}`,"", "TITLE",copyResult.title,"", "DESCRIPTION",copyResult.description,"", "CAPTION",copyResult.caption,"", "HASHTAGS",copyResult.hashtags].join("\n");
    downloadBlob(new Blob([text],{type:"text/plain;charset=utf-8"}),`${safeFilename(product.name)}-listing.txt`);
  }

  const activePreset = presets.find(p=>p.id===preset) || presets[0];
  const hasChanges = adjustments.brightness!==100 || adjustments.contrast!==100 || adjustments.saturation!==100;

  return <div className="studio-root">
    <aside className="studio-sidebar">
      <div className="sidebar-brand"><Brand light /></div>
      <div className="sidebar-label">WORKSPACE</div>
      <div className="sidebar-links">
        <button className={`sidebar-link ${section==="photo"?"sidebar-link-active":""}`} onClick={()=>setSection("photo")}><ImageIcon size={19}/> Product Studio <ArrowRight size={15} className="sidebar-arrow"/></button>
        <button className={`sidebar-link ${section==="copy"?"sidebar-link-active":""}`} onClick={()=>setSection("copy")}><PenLine size={19}/> AI Copywriter <ArrowRight size={15} className="sidebar-arrow"/></button>
        <span className="sidebar-link sidebar-link-soon"><Layers3 size={19}/> My products <span>SOON</span></span>
      </div>
      <div className="sidebar-bottom">
        <div className="local-info"><span className="local-signal"/><strong>Local development</strong><small>No database connected</small></div>
        <Link href="/" className="sidebar-home"><Home size={17}/> Back to website</Link>
      </div>
    </aside>

    <div className="studio-panel">
      <header className="studio-topbar">
        <div className="studio-mobile-brand"><Brand/></div>
        <div className="studio-breadcrumb"><span>Workspace</span><ChevronDown size={13} className="breadcrumb-chevron"/><strong>{section==="photo"?"Product Studio":"AI Copywriter"}</strong></div>
        <div className="studio-top-actions"><span className="dev-badge"><span/> DEVELOPMENT MODE</span><button className="help-button" title="How it works" aria-label="How it works" onClick={()=>setShowHelp(v=>!v)}><CircleHelp size={19}/></button></div>
      </header>
      {showHelp && <div className="help-banner"><strong>Quick start:</strong> Open the Studio, upload a real product image, run the Python background-removal worker, then customize and download. AI copy requires an optional Gemini API key; otherwise it's a template draft. <button onClick={()=>setShowHelp(false)} aria-label="Dismiss help"><X size={17}/></button></div>}
      <div className="studio-mobile-tabs"><button onClick={()=>setSection("photo")} className={section==="photo"?"selected":""}><ImageIcon size={17}/> Photos</button><button onClick={()=>setSection("copy")} className={section==="copy"?"selected":""}><PenLine size={17}/> Copywriter</button></div>
      <main className="studio-content">
        <div className="page-heading">
          <div><span className="studio-eyebrow"><Sparkles size={14}/> THE CREATIVE WORKSPACE</span><h1>{section==="photo"?"Product Photo Studio":"AI Listing Copywriter"}</h1><p>{section==="photo"?"Give every product the spotlight it deserves.":"Create cleaner product listings without starting from a blank page."}</p></div>
          <div className="heading-badge"><MonitorCheck size={17}/><span>Made for online sellers</span></div>
        </div>

        {section==="photo" ? <>
          <div className="studio-work-grid">
            <div className="studio-left-col">
              <section className="studio-card upload-card">
                <div className="studio-card-head"><div><span className="section-step">STEP 01</span><h2>Upload your photo</h2></div><span className="small-tip">JPG, PNG or WebP</span></div>
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e=>{receiveFile(e.target.files?.[0]);e.currentTarget.value="";}} aria-label="Choose a product photo"/>
                {!file ? <div className={`drop-zone ${dragging?"drag-active":""}`} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ") inputRef.current?.click();}} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);receiveFile(e.dataTransfer.files?.[0]);}} onClick={()=>inputRef.current?.click()}>
                  <span className="drop-icon"><UploadCloud size={25}/></span><strong>Drag & drop your product photo</strong><small>or click to browse from your device</small><span className="drop-button">Browse files <ArrowRight size={15}/></span><span className="drop-limit">Maximum 8MB • Stored only in this session</span>
                </div> : <div className="file-added"><div className="file-preview"><img src={original || ""} alt="Selected product"/></div><div className="file-copy"><strong title={file.name}>{file.name}</strong><small>{(file.size/1048576).toFixed(2)} MB • Uploaded locally</small></div><button onClick={clearPhoto} className="file-remove" aria-label="Remove photo"><X size={17}/></button></div>}
                <button className="btn btn-purple process-button" disabled={!file||processing} onClick={removeBackground}>{processing?<LoaderCircle className="spin" size={17}/>:<Eraser size={17}/>} {processing?"Removing background…":cutout?"Re-run background removal":"Remove background with AI"}</button>
                <p className="under-button"><ShieldCheck size={14}/> Processes through your local Python worker. First run downloads model weights.</p>
                {photoError && <p className="error-message" role="alert">{photoError}</p>}
              </section>
              <section className="studio-card style-card"><div className="studio-card-head"><div><span className="section-step">STEP 02</span><h2>Choose a look</h2></div><Paintbrush size={18} className="head-icon"/></div>
                <div className="preset-grid">{presets.map(p=><button key={p.id} className={`preset-choice ${preset===p.id?"preset-active":""}`} onClick={()=>setPreset(p.id)} aria-pressed={preset===p.id}><span className={`preset-swatch ${p.className}`}>{preset===p.id&&<Check size={18}/>}</span><span>{p.name}</span></button>)}</div>
                <div className="adjustments-header"><div><SlidersHorizontal size={17}/><strong>Fine-tune</strong></div><button onClick={()=>setAdjustments({brightness:100,contrast:100,saturation:100})} disabled={!hasChanges}><RotateCcw size={14}/> Reset</button></div>
                {(["brightness","contrast","saturation"] as const).map(k=><label className="slider-control" key={k}><span><strong>{k[0].toUpperCase()+k.slice(1)}</strong><small>{adjustments[k]}%</small></span><input type="range" min={k==="brightness"?60:50} max={k==="brightness"?140:150} value={adjustments[k]} onChange={e=>setAdjustments(v=>({...v,[k]:Number(e.target.value)}))}/></label>)}
              </section>
            </div>
            <div className="studio-right-col">
              <section className="studio-card preview-card">
                <div className="studio-card-head"><div><span className="section-step">LIVE PREVIEW</span><h2>Your product, elevated.</h2></div>{cutout?<span className="success-tag"><Check size={14}/> Cutout ready</span>:<span className="preview-tag"><ImageIcon size={14}/> {original?"Original image":"Demo visual"}</span>}</div>
                <div className="preview-area">
                  {!original ? <div className="demo-preview"><div className="demo-glow"/><img src="/demo-bottle.svg" alt="Illustrative sample bottle, not a processed user image"/><div className="demo-caption"><span>✦</span> Sample look only — upload your own product to start</div></div> :
                  <div className="comparison-preview">
                    <div className="comparison-before"><img src={original} alt="Original product before background removal"/></div>
                    {cutout && <><div className="comparison-after" style={{clipPath:`inset(0 ${100-comparison}% 0 0)`}}><div className={`comparison-backdrop ${activePreset.className}`}/><img src={cutout} alt="Product with removed background" style={{filter:`brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`}}/></div><div className="comparison-line" style={{left:`${comparison}%`}}><span><ArrowLeft size={12}/><ArrowRight size={12}/></span></div><input className="comparison-slider" type="range" min={0} max={100} value={comparison} onChange={e=>setComparison(Number(e.target.value))} aria-label="Drag to compare original and processed image"/></>}
                    <span className="comparison-original-label">BEFORE</span>{cutout&&<span className="comparison-after-label">AFTER</span>}
                    {!cutout&&<div className="preview-unprocessed">Remove the background to see your studio look.</div>}
                  </div>}
                </div>
                <div className="preview-meta"><div><span className="preview-meta-dot"/><span>{cutout?"AI background removed":"Awaiting product cutout"}</span></div><span>{cutout?"Move slider to compare":"Local preview"}</span></div>
              </section>
              <section className="studio-card download-card"><div className="studio-card-head"><div><span className="section-step">STEP 03</span><h2>Export your masterpiece</h2></div><Download size={19} className="head-icon"/></div>
                <div className="download-actions"><button disabled={!cutout||exporting} onClick={exportStudio} className="btn btn-purple">{exporting?<LoaderCircle size={17} className="spin"/>:<ArrowDownToLine size={18}/>} {exporting?"Exporting…":"Download studio PNG"}</button><button disabled={!cutout} onClick={exportTransparent} className="btn btn-outline"><Download size={17}/> Transparent PNG</button></div><p className="export-note">Studio export is 1200 × 1200px. The transparent export keeps your original cutout. You must remove the background before export.</p>
              </section>
              <button className="copy-nudge" onClick={()=>setSection("copy")}><span className="nudge-icon"><PenLine size={21}/></span><span><strong>Now make it sell.</strong><small>Turn your product details into captions and listings.</small></span><ArrowRight size={19}/></button>
            </div>
          </div>
        </> : <div className="copy-grid">
          <section className="studio-card copy-input-card"><div className="studio-card-head"><div><span className="section-step">YOUR PRODUCT</span><h2>Tell us about it</h2></div><FileText size={19} className="head-icon"/></div>
            <div className="form-fields"><label className="field"><span>Product name <b>*</b></span><input maxLength={120} placeholder="e.g. Ribbed Cotton Tote Bag" value={product.name} onChange={e=>update("name",e.target.value)}/></label>
              <label className="field"><span>Category</span><input placeholder="e.g. Bags & Accessories" maxLength={90} value={product.category} onChange={e=>update("category",e.target.value)}/></label>
              <label className="field"><span>Verified features & details</span><textarea placeholder="Material, size, color, included items, and other details you can verify…" maxLength={1200} rows={5} value={product.features} onChange={e=>update("features",e.target.value)}/><small>Only enter true details. AI is instructed not to invent product claims.</small></label>
              <label className="field"><span>Price (optional)</span><input placeholder="e.g. ₱349" maxLength={60} value={product.price} onChange={e=>update("price",e.target.value)}/></label>
              <div className="field-row"><label className="field"><span>Marketplace</span><select value={product.platform} onChange={e=>update("platform",e.target.value as Platform)}>{(["Shopee","Lazada","TikTok Shop","Facebook","Instagram"] as Platform[]).map(v=><option key={v}>{v}</option>)}</select></label><label className="field"><span>Tone</span><select value={product.tone} onChange={e=>update("tone",e.target.value as Tone)}>{(["Friendly","Premium","Playful","Minimal"] as Tone[]).map(v=><option key={v}>{v}</option>)}</select></label></div>
              <label className="field"><span>Language</span><select value={product.language} onChange={e=>update("language",e.target.value as Language)}>{(["Taglish","English","Filipino"] as Language[]).map(v=><option key={v}>{v}</option>)}</select></label>
              <button className="btn btn-purple process-button" onClick={generateCopy} disabled={generating}>{generating?<LoaderCircle className="spin" size={18}/>:<WandSparkles size={18}/>} {generating?"Writing your draft…":"Generate listing copy"}</button>{copyError&&<p className={copyResult?"notice-message":"error-message"} role="status">{copyError}</p>}
              <p className="under-button"><ShieldCheck size={14}/> Gemini is optional. Without a key, you'll get a clearly labeled template draft.</p>
            </div>
          </section>
          <section className="studio-card copy-output-card"><div className="studio-card-head"><div><span className="section-step">YOUR CONTENT</span><h2>Ready to copy & paste</h2></div>{copyResult?<span className={copyResult.source==="gemini"?"success-tag":"preview-tag"}>{copyResult.source==="gemini"?"Gemini AI draft":"Local template draft"}</span>:<span className="preview-tag">Not generated</span>}</div>
            {!copyResult?<div className="copy-empty"><span><Sparkles size={34}/></span><h3>Your words, but a little more magical.</h3><p>Enter product details on the left, then generate ready-to-review listing content for your shop.</p></div>:<div className="result-list">
              {([{key:"title",label:"Product title",value:copyResult.title},{key:"description",label:"Product description",value:copyResult.description},{key:"caption",label:"Marketing caption",value:copyResult.caption},{key:"hashtags",label:"Hashtags",value:copyResult.hashtags}] as const).map(r=><div className="result-card" key={r.key}><div className="result-head"><strong>{r.label}</strong><button onClick={()=>copyValue(r.value,r.key)}><ClipboardCopy size={14}/>{copied===r.key?"Copied!":"Copy"}</button></div><div className="result-text">{r.value}</div></div>)}
              <button className="btn btn-outline export-text" onClick={exportText}><Download size={16}/> Download listing (.txt)</button><p className="export-note">AI drafts can contain mistakes. Review all product information, policies, and claims before posting.</p>
            </div>}
          </section>
        </div>}
      </main>
    </div>
  </div>;
}
