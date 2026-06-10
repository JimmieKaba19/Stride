# Getting started

### 1. Clone and install

```bash
git clone https://github.com/your-username/stride.git
cd stride
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 3. Database

- Go to your Supabase project → SQL editor
- Run the full contents of `supabase/schema.sql`

### 4. Run locally

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo in Vercel
3. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy — done
