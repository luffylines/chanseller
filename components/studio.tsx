"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createStudioExport, downloadBlob, presets, safeFilename, type Adjustments, type PresetId } from "@/lib/image";
import { generateId, saveProduct } from "@/lib/local-data";
import { ArrowLeftRight, Check, CheckCircle2, ChevronDown, CircleHelp, CloudOff, Copy, Download, Eraser, ImagePlus, Images, Layers3, LoaderCircle, Maximize2, MonitorCheck, Paintbrush, RotateCcw, Save, Scissors, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Upload, UploadCloud, WandSparkles, X } from "lucide-react";

const MAX_BYTES = 8*1024*1024;
const supported = ["image/png","image/jpeg","image/webp"];
type StudioPreset = PresetId | "transparent";
type ExportSize = "square" | "portrait" | "story";
const sizes: {id:ExportSize;label:string;dimensions:string}[] = [
  {id:"square",label:"Square · Marketplace",dimensions:"1200 × 1200"},
  {id:"portrait",label:"Portrait · Social",dimensions:"1080 × 1350"},
  {id:"story",label:"Story · Vertical",dimensions:"1080 × 1920"}
];
function isPreset(value: string|null):value is PresetId {
  return presets.some(p=>p.id===value);
}
export function StudioApp(){
  const [source,setSource]=useState<string|null>(null);
  const [processed,setProcessed]=useState<string|null>(null);
  const [file,setFile]=useState<File|null>(null);
  const sourceRef=useRef<string|null>(null);
  const processedRef=useRef<string|null>(null);
  const fileInput=useRef<HTMLInputElement|null>(null);
  const [preset,setPreset]=useState<StudioPreset>("white");
  const [adjust,setAdjust]=useState<Adjustments>({brightness:100,contrast:100,saturation:100});
  const [exportSize,setExportSize]=useState<ExportSize>("square");
  const [shadow,setShadow]=useState(true);
  const [watermark,setWatermark]=useState(false);
  const [zoom,setZoom]=useState(100);
  const [compare,setCompare]=useState(false);
  const [split,setSplit]=useState(50);
  const [processing,setProcessing]=useState(false);
  const [saving,setSaving]=useState(false);
  const [exporting,setExporting]=useState(false);
  const [filename,setFilename]=useState("New Product");
  const [worker,setWorker]=useState<"checking"|"online"|"offline">("checking");
  const [showWorkerHelp,setShowWorkerHelp]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [drag,setDrag]=useState(false);
  const [activeTool,setActiveTool]=useState<"remove"|"background"|"adjust"|"shadow"|"resize"|"watermark">("remove");
  const base=(process.env.NEXT_PUBLIC_BG_API_URL||"http://127.0.0.1:8000").replace(/\/$/,"");

  useEffect(()=>{
    const requested=new URLSearchParams(window.location.search).get("preset");
    if(isPreset(requested))setPreset(requested);
    let live=true;
    fetch(`${base}/health`,{signal:AbortSignal.timeout(3800)}).then(r=>{
      if(live)setWorker(r.ok?"online":"offline");
    }).catch(()=>{if(live)setWorker("offline");});
    return()=>{live=false;};
  },[base]);
  useEffect(()=>()=>{if(sourceRef.current)URL.revokeObjectURL(sourceRef.current);if(processedRef.current)URL.revokeObjectURL(processedRef.current);},[]);
  function setCutout(url:string|null){
    if(processedRef.current)URL.revokeObjectURL(processedRef.current);
    processedRef.current=url;setProcessed(url);
  }
  function takeFile(next?:File){
    if(!next)return;
    setError("");setSuccess("");
    if(!supported.includes(next.type)){setError("Please select a JPG, PNG or WebP image.");return;}
    if(next.size>MAX_BYTES){setError("The maximum image size is 8MB.");return;}
    if(sourceRef.current)URL.revokeObjectURL(sourceRef.current);
    const url=URL.createObjectURL(next);sourceRef.current=url;
    setSource(url);setCutout(null);setFile(next);setCompare(false);
    setFilename(next.name.replace(/\.[a-z0-9]+$/i,"").replace(/[-_]/g," ").trim()||"New Product");
    setAdjust({brightness:100,contrast:100,saturation:100});setZoom(100);
    setActiveTool("remove");
  }
  function clearFile(){
    if(sourceRef.current)URL.revokeObjectURL(sourceRef.current);
    sourceRef.current=null;setSource(null);setCutout(null);setFile(null);
    setError("");setSuccess("");
  }
  async function removeBackground(){
    if(!file||processing)return;
    setError("");setSuccess("");setProcessing(true);
    try{
      const form=new FormData();form.append("file",file);
      const response=await fetch(`${base}/remove-background`,{method:"POST",body:form});
      if(!response.ok){
        const json:{detail?:string}=await response.json().catch(()=>({}));
        throw new Error(json.detail||`Local worker returned HTTP ${response.status}.`);
      }
      const blob=await response.blob();
      if(!blob.type.includes("png"))throw new Error("The image worker did not return a PNG.");
      setCutout(URL.createObjectURL(blob));
      setCompare(false);setWorker("online");setSuccess("Background successfully removed. Customize and save your result.");
      setActiveTool("background");
    }catch(e){
      const message=e instanceof Error?e.message:"Processing failed.";
      if(message==="Failed to fetch"||message.toLowerCase().includes("network")){
        setWorker("offline");setShowWorkerHelp(true);setError("The local AI worker is offline. Start the Python worker on port 8000, then retry.");
      }else setError(message);
    }finally{setProcessing(false);}
  }
  const actualPreset:PresetId=preset==="transparent"?"white":preset;
  async function currentExport(){
    if(!processed)throw new Error("Remove the background before exporting.");
    if(preset==="transparent"){
      const response=await fetch(processed);return response.blob();
    }
    let brand="";
    if(watermark){try{const stored=JSON.parse(localStorage.getItem("chanseller-brand-kit")||"{}");brand=String(stored.name||"ChanSeller").slice(0,45);}catch{brand="ChanSeller";}}
    return createStudioExport(processed,actualPreset,adjust,{size:exportSize,shadow,watermark:brand});
  }
  async function exportImage(){
    if(!processed||exporting)return;
    setExporting(true);setError("");setSuccess("");
    try{const blob=await currentExport();downloadBlob(blob,`${safeFilename(filename)}-${preset==="transparent"?"transparent":"studio"}.png`);setSuccess("Image downloaded successfully.");}
    catch(e){setError(e instanceof Error?e.message:"Export failed.");}
    finally{setExporting(false);}
  }
  async function saveImage(){
    if(!processed||saving)return;
    setSaving(true);setError("");setSuccess("");
    try{
      const blob=await currentExport();
      await saveProduct({id:generateId(),name:filename.trim()||"New Product",createdAt:Date.now(),preset, image:blob});
      setSuccess("Project saved to My Products on this browser.");
    }catch(e){setError(e instanceof Error?e.message:"Unable to save locally.");}
    finally{setSaving(false);}
  }
  async function copyCommand(){
    try{await navigator.clipboard.writeText("python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload");setSuccess("Python start command copied.");}
    catch{setError("Clipboard blocked. Copy the command manually.");}
  }
  const chosen=presets.find(p=>p.id===preset);
  const style={filter:`brightness(${adjust.brightness}%) contrast(${adjust.contrast}%) saturate(${adjust.saturation}%)`,transform:`scale(${zoom/100})`,filterShadow:shadow} as const;
  const imageStyle={filter:`${style.filter} ${shadow?"drop-shadow(0 18px 13px rgba(26,47,78,.18))":""}`, transform:style.transform};
  const sideTools=[
    {id:"remove",label:"Remove Background",icon:Eraser},
    {id:"background",label:"Background",icon:Paintbrush},
    {id:"adjust",label:"Adjustments",icon:SlidersHorizontal},
    {id:"shadow",label:"Shadow & Effects",icon:Sparkles},
    {id:"resize",label:"Resize",icon:Maximize2},
    {id:"watermark",label:"Watermark / Logo",icon:Layers3}
  ] as const;
  return <AppShell title="Product Studio" description="Edit, transform and elevate your product images with AI." actions={<div className="studio-header-actions"><button className="ui-btn ui-btn-outline" onClick={()=>{setAdjust({brightness:100,contrast:100,saturation:100});setZoom(100);setShadow(true);setWatermark(false);setPreset("white");setCompare(false);setSuccess("Editor adjustments reset.");}}><RotateCcw size={15}/> Reset</button><button disabled={!processed||saving} onClick={saveImage} className="ui-btn ui-btn-primary">{saving?<LoaderCircle size={16} className="spin"/>:<Save size={16}/>} Save to My Products</button></div>}>
    <div className="studio-main-grid">
      <aside className="workspace-card editor-tool-panel">
        <div className="edit-panel-title"><strong>Edit Tools</strong><span>PHOTO EDITOR</span></div>
        <nav className="edit-tools-list" aria-label="Photo editing tools">{sideTools.map(t=><button key={t.id} onClick={()=>setActiveTool(t.id)} className={activeTool===t.id?"selected":""}><t.icon size={17}/><span>{t.label}</span><ChevronDown size={14} className="tool-chevron"/></button>)}</nav>
        <div className="editor-tool-content">
          {activeTool==="remove"&&<div className="tool-details"><h3><Scissors size={16}/> AI Background Removal</h3><p>Isolate the product using a real local AI model. No fake cutout overlay.</p><button onClick={()=>fileInput.current?.click()} className="ui-btn ui-btn-outline full-width"><Upload size={15}/> Choose Photo</button><button onClick={removeBackground} disabled={!file||processing} className="ui-btn ui-btn-primary full-width">{processing?<LoaderCircle size={16} className="spin"/>:<WandSparkles size={16}/>} {processing?"Processing…":processed?"Re-process Image":"Remove Background"}</button></div>}
          {activeTool==="background"&&<div className="tool-details"><h3><Paintbrush size={16}/> Background Style</h3><p>Choose from transparent, white and four colorful studio looks.</p><div className="sidebar-swatches">{(["transparent",...presets.map(p=>p.id)] as StudioPreset[]).map(value=><button key={value} className={`side-swatch ${preset===value?"selected":""}`} title={value} aria-label={`Use ${value} background`} aria-pressed={preset===value} onClick={()=>setPreset(value)}><span className={value==="transparent"?"checker-swatch":`preset-${value}`}/></button>)}</div></div>}
          {activeTool==="adjust"&&<div className="tool-details"><h3><SlidersHorizontal size={16}/> Fine-tune</h3>{(["brightness","contrast","saturation"] as const).map(k=><label className="tool-range" key={k}><span><strong>{k[0].toUpperCase()+k.slice(1)}</strong>{adjust[k]}%</span><input type="range" min={50} max={150} value={adjust[k]} onChange={e=>setAdjust(a=>({...a,[k]:Number(e.target.value)}))}/></label>)}<button className="text-reset" onClick={()=>setAdjust({brightness:100,contrast:100,saturation:100})}><RotateCcw size={14}/> Reset adjustments</button></div>}
          {activeTool==="shadow"&&<div className="tool-details"><h3><Sparkles size={16}/> Shadow & Effects</h3><p>Add subtle grounding to your final export.</p><label className="tool-checkbox"><input type="checkbox" checked={shadow} onChange={e=>setShadow(e.target.checked)}/> Soft product shadow</label></div>}
          {activeTool==="resize"&&<div className="tool-details"><h3><Maximize2 size={16}/> Export Size</h3><label className="tool-select"><span>Canvas dimensions</span><select value={exportSize} onChange={e=>setExportSize(e.target.value as ExportSize)}>{sizes.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select></label><p>{sizes.find(s=>s.id===exportSize)?.dimensions}px output.</p></div>}
          {activeTool==="watermark"&&<div className="tool-details"><h3><Layers3 size={16}/> Brand Watermark</h3><p>Uses the shop name from your Brand Kit, or ChanSeller if none is set.</p><label className="tool-checkbox"><input type="checkbox" checked={watermark} onChange={e=>setWatermark(e.target.checked)}/> Add a small brand label</label><Link href="/brand-kit" className="inline-link">Edit Brand Kit ↗</Link></div>}
        </div>
        <div className="local-worker-box"><span className={`worker-light ${worker}`}/><div><strong>Local AI worker</strong><small>{worker==="checking"?"Checking connection...":worker==="online"?"Connected on port 8000":"Not running — setup required"}</small></div><button title="Worker setup steps" aria-label="Worker setup steps" onClick={()=>setShowWorkerHelp(v=>!v)}><CircleHelp size={17}/></button></div>
      </aside>

      <section className="workspace-card editor-canvas-card">
        <div className="canvas-toolbar"><div className="canvas-tabset"><span className="canvas-tab-current">Result</span><button onClick={()=>{if(processed)setCompare(v=>!v);}} disabled={!processed} className={compare?"canvas-tab-active":""}>Before / After</button></div><div className="canvas-icon-actions"><button onClick={()=>fileInput.current?.click()} title="Upload another image" aria-label="Upload another image"><ImagePlus size={17}/></button>{file&&<button onClick={clearFile} title="Clear image" aria-label="Clear image"><X size={17}/></button>}</div></div>
        <input ref={fileInput} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose product image" onChange={e=>{takeFile(e.target.files?.[0]);e.currentTarget.value="";}}/>
        <div className={`editor-canvas ${preset==="transparent"?"checker-canvas":""}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);takeFile(e.dataTransfer.files?.[0]);}}>
          {processed ? <div className="canvas-render" style={preset==="transparent"?undefined:{background:chosen?`linear-gradient(135deg,${chosen.colors[0]},${chosen.colors[1]})`:"#fff"}}>
            <img src={processed} alt="Product with its original background removed" className="canvas-main-image" style={imageStyle}/>
            {watermark&&<span className="watermark-preview">BRAND WATERMARK</span>}
            {compare&&source&&<><div className="canvas-before" style={{clipPath:`inset(0 ${100-split}% 0 0)`}}><img src={source} alt="Original product for before and after comparison"/></div><div className="canvas-split-line" style={{left:`${split}%`}}><span><ArrowLeftRight size={15}/></span></div><input type="range" min="0" max="100" value={split} onChange={e=>setSplit(Number(e.target.value))} className="canvas-split-range" aria-label="Move before and after comparison"/></>}
          </div>:source?<div className="canvas-original"><img src={source} alt="Product image before AI background removal" className="canvas-main-image"/><span className="canvas-original-label">Original photo · Run background removal for editing</span></div>:
          <button className={`canvas-upload-prompt ${drag?"canvas-drag":""}`} onClick={()=>fileInput.current?.click()}><span className="canvas-prompt-icon"><UploadCloud size={30}/></span><strong>Drop your product image here</strong><span>or click to browse files</span><small>JPG, PNG or WebP · Max 8 MB</small></button>}
          {processing&&<div className="canvas-loading"><LoaderCircle size={35} className="spin"/><strong>Removing background...</strong><p>First run may take longer while the AI model downloads.</p></div>}
        </div>
        <div className="canvas-bottom-toolbar"><div><button title="Reset zoom" onClick={()=>setZoom(100)}><RotateCcw size={16}/></button><span className="canvas-toolbar-divider"/><button onClick={()=>setZoom(z=>Math.max(60,z-10))} aria-label="Zoom out">−</button><span>{zoom}%</span><button onClick={()=>setZoom(z=>Math.min(150,z+10))} aria-label="Zoom in">+</button></div><span className="canvas-footnote"><MonitorCheck size={15}/> {processed?"AI cutout ready":"Preview mode"}</span></div>
        <label className="studio-name-field"><span>PROJECT NAME</span><input maxLength={90} value={filename} onChange={e=>setFilename(e.target.value)} aria-label="Project name"/></label>
      </section>

      <aside className="workspace-card editor-export-panel">
        <div className="edit-panel-title"><strong>Background</strong><span>APPEARANCE</span></div>
        <div className="background-grid">{([{id:"transparent",name:"Transparent"},...presets.map(p=>({id:p.id,name:({white:"White",peach:"Warm peach",lavender:"Soft lilac",mint:"Fresh mint",midnight:"Midnight"} as Record<string,string>)[p.id]}))] as {id:StudioPreset;name:string}[]).map(option=>
          <button className={`background-choice ${preset===option.id?"background-selected":""}`} onClick={()=>setPreset(option.id)} key={option.id}>
            <span className={option.id==="transparent"?"checker-swatch":`preset-${option.id}`}>{option.id!=="transparent"&&<img src="/demo-headphones.svg" alt=""/>}</span>
            <small>{option.name}</small>
          </button>)}</div>
        <div className="export-panel-separator"/>
        <div className="export-panel-options"><label>Export size</label><select value={exportSize} onChange={e=>setExportSize(e.target.value as ExportSize)}>{sizes.map(s=><option value={s.id} key={s.id}>{s.label} ({s.dimensions})</option>)}</select><p><CheckCircle2 size={15}/> PNG · high-quality output</p></div>
        <button disabled={!processed||exporting} onClick={exportImage} className="ui-btn ui-btn-primary full-width">{exporting?<LoaderCircle size={17} className="spin"/>:<Download size={18}/>} Download Image</button>
        <button disabled={!processed||saving} onClick={saveImage} className="ui-btn ui-btn-outline full-width"><Save size={17}/> Save to My Products</button>
        <div className="export-assurance"><ShieldCheck size={17}/><p>No image is sent to a third-party image API. Processing goes to your own local Python worker.</p></div>
      </aside>
    </div>
    {(error||success||showWorkerHelp)&&<section className="studio-messages" aria-live="polite">{error&&<div className="ui-error">{error}</div>}{success&&<div className="ui-success"><Check size={16}/>{success}</div>}{showWorkerHelp&&<div className="feature-notice"><CloudOff size={20}/><div><strong>Start the free AI image worker in another PowerShell terminal</strong><p>From D:\chanseller, run the Python setup described in the README. Once installed, activate its virtual environment and use this command:</p><code>python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload</code><div className="worker-actions"><button className="ui-btn ui-btn-outline" onClick={copyCommand}><Copy size={15}/> Copy command</button><a href="https://github.com/luffylines/chanseller#run-locally-two-terminals" target="_blank" rel="noreferrer" className="ui-btn ui-btn-outline">Setup instructions ↗</a><button onClick={()=>{setWorker("checking");fetch(`${base}/health`,{signal:AbortSignal.timeout(3500)}).then(r=>setWorker(r.ok?"online":"offline")).catch(()=>setWorker("offline"));}} className="ui-btn ui-btn-primary"><RotateCcw size={15}/> Check worker</button></div></div></div>}</section>}
  </AppShell>;
}
