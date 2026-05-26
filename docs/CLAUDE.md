# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step, no package manager, no dev server. Open `index.html` directly in a browser.

```
start index.html          # Windows — opens in default browser
```

All dependencies are loaded from CDN at runtime: Chart.js 4.4.1, Firebase 10.7.1 (compat SDK), and Tabler Icons webfont. The `package-lock.json` exists but is empty — nothing is installed locally.

## Architecture

Three files make up the entire app:

| File | Role |
|------|------|
| `index.html` | Single-page app shell — all pages, forms, and modals as `<div>` sections |
| `app.js` | All logic — Firebase init, state, data layer, rendering, event handlers |
| `style.css` | Apple-inspired design system, responsive breakpoints |

**Data flow:**
1. `firebase.initializeApp()` runs at module top level in `app.js`
2. `onSnapshot` on Firestore path `fintrack/hiewu` populates the module-level `transactions` and `debts` arrays
3. After any state change: call `save()` (Firestore `set`) then `renderAll()` which rebuilds all DOM sections and recreates Chart.js instances
4. On first load with no Firestore document, `_SEED` (hardcoded at top of `app.js`) is written to Firestore

**State model:** Two module-level `let` arrays — `transactions` and `debts` — are the only application state. They are reassigned wholesale on every Firestore snapshot. All mutations follow: modify arrays → `save()` → `renderAll()`.

**Rendering:** No virtual DOM or framework. Every render call sets `.innerHTML` from template literal strings. Chart.js instances (`donutChart`, `flowChart`, `trendChart`) are `.destroy()`'d and recreated on every `renderAll()` call.

**Interaction wiring:** All UI events use inline attributes (`onclick=`, `oninput=`). Functions they call must be accessible in the global scope.

## Key Conventions

**Utility functions to reuse:**
- `fmt(n)` — `Intl.NumberFormat('vi-VN')` currency display
- `fmtShort(n)` — abbreviated axis labels (k / tr / tỷ)
- `save()` — writes current `transactions` and `debts` state to Firestore
- `renderAll()` — rebuilds the full UI from current state
- `shake(el)` — CSS shake animation for invalid form input

**Category colors:** `CAT_COLORS` (fill) and `CAT_BG` (tint) maps at top of `app.js` must be used for any category-coloured UI elements.

**IDs:** New records use `Date.now()` as their unique ID.

**Deletion:** Uses `array.filter(...)` (creates new array). Mutation in-place is only done for debt payment state (`d.paid`, `d.paidDate`).

**Dialogs:** Reuse the existing `modal-overlay` / `modal` pattern for any new confirmation dialogs.

**Category migration:** `migrateCats()` runs on every Firestore load to rename legacy categories and fix linked records. Extend this function if category names are ever changed.

## Firebase Config

The Firebase client API key and Firestore project ID (`taichinhhiewu`) are hardcoded in `app.js` lines 21-28. Firebase client keys are public identifiers; access is controlled by Firestore security rules on the Firebase console, not by keeping the key secret.

The `_SEED` object (line 19 of `app.js`) contains real personal financial data and is written to Firestore only on first use when no document exists.
