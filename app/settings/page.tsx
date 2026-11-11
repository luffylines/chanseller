"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { eraseLocalData } from "@/lib/local-data";
import { AlertTriangle, ArrowRight, BellOff, Check, ChevronRight, CircleHelp, CreditCard, Database, Eye, KeyRound, LockKeyhole, Palette, Save, Settings2, ShieldCheck, Trash2, Upload, UserRound } from "lucide-react";

type SettingsTab="profile"|"billing"|"api"|"preferences";
type Profile={name:string;email:string;shop:string;avatar?:string};
type Preferences={compact:boolean;reduceMotion:boolean};
const initial:Profile={name:"ChanSeller User",email:"",shop:""};
const initialPrefs:Preferences={compact:false,reduceMotion:false};
const navigation=[
 {id:"profile",label:"Profile",icon:UserRound},
 {id:"billing",label:"Plan & Billing",icon:CreditCard},
 {id:"api",label:"API Keys",icon:KeyRound},
 {id:"preferences",label:"Preferences",icon:Settings2},
] as const;
export default function SettingsPage(){
 const [tab,setTab]=useState<SettingsTab>("profile");
 const [profile,setProfile]=useState<Profile>(initial);
 const [prefs,setPrefs]=useState<Preferences>(initialPrefs);
 const [saved,setSaved]=useState("");
 const [error,setError]=useState("");
 const [erased,setErased]=useState(false);
 const fileRef=useRef<HTMLInputElement|null>(null);
 useEffect(()=>{
   try{const value=localStorage.getItem("chanseller-profile");if(value)setProfile({...initial,...JSON.parse(value)});}catch{}
   try{const value=localStorage.getItem("chanseller-prefs");if(value)setPrefs({...initialPrefs,...JSON.parse(value)});}catch{}
 },[]);
 function update<K extends keyof Profile>(name:K,value:Profile[K]){setProfile(p=>({...p,[name]:value}));setSaved("");}
 function saveProfile(){
   try{
     localStorage.setItem("chanseller-profile",JSON.stringify(profile));
     window.dispatchEvent(new Event("chanseller-profile-updated"));
     setSaved("Profile preferences saved to this browser.");setError("");
   }catch{setError("Could not save your local profile. Check browser storage permissions.");}
 }
 function setPreference(name:keyof Preferences,checked:boolean){
   const next={...prefs,[name]:checked};setPrefs(next);
   try{
     localStorage.setItem("chanseller-prefs",JSON.stringify(next));
     document.body.classList.toggle("chanseller-compact",next.compact);
     document.body.classList.toggle("chanseller-reduced-motion",next.reduceMotion);
     setSaved("Preferences saved in this browser.");setError("");
   }catch{setError("Unable to store preferences in this browser.");}
 }
 function selectPhoto(file?:File){
   if(!file)return;
   if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>350000){setError("Use a JPG, PNG, or WebP image smaller than 350KB.");return;}
   const reader=new FileReader();
   reader.onload=()=>{if(typeof reader.result==="string")update("avatar",reader.result);setError("");};
   reader.onerror=()=>setError("Couldn't read the photo.");
   reader.readAsDataURL(file);
 }
 async function clearData(){
   if(!window.confirm("Delete ALL local ChanSeller images, drafts, brand details, account preview and preferences in this browser? This cannot be undone."))return;
   try{
     await eraseLocalData();
     localStorage.removeItem("chanseller-prefs");
     document.body.classList.remove("chanseller-compact","chanseller-reduced-motion");
     setProfile(initial);setPrefs(initialPrefs);setErased(true);setSaved("");setError("");
     window.dispatchEvent(new Event("chanseller-profile-updated"));
   }catch(e){setError(e instanceof Error?e.message:"Couldn't erase your data.");}
 }
 return <AppShell title="Settings" description="Manage your account, plan and preferences.">
   <div className="settings-reference-grid">
     <aside className="workspace-card settings-subnav"><div className="settings-subnav-heading">ACCOUNT SETTINGS</div><nav aria-label="Settings sections">{navigation.map(item=><button key={item.id} className={tab===item.id?"selected":""} aria-current={tab===item.id?"page":undefined} onClick={()=>{setTab(item.id);setSaved("");setError("");}}><item.icon size={16}/>{item.label}<ChevronRight size={14}/></button>)}</nav><div className="settings-subnav-foot"><ShieldCheck size={18}/><span>All settings are local until account registration is enabled.</span></div></aside>
     <div className="settings-content-stack">
       {tab==="profile"&&<section className="workspace-card settings-detail">
         <div className="panel-heading"><span className="panel-icon blue"><UserRound size={20}/></span><div><h2>Profile</h2><p>Update your personal information for this browser's demo.</p></div></div>
         <div className="profile-edit-row"><div className="profile-picture">{profile.avatar?<img src={profile.avatar} alt="Your selected profile photo"/>:profile.name.charAt(0).toUpperCase()||"C"}</div><div><strong>Profile photo</strong><p>JPG, PNG or WebP under 350KB</p><button className="ui-btn ui-btn-outline" onClick={()=>fileRef.current?.click()}><Upload size={15}/> Change Photo</button><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e=>{selectPhoto(e.target.files?.[0]);e.currentTarget.value="";}}/></div></div>
         <div className="settings-form-grid"><label className="form-field">Name<input value={profile.name} maxLength={90} onChange={e=>update("name",e.target.value)} placeholder="Your name"/></label><label className="form-field">Email <small className="field-optional">Reference only</small><input type="email" value={profile.email} maxLength={120} onChange={e=>update("email",e.target.value)} placeholder="you@example.com"/></label><label className="form-field">Shop name<input value={profile.shop} maxLength={90} onChange={e=>update("shop",e.target.value)} placeholder="e.g. Chan's Store"/></label></div>
         <div className="settings-bottom-bar"><span><LockKeyhole size={14}/> No login credentials are stored.</span><button onClick={saveProfile} className="ui-btn ui-btn-primary"><Save size={16}/> Save Changes</button></div>
       </section>}
       {tab==="billing"&&<section className="workspace-card settings-detail">
         <div className="panel-heading"><span className="panel-icon blue"><CreditCard size={20}/></span><div><h2>Plan & Billing</h2><p>Review your current preview plan.</p></div></div>
         <div className="settings-current-plan"><div><span>CURRENT PLAN</span><h3>Free Local Preview</h3><p>Product Studio and copy drafts available on your computer.</p></div><span className="status-pill">Active locally</span></div>
         <div className="settings-status"><Database size={18}/><div><strong>Dedicated cloud database</strong><small>Not connected. ChanSeller will have its own database when approved.</small></div><span className="status-pill muted">Pending</span></div>
         <div className="settings-status"><CreditCard size={18}/><div><strong>Payment method</strong><small>None saved, no payment processing or subscriptions.</small></div><span className="status-pill muted">Disabled</span></div>
         <Link className="ui-btn ui-btn-outline" href="/pricing">View proposed pricing <ArrowRight size={16}/></Link>
       </section>}
       {tab==="api"&&<section className="workspace-card settings-detail">
         <div className="panel-heading"><span className="panel-icon blue"><KeyRound size={20}/></span><div><h2>API Keys</h2><p>Connect your own Gemini key safely during local development.</p></div></div>
         <div className="feature-notice"><LockKeyhole size={18}/><div><strong>Never type or save a private key in this page.</strong><p>API keys belong in the server-side <code>.env.local</code> file, not your browser or GitHub repository.</p></div></div>
         <div className="api-instructions"><span>01</span><div><strong>Create a Gemini API key</strong><p>Use Google AI Studio to generate a key that has API access.</p></div></div>
         <div className="api-instructions"><span>02</span><div><strong>Open <code>D:\chanseller\.env.local</code></strong><p>Add the following line and replace the placeholder locally:</p><code className="api-command">GEMINI_API_KEY=your_private_key</code></div></div>
         <div className="api-instructions"><span>03</span><div><strong>Restart Next.js</strong><p>Stop the terminal and run <code>npm.cmd run dev</code> again. Only entered product text is sent to Gemini.</p></div></div>
       </section>}
       {tab==="preferences"&&<section className="workspace-card settings-detail">
         <div className="panel-heading"><span className="panel-icon blue"><Palette size={20}/></span><div><h2>Preferences</h2><p>Customize the display of this browser's workspace.</p></div></div>
         <div className="settings-preference"><div><strong>Compact layout</strong><p>Reduce padding between workspace panels and cards.</p></div><label className="toggle-control" aria-label="Toggle compact layout"><input type="checkbox" checked={prefs.compact} onChange={e=>setPreference("compact",e.target.checked)}/><span/></label></div>
         <div className="settings-preference"><div><strong>Reduce animations</strong><p>Disable most interface transitions and motion.</p></div><label className="toggle-control" aria-label="Toggle reduced animations"><input type="checkbox" checked={prefs.reduceMotion} onChange={e=>setPreference("reduceMotion",e.target.checked)}/><span/></label></div>
         <div className="settings-preference"><div><strong>Brand color</strong><p>Light-blue is the main theme. Set your shop's custom color in Brand Kit.</p></div><Link href="/brand-kit" className="ui-btn ui-btn-outline">Brand Kit <ArrowRight size={15}/></Link></div>
       </section>}
       {error&&<p role="alert" className="ui-error">{error}</p>}
       {saved&&<p role="status" className="ui-success"><Check size={16}/>{saved}</p>}
       <section className="workspace-card settings-danger"><div className="panel-heading"><span className="panel-icon danger"><AlertTriangle size={20}/></span><div><h2>Data management</h2><p>Delete local ChanSeller data saved in this browser.</p></div></div><div className="settings-bottom-bar"><span>Irreversible — clears products, drafts and local settings.</span><button className="ui-btn ui-btn-danger" onClick={clearData}><Trash2 size={16}/> Delete Local Data</button></div>{erased&&<p className="ui-success"><Check size={16}/> Local data cleared successfully.</p>}</section>
     </div>
   </div>
 </AppShell>;
}
