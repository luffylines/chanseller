# Database plan — NOT provisioned

ChanSeller does not currently use a database. No Supabase connection, database schema migrations, storage buckets, login backend, or Vercel integration have been created.

When ready to launch an authenticated subscription product:
1. Create a **new Supabase project** dedicated to ChanSeller. Do not reuse SKVASRA, Fun Run, or any other project credentials or tables.
2. Add tables for `profiles`, `workspaces`, `workspace_members`, `products`, `assets`, `generations`, `plans`, `subscriptions`, and `usage_ledger`.
3. Use workspace-scoped foreign keys and tested Row Level Security on every user-facing table. Restrict image storage by workspace and authenticated ownership.
4. Use server-side authorization for AI credits and subscriptions. Never let client input define usage counters or paid roles.
5. Store keys in backend environment secrets only; do not commit service-role keys.
6. Add retention/deletion controls for seller images, billing webhooks with signature verification, abuse controls, quotas, and privacy policy.
7. Build migrations and automated RLS integration tests before connecting the frontend.

Current app is intentionally local-only and stateless. Pricing is for future planning, not active billing.
