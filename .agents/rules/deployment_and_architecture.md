---
description: Rules for building, deploying, and maintaining FinTrack (Web & Android)
---

# FinTrack Architecture & Deployment Rules

1. **Build Output**:
   - Always run `npm run build` after editing `src/` or `style.css`.
   - `build.js` must generate output to both `www/` (Android Capacitor) and `public/` (Vercel).
   - `vercel.json` must specify `"buildCommand": "npm run build"` and `"outputDirectory": "public"`.

2. **Branch Sync & Deployment**:
   - Always push changes to all 3 branches (`main`, `master`, and `gh-pages`) via:
     `npm run push-all`
   - This prevents branch mismatch between Vercel Production and GitHub Pages.

3. **Desktop & Mobile Navigation**:
   - Both `<Sidebar />` (for Desktop) and `<BottomNav />` (for Mobile) must be rendered in `App()`.
   - Never remove `<Sidebar />` from `src/app.jsx`.

4. **Authentication**:
   - Android uses native `@capacitor-firebase/authentication` to show the native Google Play Services account picker bottom-sheet.
   - Web uses standard Firebase Web SDK `signInWithPopup`.
