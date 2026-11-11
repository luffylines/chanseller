"use client";

import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Database, LockKeyhole, Save, Settings2, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { eraseLocalData } from "@/lib/local-data";

type Profile={name:string,email:string};
const initial:Profile={name:"ChanSeller User",email:""};
export default function SettingsPage(){
  const [profile,setProfile]=useState(initial);const [saved,setSaved]=useState(false);const [cleared,setCleared]=useState(false);const [error,setError]=useState("");
  useEffect(()=>{try{const value=window.localStorage.getItem("chanseller-profile");if(value)setProfile({...initial,...JSON.parse(value)});}catch{}},[]);
  function save(){try{window.localStorage.setItem("chanseller-profile",JSON.stringify(profile));setSaved(true);setError("");}catch{setError("Could not save your local preferences.");}}
  async function clear(){if(!window.confirm("Permanently erase all saved products, listing drafts, brand info and local profile from this browser?"))return;try{await eraseLocalData();setProfile(initial);setCleared(true);setSaved(false);setError("");}catch(e){setError(e instanceof Error?e.message:"Could not erase local data.");}}
  return <AppShell title="Settings" description="Manage your local preferences and see which features are not yet connected.">
    <div className="settings-grid"><section className="workspace-card"><div className="panel-heading"><span className="panel-icon blue"><Settings2 size={20}/></span><div><h2>Profile preferences</h2><p>These details stay in this browser; they are not user accounts.</p></div></div>
    <div className="profile-icon">C</div><label className="form-field">Display name<input value={profile.name} onChange={e=>{setProfile(p=>({...p,name:e.target.value}));setSaved(false);}} maxLength={90} placeholder="Your display name"/></label><label className="form-field">Email (optional reference only)<input value={profile.email} onChange={e=>{setProfile(p=>({...p,email:e.target.value}));setSaved(false);}} type="email" maxLength={120} placeholder="your@email.com"/></label><button onClick={save} className="ui-btn ui-btn-primary"><Save size={16}/> Save Preferences</button>{saved&&<p className="ui-success"><Check size={16}/> Saved in this browser.</p>}</section>
    <div className="settings-stack"><section className="workspace-card"><div className="panel-heading"><span className="panel-icon mint"><Database size={20}/></span><div><h2>Data & security</h2><p>You're in local development mode.</p></div></div><div className="settings-status"><ShieldCheck size={19}/><div><strong>Local-only storage</strong><small>Projects and drafts save to your browser's IndexedDB.</small></div><span className="status-pill">Active</span></div><div className="settings-status"><LockKeyhole size={19}/><div><strong>Cloud authentication</strong><small>Will require a separate ChanSeller database.</small></div><span className="status-pill muted">Not set up</span></div><Link href="/usage" className="settings-link">See local usage <ChevronRight size={16}/></Link></section>
    <section className="workspace-card danger-card"><div className="panel-heading"><span className="panel-icon danger"><AlertTriangle size={20}/></span><div><h2>Reset preview data</h2><p>Clear the data saved by ChanSeller on this device.</p></div></div><button className="ui-btn ui-btn-danger" onClick={clear}><Trash2 size={16}/> Delete all local data</button>{cleared&&<p className="ui-success"><Check size={16}/> Local preview data has been erased.</p>}{error&&<p className="ui-error">{error}</p>}</section></div></div>
  </AppShell>;
}
