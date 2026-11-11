import Link from "next/link";
import { ArrowRight, Check, Layers3, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const templates=[
  {id:"white",title:"Clean Marketplace",category:"Clean studio",info:"Classic crisp background for catalog products.",cls:"white",name:"Best for marketplaces"},
  {id:"lavender",title:"Soft Lavender",category:"Pastel collection",info:"Gentle lavender setting for lifestyle products.",cls:"lavender",name:"Soft & calming"},
  {id:"peach",title:"Warm Peach",category:"Warm collection",info:"Warm-toned product look with a friendly feel.",cls:"peach",name:"Warm & friendly"},
  {id:"mint",title:"Fresh Mint",category:"Minimal colors",info:"Cool mint backdrop with fresh, clean energy.",cls:"mint",name:"Modern & fresh"},
  {id:"midnight",title:"Midnight Luxe",category:"Moody studio",info:"Deep contrast for accessories and premium pieces.",cls:"midnight",name:"Dark & refined"}
];
export default function TemplatesPage() {
  return <AppShell title="Product Templates" description="Pick a background mood and customize it with your own product photo." actions={<Link href="/studio" className="ui-btn ui-btn-outline">Open Studio <ArrowRight size={16}/></Link>}>
    <div className="feature-notice"><Layers3 size={19}/><div><strong>Simple background presets</strong><p>These are gradient studio looks, not AI-generated lifestyle scenes. Upload a product to create your own.</p></div></div>
    <div className="template-grid">{templates.map(t=><div className="template-card" key={t.id}><div className={`template-preview template-${t.cls}`}><div className="template-image-wrap"><img src="/demo-headphones.svg" alt={`Illustrated headphones on ${t.title} background`}/></div><span className="template-chip">SAMPLE LOOK</span></div><div className="template-body"><small>{t.category}</small><h3>{t.title}</h3><p>{t.info}</p><Link className="template-button" href={`/studio?preset=${t.id}`}>Use this style <ArrowRight size={16}/></Link></div></div>)}</div>
  </AppShell>;
}
