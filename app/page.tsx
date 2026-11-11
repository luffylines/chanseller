import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Camera, Check, ChevronRight, FilePenLine, Heart, Images, Layers3, Package, PenLine, ShieldCheck, ShoppingBag, Sparkles, Star, UploadCloud, WandSparkles, Zap } from "lucide-react";
import { Brand } from "@/components/brand";

const featureCards=[
  {icon:Images,title:"Remove Background",description:"Cut out clutter with a local AI image model.",tone:"blue"},
  {icon:Layers3,title:"Enhance & Design",description:"Add polished backgrounds, adjustments and studio exports.",tone:"lilac"},
  {icon:PenLine,title:"AI Product Descriptions",description:"Draft honest titles, features and product copy.",tone:"mint"},
  {icon:ShoppingBag,title:"Marketplace Listings",description:"Shape content for Shopee, Lazada, TikTok and more.",tone:"peach"},
  {icon:WandSparkles,title:"Marketing Captions",description:"Write social captions, calls to action and hashtags.",tone:"yellow"}
];
export default function Home(){
  return <div className="marketing-site">
    <header className="marketing-header"><div className="marketing-container marketing-nav"><Brand/><nav aria-label="Homepage navigation"><Link className="active" href="/">Home</Link><a href="#features">Features</a><Link href="/pricing">Pricing</Link><a href="#about">About</a></nav><div className="marketing-nav-actions"><Link href="/login" className="marketing-login">Log in</Link><Link href="/dashboard" className="ui-btn ui-btn-primary">Get Started <ArrowRight size={16}/></Link></div></div></header>
    <main>
      <section className="marketing-hero"><div className="marketing-container hero-inner"><div className="marketing-hero-copy">
        <div className="hero-label"><Sparkles size={14}/> AI-POWERED TOOLS FOR ONLINE SELLERS</div>
        <h1>Turn ordinary product photos into <span>high-converting listings.</span></h1>
        <p>Remove backgrounds, create polished product images, and draft ready-to-use product descriptions and marketing captions — all in one place.</p>
        <div className="marketing-hero-buttons"><Link href="/dashboard" className="ui-btn ui-btn-primary ui-btn-lg">Try ChanSeller Free <ArrowRight size={18}/></Link><a href="#features" className="ui-btn ui-btn-outline ui-btn-lg">View Features</a></div>
        <div className="hero-benefits"><span><Check size={15}/> No design skills needed</span><span><Check size={15}/> Save time</span><span><Check size={15}/> Sell confidently</span></div>
        <div className="hero-honesty"><ShieldCheck size={15}/> Local development preview. No accounts or billing active.</div>
      </div><div className="marketing-hero-visual"><div className="hero-glow"/><span className="hero-floating-spark spark-a">✦</span><span className="hero-floating-spark spark-b">✧</span>
        <div className="before-photo"><div className="before-background"><img src="/demo-headphones.svg" alt="Illustrated white headphones on a simple background"/></div><span>Before</span></div>
        <div className="hero-arrow"><ArrowRight size={29}/></div>
        <div className="after-photo"><div className="after-background"><div className="after-orb"/><img src="/demo-headphones.svg" alt="Illustrated white headphones on a clean light-blue studio background"/></div><span>After ✨</span></div>
        <div className="hero-mini-badge"><Sparkles size={15}/> Ready for your storefront</div>
      </div></div></section>
      <section className="marketing-features-strip" id="features"><div className="marketing-container feature-mini-grid">{featureCards.map(f=><div key={f.title} className="feature-mini"><span className={`feature-mini-icon ${f.tone}`}><f.icon size={25}/></span><strong>{f.title}</strong><p>{f.description}</p></div>)}</div></section>
      <section className="marketing-how" id="about"><div className="marketing-container"><div className="marketing-section-heading"><span>HOW IT WORKS</span><h2>Everything you need to make products shine.</h2><p>Clean visuals, useful text and easy exports — built for the way online sellers work.</p></div><div className="how-grid">
        <div><span className="how-step">01</span><div className="how-visual blue"><UploadCloud size={42}/></div><h3>Upload a photo</h3><p>Choose a JPG, PNG or WebP photo of the item you're selling.</p></div>
        <div><span className="how-step">02</span><div className="how-visual lavender"><WandSparkles size={42}/></div><h3>Make it look great</h3><p>Remove its background and select a color, format or polish.</p></div>
        <div><span className="how-step">03</span><div className="how-visual mint"><FilePenLine size={42}/></div><h3>Write & download</h3><p>Draft a listing, download your PNG and prepare to post.</p></div>
      </div></div></section>
      <section className="marketing-preview"><div className="marketing-container marketing-preview-inner"><div className="marketing-preview-text"><span className="marketing-eyebrow">MAKE YOUR PRODUCTS THE STAR</span><h2>One product.<br/>So many possibilities.</h2><p>Turn a simple seller photo into a storefront-friendly visual with clean studio presets and an easy-to-use editor.</p><Link href="/studio" className="ui-btn ui-btn-primary ui-btn-lg">Open Photo Studio <ArrowRight size={17}/></Link></div><div className="preview-photo-row"><div className="preview-product preset-white"><img src="/demo-headphones.svg" alt="White headphones on white background"/><span>Clean white</span></div><div className="preview-product preset-lavender"><img src="/demo-headphones.svg" alt="White headphones on lavender background"/><span>Soft lavender</span></div><div className="preview-product preset-mint"><img src="/demo-headphones.svg" alt="White headphones on mint background"/><span>Fresh mint</span></div></div></div></section>
      <section className="marketing-cta"><div className="marketing-container marketing-cta-content"><span><Zap size={18}/> ALL YOUR SELLER ESSENTIALS</span><h2>Make your next listing look amazing.</h2><p>Start with the local preview and create something beautiful.</p><Link href="/dashboard" className="ui-btn ui-btn-white ui-btn-lg">Start Creating <ArrowRight size={18}/></Link></div></section>
    </main>
    <footer className="marketing-footer"><div className="marketing-container"><Brand/><span>© 2026 ChanSeller · Local-first development preview.</span><div><Link href="/dashboard">Dashboard</Link><Link href="/pricing">Pricing</Link><a target="_blank" rel="noreferrer" href="https://github.com/luffylines/chanseller">GitHub ↗</a></div></div></footer>
  </div>;
}
