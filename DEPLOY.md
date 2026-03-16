# Deploying to Vercel (via GitHub)

Your project is ready to deploy. Follow these steps once and every future
`git push` will auto-redeploy in about 30 seconds.

---

## Step 1 — Install Git (if needed)
Check if you have it: open Terminal and run `git --version`.
If not installed, download from https://git-scm.com

---

## Step 2 — Create a GitHub repo

1. Go to https://github.com/new
2. Name it something like `madinah-arabic-app`
3. Keep it **Public** (required for Vercel free tier) or Private (Vercel Pro)
4. **Do NOT** tick "Add a README" — leave it empty
5. Click **Create repository**
6. GitHub will show you a URL like `https://github.com/YOUR_USERNAME/madinah-arabic-app.git`
   Copy it — you'll need it in Step 3.

---

## Step 3 — Push your code to GitHub

Open Terminal, navigate to this folder, and run these commands one by one:

```bash
# Navigate to the project folder (adjust path to match your computer)
cd ~/path/to/MadinahArabic

# Initialise git
git init

# Stage everything except node_modules (already in .gitignore)
git add .

# First commit
git commit -m "Initial commit — Madinah Arabic app"

# Connect to GitHub (paste YOUR repo URL from Step 2)
git remote add origin https://github.com/YOUR_USERNAME/madinah-arabic-app.git

# Push
git branch -M main
git push -u origin main
```

Refresh your GitHub page — you should see all the files.

---

## Step 4 — Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Find `madinah-arabic-app` in the list and click **Import**
4. Vercel auto-detects Vite. The defaults are correct:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click **Deploy**
6. Wait ~30 seconds → you'll get a live URL like `madinah-arabic-app.vercel.app`

---

## Future updates

Whenever you change `src/App.jsx` and want to redeploy:

```bash
git add src/App.jsx
git commit -m "Describe what you changed"
git push
```

Vercel picks it up automatically. Done.

---

## Running locally (optional)

If you want to test changes before pushing:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## File structure

```
MadinahArabic/
├── src/
│   ├── App.jsx          ← The Arabic learning app (edit this)
│   └── main.jsx         ← Entry point (don't touch)
├── index.html           ← HTML shell (don't touch)
├── package.json         ← Project config (don't touch)
├── vite.config.js       ← Build config (don't touch)
└── .gitignore           ← Tells git to ignore node_modules
```

When you want to update the app, **only edit `src/App.jsx`**.
