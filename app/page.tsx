import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Camera, Check, ChevronRight, Copy, ImagePlus, Layers3, LayoutGrid, MousePointerClick, Paintbrush, ShieldCheck, Sparkles, WandSparkles, Zap } from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  {icon: Camera, title: "One-click background removal", desc: "Cut out clutter and keep the focus on your actual product with a local AI model.", color: "lavender"},
  {icon: Paintbrush, title: "Studio-ready backgrounds", desc: "Choose a clean look, dial in colors, and fine-tune your product presentation.", color: "peach"},
  {icon: Copy, title: "Seller-friendly copywriter", desc: "Draft marketplace titles, descriptions, captions and hashtags in your brand voice.", color: "mint"},
];
const steps = [
  {number: "01", title: "Upload your product", description: "Start with a JPG, PNG or WebP photo from your phone or camera."},
  {number: "02", title: "Make it studio-worthy", description: "Remove its background, pick a look and preview every change."},
  {number: "03", title: "Write, export & sell", description: "Prepare copy and download your final product image for your shop."},
];

export default function Home() {
  return <div className="site-root">
    <header className="site-header">
      <div className="container-wide header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#pricing">Pricing</a>
        </nav>
        <Link href="/studio" className="btn btn-dark header-cta">Launch Studio <ArrowUpRight size={16}/></Link>
      </div>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-blob hero-blob-one"/><div className="hero-blob hero-blob-two"/>
        <div className="container-wide hero-grid">
          <div className="hero-content">
            <div className="eyebrow"><span className="pulse-dot"/> YOUR CREATIVE SIDEKICK FOR SELLING ONLINE</div>
            <h1>Better product photos.<br/><span className="text-gradient">Bigger first impressions.</span></h1>
            <p className="hero-description">Remove distracting backgrounds, create scroll-stopping product visuals, and write listing copy — all from one beautifully simple workspace.</p>
            <div className="hero-actions">
              <Link href="/studio" className="btn btn-purple btn-large">Try the Studio <ArrowRight size={18}/></Link>
              <a href="#how-it-works" className="btn btn-outline btn-large">See how it works <ChevronRight size={17}/></a>
            </div>
            <div className="hero-proof"><span className="proof-icon"><ShieldCheck size={18}/></span><span>Local-first preview. No account, payment or database needed.</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of a product before and after studio styling">
            <div className="floating-chip chip-top"><span className="chip-icon"><WandSparkles size={16}/></span><span>Background removed <Check size={14}/></span></div>
            <div className="art-canvas">
              <div className="art-canvas-grid"/>
              <span className="art-mini-label">PRODUCT STUDIO / 001</span>
              <div className="art-orb art-orb-a"/><div className="art-orb art-orb-b"/>
              <img src="/demo-bottle.svg" alt="Illustrated fictional AURA Bloom body serum bottle" className="hero-product" />
              <span className="art-caption">The everyday, elevated. ✦</span>
            </div>
            <div className="floating-chip chip-bottom"><span className="chip-icon mint-icon"><ImagePlus size={16}/></span><span>Ready for your storefront</span></div>
            <div className="hero-floating-star star-one">✳</div><div className="hero-floating-star star-two">✦</div>
          </div>
        </div>
      </section>

      <section className="trust-strip"><div className="container-wide trust-strip-inner"><span>MADE FOR YOUR SELLING WORKFLOW</span><div><BadgeCheck size={19}/> Shopee-ready visuals</div><div><BadgeCheck size={19}/> Marketplace captions</div><div><BadgeCheck size={19}/> Download in high quality</div></div></section>

      <section id="features" className="feature-section section-space"><div className="container-wide">
        <div className="section-heading"><div className="section-tag">THE TOOLKIT</div><h2>Everything your products need<br/>to <em>stand out.</em></h2><p>Less editing. Less writing. More time to run your store.</p></div>
        <div className="feature-grid">{features.map(f => <div className="feature-card" key={f.title}><div className={`feature-icon ${f.color}`}><f.icon size={26}/></div><h3>{f.title}</h3><p>{f.desc}</p><span className="feature-accent"><ArrowUpRight size={17}/></span></div>)}</div>
      </div></section>

      <section id="how-it-works" className="steps-section section-space"><div className="container-wide">
        <div className="section-heading"><div className="section-tag">SIMPLE BY DESIGN</div><h2>From messy photo to<br/><em>marketplace-ready.</em></h2><p>Three steps. One fresh-looking listing.</p></div>
        <div className="steps-grid">{steps.map(s => <div className="step-card" key={s.number}><span className="step-number">{s.number}</span><h3>{s.title}</h3><p>{s.description}</p></div>)}</div>
        <div className="step-action"><Link href="/studio" className="btn btn-purple btn-large">Start creating <ArrowRight size={18}/></Link></div>
      </div></section>

      <section className="difference-section section-space"><div className="container-wide difference-inner">
        <div className="difference-copy"><span className="section-tag">BUILT FOR REAL SELLERS</span><h2>A tiny studio.<br/><em>A big upgrade.</em></h2><p>Not every seller has a designer or a photo studio. ChanSeller is built to help you make something polished with what you already have.</p><div className="difference-points"><div><Zap size={18}/> Quick, focused editing tools</div><div><Layers3 size={18}/> Background looks for different brands</div><div><MousePointerClick size={18}/> Easy exports, no complex software</div></div></div>
        <div className="difference-art"><div className="difference-card"><div className="difference-card-top"><span className="tiny-dot"/><span className="tiny-dot"/><span className="tiny-dot"/><span className="difference-label">PRODUCT LOOKBOOK</span></div><div className="difference-tiles"><div className="difference-tile dt-lilac"><img src="/demo-bottle.svg" alt="Demo product on a lavender background"/></div><div className="difference-tile dt-peach"><img src="/demo-bottle.svg" alt="Demo product on a peach background"/></div><div className="difference-tile dt-dark"><img src="/demo-bottle.svg" alt="Demo product on a dark background"/></div></div><div className="difference-bottom"><span>One product, multiple looks</span><Sparkles size={15}/></div></div></div>
      </div></section>

      <section id="pricing" className="pricing-section section-space"><div className="container-wide"><div className="section-heading"><div className="section-tag">FUTURE PLANS</div><h2>Start creating today.<br/><em>Scale when you're ready.</em></h2><p>Preview pricing ideas only. No plans are for sale or active yet.</p></div><div className="pricing-grid">
        <div className="price-card"><div className="price-name">Local preview</div><div className="price-value">Free<span> during development</span></div><p>Explore the photo studio and template drafts on your computer.</p><ul><li><Check size={16}/> Local photo workspace</li><li><Check size={16}/> AI cutout via local worker</li><li><Check size={16}/> Studio PNG exports</li></ul><Link href="/studio" className="btn btn-outline price-button">Open Studio <ArrowRight size={16}/></Link></div>
        <div className="price-card price-card-highlight"><span className="price-soon">NOT AVAILABLE YET</span><div className="price-name">Seller Pro · idea</div><div className="price-value">₱299<span> /month (proposed)</span></div><p>Potential future cloud workspace with accounts and usage credits.</p><ul><li><Check size={16}/> Saved projects</li><li><Check size={16}/> Brand presets</li><li><Check size={16}/> More export options</li></ul><div className="btn btn-disabled price-button" aria-disabled="true">Coming later <ArrowRight size={16}/></div></div>
      </div></div></section>

      <section className="last-cta"><div className="container-wide last-cta-inner"><div><span className="section-tag">THE NEXT BEST SELLING TOOL</span><h2>Your next great listing<br/>starts with one photo.</h2><p>Take ChanSeller for a spin on your own computer.</p></div><Link href="/studio" className="btn btn-white btn-large">Let's create <ArrowRight size={19}/></Link></div></section>
    </main>
    <footer className="site-footer"><div className="container-wide footer-inner"><Brand/><span>© 2026 ChanSeller. Local development preview.</span><div><Link href="/studio">Studio</Link><a href="https://github.com/luffylines/chanseller" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14}/></a></div></div></footer>
  </div>;
}
