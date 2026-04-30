# Munch Dance Competition — Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, Supabase, Railway, or local)
- Vercel account (free tier works)

---

## 1. Environment Variables

Create a `.env` file (or set these in Vercel dashboard):

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Session secret — generate with: openssl rand -base64 32
SESSION_SECRET="your-super-secret-key-at-least-32-characters-long"

# App name (optional)
NEXT_PUBLIC_APP_NAME="Munch Dance Competition"

# Used to protect the /api/setup endpoint in production
SETUP_KEY="your-setup-key"
```

---

## 2. Database Setup

### Option A: Neon (Recommended for Vercel)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the connection string
3. Set `DATABASE_URL` in your environment

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Go to Settings → Database → Copy connection string (URI)
3. Replace `[YOUR-PASSWORD]` with your project password

### Option C: Railway

1. Go to [railway.app](https://railway.app) → New project → PostgreSQL
2. Copy the connection URL from the Variables tab

---

## 3. Run Prisma Migrations

```bash
# Install dependencies
npm install

# Push schema to database (for new databases)
npx prisma db push

# OR use migrations (for production)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## 4. Seed Demo Data (Optional)

```bash
npm run db:seed
```

This creates:
- **Admin**: `username=admin`, `password=admin123`
- **Judges**: `judge1`, `judge2`, `judge3` (all with `password=judge123`)
- **Demo competition** with 9 teams across all 3 categories

---

## 5. Create Admin User (Production)

Call the setup endpoint to create your admin account:

```bash
curl -X POST https://your-app.vercel.app/api/setup \
  -H "Content-Type: application/json" \
  -H "x-setup-key: YOUR_SETUP_KEY" \
  -d '{"name":"Admin Name","username":"admin","password":"SecurePassword123"}'
```

> After creating the admin, you can disable the `/api/setup` route by deleting `src/app/api/setup/route.ts`

---

## 6. Deploy to Vercel

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Select your repo
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `SETUP_KEY`
5. Deploy!

---

## 7. Vercel Build Settings

The project auto-detects Next.js. No extra configuration needed.

**Build Command**: `next build`  
**Output Directory**: `.next`  
**Install Command**: `npm install`

---

## 8. Post-Deployment Checklist

- [ ] Set `DATABASE_URL` in Vercel env vars
- [ ] Set `SESSION_SECRET` (random 32+ char string)
- [ ] Run `prisma migrate deploy` or `prisma db push`
- [ ] Create admin account via `/api/setup`
- [ ] Test login at `https://your-app.vercel.app/login`
- [ ] Create a competition as admin
- [ ] Add teams and judges
- [ ] Publish the competition
- [ ] Test judge login and scoring

---

## 9. Admin Workflow

1. **Login** as admin → `https://your-app.vercel.app/login?role=admin`
2. **Create competition** with name, date, venue
3. **Add teams** with code, name, and category (Jr Kids / Sr Kids / Adult)
4. **Add judges** with full name, username, password
5. **Publish** the competition (judges can now score)
6. **Monitor** judge progress from the competition dashboard
7. **View results** at any time from the Results page
8. **Export CSV** or **Print** results when ready
9. **Mark completed** when all judging is done

---

## 10. Judge Workflow

1. **Login** at `https://your-app.vercel.app/login?role=judge`
2. View the **team list** with scoring status
3. **Click a team** → score each category (1–5)
4. **Save draft** to continue later or **Mark complete** when done
5. Repeat for all teams
6. Once all teams are completed, **Submit Final Scores**
7. You cannot edit scores after submission

---

## 11. Scoring Categories

### Jr Kids / Sr Kids
- Choreography
- Creativity
- Stage Presence
- Energy & Engagement
- Overall Impact

### Adult
- Stage Presence
- Precision
- Connect
- Choreo
- Creativity
- Expression
- Theme
- Technique
- Props

---

## 12. Winner Calculation

### Jr Kids / Sr Kids
- Winner = highest sum of all category scores
- Tiebreaker: both teams shown as co-winners

### Adult (4 awards)
1. **Best Choreography** — Precision + Choreo + Creativity + Expression + Theme + Technique + Props
2. **Technique** — Precision + Choreo + Expression + Theme + Technique
3. **Most Expressive** — Connect + Choreo + Creativity + Expression + Theme
4. **Best Stage Presence** — Stage Presence + Precision + Connect + Theme

**Rules:**
- A team that wins one adult award cannot win another
- Tiebreaker: highest total of all 9 categories
- If still tied: both teams shown as co-winners

---

## Troubleshooting

**Build fails with Prisma error**: Run `npx prisma generate` before building  
**Cannot connect to DB**: Check `DATABASE_URL` format — must include `?sslmode=require` for hosted databases  
**Session issues**: Ensure `SESSION_SECRET` is set and at least 32 characters  
**Judge can't see competition**: Make sure competition is **Published** and judge is **assigned**
