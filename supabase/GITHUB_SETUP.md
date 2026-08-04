# GitHub verification — setup (one-time)

No company/org needed. ~5 minutes.

## 1. GitHub OAuth app
1. https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name:** Groovp
   - **Homepage URL:** `https://groovp.vercel.app`
   - **Authorization callback URL:**
     ```
     https://cvlvrousapvmamkcexpl.supabase.co/auth/v1/callback
     ```
3. **Register application** → copy the **Client ID** → **Generate a new client secret** → copy it.

## 2. Supabase
1. Dashboard → **Authentication → Providers → GitHub** → enable, paste Client ID + Secret, save.
2. **Manual Linking** must be on (Authentication → Sign In / Providers → Advanced). Already required for LinkedIn — enable once, covers both.
3. Redirect URLs (Authentication → URL Configuration) must include `https://groovp.vercel.app/auth/callback` — already added for LinkedIn.

## 3. Run the migration
Paste `supabase/schema_v5.sql` into the SQL Editor and run (adds `profiles.github_verified` + `github_username`).

## How it works
- Settings → **Verify with GitHub** → GitHub authorise → `/auth/callback` → `github_verified = true`
  → dark badge shows next to the name on `/profile` and `/u/[id]`.

Works independently of LinkedIn — set up either, both, or neither.
