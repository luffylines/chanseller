import Link from "next/link";
import { ArrowRight, Layers3, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { scenePaths, type PresetId } from "@/lib/image";

const templates: {id:PresetId;title:string;category:string;info:string;tag:string}[]=[
  {id:"white",title:"Clean Marketplace",category:"Everyday essential",info:"A crisp, simple white product backdrop.",tag:"Classic"},
  {id:"color",title:"Pastel Color",category:"Color collection",info:"Soft blue, lilac and pink for modern brands.",tag:"Trending"},
  {id:"studio",title:"Warm Studio",category:"Photo studio",info:"Natural warm tones with a tabletop setting.",tag:"Studio"},
  {id:"lifestyle",title:"Fresh Lifestyle",category:"Lifestyle",info:"A bright interior with subtle styling props.",tag:"Lifestyle"},
  {id:"minimal",title:"Minimal Display",category:"Minimal collection",info:"A clean architectural display backdrop.",tag:"Minimal"},
  {id:"lavender",title:"Soft Lavender",category:"Color collection",info:"Gentle lavender tones for delicate products.",tag:"Soft"},
];
export default function TemplatesPage(){
 return <AppShell title="Templates" description="Ready-made layouts for beautiful, consistent product images." actions={<Link href="/studio" className="ui-btn ui-btn-primary"><Sparkles size={16}/> Create New</Link>}>
    <div className="feature-notice reference-notice"><Layers3 size={20}/><div><strong>Product background presets</strong><p>Select one of the studio looks. The scene images are decorative preset assets; uploading and cutting out your product requires the local AI worker.</p></div></div>
    <div className="template-grid">{templates.map(t=><article className="template-card" key={t.id}>
      <div className={`template-preview preset-${t.id}`} style={scenePaths[t.id]?{backgroundImage:`url(${scenePaths[t.id]})`,backgroundSize:"cover",backgroundPosition:"center"}:undefined}>
        <span className="template-chip">{t.tag}</span>
        <div className="template-image-wrap"><img src="/demo-headphones.svg" alt={`Illustrative headphones in ${t.title} style`}/></div>
      </div>
      <div className="template-body"><small>{t.category}</small><h3>{t.title}</h3><p>{t.info}</p><Link className="template-button" href={`/studio?preset=${t.id}`}>Use Template <ArrowRight size={16}/></Link></div>
    </article>)}</div>
  </AppShell>;
}
