# LinkedIn verification — setup (one-time, you must do this)

The app code is done. LinkedIn won't work until the provider is configured.
Three places: LinkedIn Developer, Supabase, then run the migration.

## 1. LinkedIn Developer app
1. Go to https://www.linkedin.com/developers/apps → **Create app** (needs a LinkedIn Company Page; make a throwaway one if needed).
2. In the app → **Products** tab → add **"Sign In with LinkedIn using OpenID Connect"** (instant approval).
3. **Auth** tab → copy **Client ID** and **Client Secret**.
4. **Auth** tab → **Authorized redirect URLs** → add exactly:
   ```
   https://cvlvrousapvmamkcexpl.supabase.co/auth/v1/callback
   ```

## 2. Supabase
1. Dashboard → **Authentication → Providers → LinkedIn (OIDC)** → enable, paste Client ID + Secret, save.
2. **Authentication → Sign In / Providers → (Advanced) Manual Linking** → **enable**.
   (Required — `linkIdentity` fails without it.)
3. **Authentication → URL Configuration → Redirect URLs** → add:
   ```
   https://groovp.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

## 3. Run the migration
Paste `supabase/schema_v4.sql` into the SQL Editor and run. Adds
`profiles.linkedin_verified` + `linkedin_sub` (and the share-code / roster tables).

## How it works once set up
- Settings → **Verify with LinkedIn** → redirects to LinkedIn → back to `/auth/callback`
  → `linkedin_verified = true` → blue badge shows on `/profile` and `/u/[id]`.

## Known limits (expected, not bugs)
- LinkedIn OIDC returns only sub / name / email / picture — **no** profile URL, headline,
  or company. The badge means "has a LinkedIn account," nothing richer.
- Doesn't work on local dev (corporate-proxy TLS). Test on Vercel.
