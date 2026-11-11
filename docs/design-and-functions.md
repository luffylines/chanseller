# Light-blue ChanSeller design / function inventory

## Design language
- Clean SaaS UI inspired by the provided multi-screen visual reference.
- Color system: sky blue #428ff2, deep blue #2e71db, off-white #f6f9fe, navy #18243d.
- White dashboard sidebar, blue active navigation, elevated stat cards, intuitive icons.
- Homepage: header / split hero with before-after demo headphones / feature strip / how-it-works / product styles / CTA.
- Seller workspace: collapsible mobile navigation, common topbar and panel layouts.
- Product Studio: left edit tools, center preview and split-slider, right preset/export tools.
- Responsive desktop/tablet/mobile layouts.
- Sample product illustrations in the UI are labeled as examples; they are not real user projects.

## Actual features available
- Browse public pages and local workspace without an account.
- Local photo upload, AI background cutout using own Python worker (run separately).
- Before/after slider, preset gradients, adjustments, export dimensions, optional shadow and watermark.
- Transparent or composited PNG downloads.
- Save/load/search/preview/delete product image exports in IndexedDB.
- Optional Gemini-generated text (when server key configured), fallback labeled local templates.
- Marketplace selection, copy-to-clipboard, draft downloads and browser-only draft history.
- Brand kit and settings saved locally; local data reset.

## Deliberately not implemented
- Authentication, cloud account creation, protected workspaces.
- Real database, live usage credits, payment processing or subscriptions.
- Photorealistic AI-generated backgrounds, batch jobs, official marketplace posting.
- Hosting, Vercel deployment, admin SaaS billing dashboard.

Do not mix unrelated project databases, API keys or hosting deployments. See database plan when production implementation is approved.
