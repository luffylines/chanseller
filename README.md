# ChanSeller — AI Product Studio for Online Sellers

A modern, light-blue **local-first SellerBoost AI website** with a public landing page, seller dashboard, photo editor, listing copywriter, and supporting seller tools.

[Open the source code](https://github.com/luffylines/chanseller)

> **Development preview only.** This repository has **not** been deployed to Vercel or connected to Supabase, MySQL, or any other cloud database. Login, payment and commercial subscriptions are not active. Local product projects are saved to **IndexedDB on this browser**.

## Included pages

| Route | Function |
|---|---|
| `/` | Premium light-blue public marketing homepage |
| `/dashboard` | Seller dashboard, real local counts, quick tools, recent products |
| `/studio` | Photo upload, real AI background cutout, presets, adjustments, export sizes, before/after, PNG download, save to products |
| `/copywriter` | Product details, marketplace selection, optional Gemini AI copy, local draft save, clipboard and TXT export |
| `/products` | View, search, preview, download and delete saved photos |
| `/templates` | Select a studio background and open it in the editor |
| `/brand-kit` | Save shop name, tagline, brand color and tone locally |
| `/usage` | Show actual local saved image and draft counts |
| `/settings` | Local profile preferences, storage status, delete local data |
| `/pricing` | Proposed future plans, **not purchasable** |
| `/login`, `/register` | Authentication **preview only**; no false sign-in or password storage |

Product images and saved drafts are stored in the browser's **IndexedDB**. Brand kit and profile preferences are stored in **localStorage**. This works on the same browser/device only. Browser data can be cleared, so don't rely on it as a production backup.

## Requirements

- Node.js **22 or newer** recommended.
- Python **3.11 to 3.13** for the image worker.
- Internet connection for initial package/model installation. Once downloaded, model inference runs locally.
- An optional **Gemini API key** for truly AI-generated product text.

## 1. Start the website on Windows (PowerShell)

```powershell
cd D:\chanseller
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Using `npm.cmd` avoids Windows PowerShell's disabled `npm.ps1` execution policy. You do **not** need to weaken Windows script security to install dependencies.

Open **http://localhost:3000**.

## 2. Start the image AI in a SECOND PowerShell terminal

The free Python model does actual segmentation and removes the background. The frontend cannot remove the background until this second service is running.

**Easy Windows command** (from the repository root):

```powershell
cd D:\chanseller
.\scripts\Start-Local-AI.ps1
```

If PowerShell blocks scripts, use these **manual commands** instead. They do not require activating a `.ps1` file:

```powershell
cd D:\chanseller
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
.\.venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

If you installed Python 3.12 instead, replace `py -3.11` with `py -3.12`. If the Python launcher is unavailable, try `python -m venv .venv`.

Check **http://127.0.0.1:8000/health** in your browser. The worker downloads the U2Net weights on the **first actual background-removal request**, which can be slow. The model runs on the local CPU and may take some time for large photos.

After the worker starts, refresh **http://localhost:3000/studio**. Its sidebar should show **Local AI worker · Connected**.

## 3. Optional Gemini AI descriptions and captions

1. Create a Google AI Studio Gemini API key.
2. In `.env.local`, set `GEMINI_API_KEY=your_key_here`.
3. Restart `npm.cmd run dev`.
4. Visit `/copywriter`, enter factual product information and press **Generate with AI**.

**Without a key or when Gemini fails:** The app returns **Local template draft**, clearly labeled so it is never confused with AI. Only the text fields you entered (not your product photo) are sent to Gemini when configured.

## Product Studio workflow

1. Open `/studio` and upload JPG, PNG or WebP (max 8 MB).
2. Run **Remove Background** (requires the Python worker).
3. Select a background. **Transparent** export produces a transparent PNG.
4. Use Adjustments, Shadow, Resize and Brand Watermark.
5. Move the Before/After slider to compare.
6. Download PNG or **Save to My Products** (browser-only storage).

Studio outputs: Square 1200×1200, Portrait 1080×1350 or Story 1080×1920. Transparency is exported at the original cutout's resolution.

AI-generated lifestyle scenes (photorealistic rooms, models, textures) and one-click posting to Shopee/Lazada/TikTok are **not** implemented; current backgrounds are gradient studio presets. Do not claim otherwise.

## No shared database / no Vercel

ChanSeller is completely separate from SKVASRA, Fun Run and other systems. No credentials, tables, storage buckets, or deployment projects have been reused. A planned production database architecture is described in [docs/database-plan.md](docs/database-plan.md).

## Tests

```powershell
npm.cmd run typecheck
npm.cmd run build
.\.venv\Scripts\python.exe -m py_compile backend\app.py
```

GitHub Actions performs TypeScript, Next.js build and Python syntax checks **without deploying**. Image-cutout quality on real photos and browser IndexedDB behavior still require manual local testing.

## Free AI and licensing

- `rembg` is MIT licensed. The chosen U2Net model is downloaded separately and has its own rights/license; verify model provenance and its terms before commercial launch.
- Google Gemini has usage caps/quotas that vary by account, region and model; don't rely on permanent unlimited free usage.
- Never publish service API keys to the browser or GitHub.
- No login or billing functions are simulated as completed operations.
