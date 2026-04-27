# Skon Studio · Atelier CRM

Private lead-tracking CRM for **Skon Studio** (commercial interior design + luxury residential builds). Two-user setup — you and your partner — with live sync via Supabase Realtime, deployed to Netlify.

The schema mirrors your existing `Lead Tracker.xlsx` columns 1:1, plus a `stage` field that powers the Kanban board.

---

## What's inside

```
skon-crm/
├── supabase-schema.sql         ← paste into Supabase SQL editor (one-shot)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── netlify.toml                ← Netlify build config + SPA redirect
├── .env.example                ← copy to .env and fill in
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css              ← luxury palette: ivory + ink + gold
    ├── lib/
    │   ├── supabase.js         ← client + dropdown options
    │   ├── useAuth.js          ← session hook
    │   └── useLeads.js         ← list + realtime + CRUD
    └── components/
        ├── AuthGate.jsx        ← email + password sign-in
        ├── Layout.jsx          ← header, tabs, footer
        ├── Dashboard.jsx       ← Overview tab (totals, by stage, by source)
        ├── Kanban.jsx          ← Pipeline tab (drag & drop)
        ├── LeadsTable.jsx      ← Register tab (search / filter / sort)
        └── LeadEditor.jsx      ← side-drawer for create / edit / delete
```

---

## Step-by-step deploy

### 1. Set up the Supabase database

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase-schema.sql` and click **Run**.
   - Creates the `leads` table with all 12 columns from your Excel
   - Adds Row-Level Security so only signed-in users see anything
   - Enables Realtime publication for live multi-user sync
   - Seeds your existing 12 B2B leads

### 2. Add yourself + your partner as users

In Supabase → **Authentication** → **Users** → **Add user → Create new user**:
- Email: `ziadwaleed090@gmail.com`, set a password, ✅ "Auto Confirm User"
- Repeat for your partner's email + password

That's it for access control — only these two emails can sign in.

### 3. Grab your Supabase credentials

Supabase → **Project Settings** → **API**:
- `Project URL` → goes into `VITE_SUPABASE_URL`
- `anon` `public` key → goes into `VITE_SUPABASE_ANON_KEY`

(These are safe to ship to the browser — RLS is what protects your data, not key secrecy.)

### 4. Run locally to verify

```bash
cd skon-crm
cp .env.example .env
# edit .env and paste in the two values from step 3
npm install
npm run dev
```

Open http://localhost:5173, sign in with the email/password you created in step 2, and you should see your 12 seeded leads in the Register and Pipeline tabs.

### 5. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/skon-crm.git
git push -u origin main
```

### 6. Deploy on Netlify

1. Netlify dashboard → **Add new site → Import an existing project**.
2. Connect your GitHub repo.
3. Build command and publish dir auto-detect from `netlify.toml` — leave them as is.
4. **Site settings → Environment variables → Add variable**:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. **Trigger deploy → Deploy site**.

You'll get a `your-site.netlify.app` URL. Send it to your partner with their login credentials. Both of you will see each other's edits within ~200ms.

---

## How realtime works

When either of you creates, edits, drags a card, or deletes a lead, Supabase broadcasts a `postgres_changes` event over a WebSocket. The `useLeads` hook listens on the `leads-realtime` channel and patches local state — so the other person's screen reflects the change without a refresh.

Optimistic local updates are not used (intentional — it keeps the source of truth firmly in Supabase, which avoids "ghost" cards if the network blips during a drag).

---

## Tweaking the dropdowns

Open `src/lib/supabase.js` to edit the option lists for **Source**, **Project Type**, and **Budget Range**. The form uses HTML `datalist` so users can pick from suggestions OR type something new — your dropdowns stay clean without locking you in.

If you want to add or rename a stage:

1. Edit the `STAGES` array in `src/lib/supabase.js`
2. Update the `check (stage in (…))` constraint in `supabase-schema.sql` and run an `ALTER TABLE` in the SQL editor.

---

## Adding the B2C sheet later

The schema already supports B2C — the `lead_type` column distinguishes them, and `company_name` is nullable. To add a B2C lead, click **+ New Lead**, change Type to B2C, and the company field disappears from the form. Done.

---

## Security notes

- RLS policies require `auth.role() = 'authenticated'`, so an unauthenticated request returns zero rows even if someone gets the anon key.
- `auth.uid()` is auto-stamped on every insert/update so you can audit who-did-what later if needed.
- To revoke access (e.g., if a partner leaves), delete the user in Supabase → Authentication → Users.

---

## Importing the rest of your Excel

If you add more rows to the Excel and want to bulk-import, two options:

1. **Manual paste**: open the SQL editor and use the same `INSERT INTO public.leads (…) VALUES (…)` shape from the seed block.
2. **CSV import**: Supabase Dashboard → Table editor → `leads` → ⋯ menu → **Import data from CSV**. Make sure column names match.

---

That's the whole stack. The Atelier interface uses Cormorant Garamond for display + Inter for data, an ivory background with gold hairline accents — built to feel like the studio, not like a generic SaaS dashboard.
