# ChanSeller — SellerBoost AI

A **local-first product photo and listing studio** for Philippine online sellers. Built as a separate project from SKVASRA and other apps.

> **Current stage: development preview.** Code lives in this GitHub repository. **No Vercel deployment, database, accounts, payments, or automatic marketplace posting.** Pricing on the site is illustrative.

## What works

- Premium responsive landing page and product studio (Next.js + React + Tailwind).
- Upload a JPG/PNG/WebP product photo (max 8 MB).
- **Real AI background removal** through a separate **local Python worker** using `rembg` and the explicitly selected U2Net model. Not a CSS-only or fake removal feature.
- Choose studio white, peach, lavender, mint, or dark backgrounds.
- Adjust brightness, contrast and saturation; preview original vs cutout.
- Export a transparent PNG or a composited **1200 × 1200** studio PNG, all processed in the browser after segmentation.
- Generate titles, descriptions, captions and hashtags. Optional Gemini API integration, with a transparently labeled **template draft** when no key is set / provider is unavailable.
- No images or captions are persisted in a database.

## Prerequisites

- Node.js 22+ recommended
- Python 3.11–3.13
- Windows PowerShell, macOS or Linux
- Internet on first background-removal run to download model weights (local cache, model size can be significant)
- Optional Gemini API key for true AI-generated copy

## Run locally (two terminals)

**Terminal 1 — Web UI**

```bash
git clone https://github.com/luffylines/chanseller.git
cd chanseller
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell use `Copy-Item .env.example .env.local` instead of `cp`. Open **http://localhost:3000** and click **Open Studio**.

**Terminal 2 — Image worker**

```bash
cd chanseller
python -m venv .venv
```

Activate on PowerShell: `.\.venv\Scripts\Activate.ps1`. Activate on macOS/Linux: `source .venv/bin/activate`.

```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

Check **http://127.0.0.1:8000/health**. Uploaded images are sent only to the **local** worker. The worker never writes uploaded photos to disk or a database. The model itself downloads and caches local weights on first use.

### Optional real AI copywriting

Set `GEMINI_API_KEY=your_key` in **.env.local** (do not commit this file), then restart Next.js. Only text fields you type in the copywriter are sent server-to-server to Google. If no key is present, the UI explicitly says "Template draft" — not AI.

## Security & license notes

- This is a **local development project**, not a hardened commercial multi-user service. Do not expose port 8000 publicly.
- All product photo processing is performed by your own worker; **no photo persistence** is implemented.
- `rembg` is MIT-licensed. Model weights have **separate licenses**: this starter explicitly selects U2Net rather than rembg's newer default. Recheck upstream model licensing and provenance before commercial launch.
- Uploaded file types, size, and image dimensions are checked server-side. The worker currently has **no authentication** and should be kept on localhost.
- Review all generated copy before publishing. No product specification is verified automatically.
- Add per-account quotas, anti-abuse, RLS and billing controls before offering paid plans.

## Quality checks

```bash
npm run typecheck
npm run build
python -m py_compile backend/app.py
```

GitHub Actions runs static frontend and Python syntax checks; it **does not deploy**.

## Separate database (later)

See [docs/database-plan.md](docs/database-plan.md). ChanSeller will have a **brand-new isolated database**, never share data/keys from other projects, and will not connect a database until explicitly requested.

## Roadmap

1. Test quality of U2Net cutouts on real seller photos and improve edge matting.
2. Add genuine creative backgrounds (licensed image-generation provider, not a fake CSS approximation), with a clear paid/credit-gated workflow.
3. Add independent Supabase auth + workspace-scoped RLS after approval.
4. Build asset history, projects, safe credit limits, marketplace exports, billing and monitored production hosting when ready.
