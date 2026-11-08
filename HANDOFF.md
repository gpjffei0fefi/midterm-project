# Handoff — Build-A-Brain Co.

**Written:** 2026-11-08. **Presentation:** 2026-11-09 (tomorrow).
**Purpose:** orient a fresh Claude Code session fast. Read this before anything else in this repo.

Repo: `C:\Users\Henry Gabriel\Desktop\M10 Midterm Project`
GitHub: `https://github.com/gpjffei0fefi/midterm-project` (remote `origin`)
Deployed: `https://build-a-brain-co.vercel.app` (Vercel team `sikhay1`) — **see the urgent flag below, this is very likely stale.**

## ⚠️ Most important thing to check first

`master` (the branch GitHub/Vercel would deploy from) is at commit `911cb08`
("install Impeccable and grill-me skills") — **before** the visual restyle and
**before** the N-player start menu. All real feature work since then lives on
unmerged branches (see map below). Nothing has been pushed to `origin` since
`911cb08`, and the local `vercel` CLI token is currently invalid (`vercel ls`
fails with "specified token is not valid"), so **the live demo link almost
certainly still shows the old UI**, not any of this work.

**If the presentation needs the live Vercel link to show the current look,
this has to be fixed first**: decide which branch is "the real one" (see
below — `start-menu` or `hard-mode`), merge it to `master`, re-auth the
`vercel` CLI (`vercel login`), and redeploy. If the presentation instead runs
from `localhost` / a screen share, this is lower priority — say so and skip it.

## Branch map (each builds on the one above it)

```
master (911cb08)                 — deployed baseline, pre-restyle, pre-menu
  └─ restyle (08bb2a5)           — full Monopoly-derived visual redesign
       └─ start-menu (4773b24)   — N-player (2-4) start menu: Local / Online
          │                        (placeholder) / Hard (preview) / AI modes
          ├─ hard-mode (0097ead) — real Gemini AI opponent for Hard Mode
          │                        [done, unmerged, see below]
          └─ online (current,    — Realtime multiplayer rooms via Supabase
             uncommitted)          [blocked, see below]
```

Working tree is currently on **`online`**, with an uncommitted
`@supabase/supabase-js` install in `package.json`/`package-lock.json` (needed
for the next step, not yet used by any code).

## What's fully done and verified

- **`restyle` branch:** the Monopoly-derived palette restyle. Committed, critiqued (dual-agent), fixed.
- **`start-menu` branch:** N-player (2-4) mode-select start menu, 19 vitest tests, committed and pushed — confirmed just now, `origin/start-menu` exists and matches local. **`restyle`, `hard-mode`, and `online` have no remote branch at all** — they only exist in this local working copy.
- **`hard-mode` branch:** a real web-searching AI opponent for Hard Mode.
  - `POST /api/opponent`: Gemini `gemini-2.5-flash` with Google Search grounding (Interactions API), server resolves the real card/`correctIndex` itself, model never sees `correctIndex` or any player name, malformed/out-of-range replies retry once then fall back to the original tier-based coin-flip AI, 15s timeout + 10/min/IP rate limit, 15% intentional miss rate so Hard Mode stays beatable.
  - Full UI wiring: "Opponent is thinking…" → "Searched: `<query>`" chip with source links → one-sentence reasoning, or a "couldn't search this turn" note on fallback.
  - **39/39 tests pass.** Committed (`0097ead`). **Not merged, not pushed.**
  - `DOCUMENTATION.md` on that branch has the full writeup: exact model/quota numbers with doc links, env var, fallback behavior.

## What's blocked, and needs you specifically

1. **`GEMINI_API_KEY` is still not set** (checked just now via
   `node --env-file=.env.local -e "console.log(Boolean(process.env.GEMINI_API_KEY))"`
   → `false`, without ever reading the file's contents). This blocks the one
   required **live** 3-question test of the Hard Mode agent — everything
   else about it is done and unit-tested. Set it in `.env.local` (and in
   Vercel's project env vars if `hard-mode` gets merged and deployed), then a
   fresh session can run that live test directly.

2. **Supabase Realtime connectivity check failed** (`online` branch task).
   Tested two independent ways — a real Chrome browser opening a test
   channel and broadcasting, and a plain REST call to the same project's
   `/rest/v1/` endpoint (the one the leaderboard already uses) — **both
   failed**, plus a direct browser navigation to the project's own hostname
   hit Chrome's network error page. `supabase.com` itself loaded fine in the
   same browser, so general internet access isn't the problem — something
   is wrong with reaching *this specific project*. Most likely: the free-tier
   project auto-paused from inactivity, or the URL in `.env.local` is stale.
   **Nothing on the `online` branch has been built yet** — this check is a
   hard gate per the original instructions ("if it fails, stop and tell me
   why"), and it's still failing as of the last check (this was about a
   month before this handoff was written — re-run the check, don't assume
   it's still broken, but don't assume it's fixed either).
   - To re-check: confirm in the Supabase dashboard that the project is
     active (not paused), confirm `VITE_SUPABASE_URL` in `.env.local` points
     at that same active project, then redo the two-part check (a real
     browser channel + REST sanity call — see `online` branch session
     history for the exact throwaway test page used; it was deleted after
     use, not committed).

3. **Nothing has been merged or pushed since `911cb08`.** Decide: is
   `hard-mode` the branch that ships, or does `start-menu` ship as-is with
   Hard Mode staying a "preview"? That decision gates the Vercel redeploy
   question above.

## Known working agreements (carry these into the new session)

- Saying **"save progress"** or **"commit this"** means stage everything and
  commit with no confirmation needed. Push, force-push, and deploy still
  need an explicit ask every time.
- **Never read `.env.local`'s contents** (Read/cat/etc. is explicitly
  off-limits here). To check whether a var is *set* without exposing its
  value: `node --env-file=.env.local -e "console.log(Boolean(process.env.NAME))"`.
- Secrets (Gemini key) are read server-side only, in `api/_lib/geminiClient.js`
  — never `VITE_`/`NEXT_PUBLIC_` prefixed, never logged.
- Full technical architecture (file structure, every system, screenshots) is
  in **`DOCUMENTATION.md`** — it's rewritten per branch/session, not
  appended to. Read the one on whichever branch you're working on.
- Session-by-session narrative history is in **`reports/`** (dated files).

## Suggested next steps, in order

1. Decide the merge/deploy question above (what ships for tomorrow).
2. If Hard Mode ships: get `GEMINI_API_KEY` set, run the live 3-question
   test, merge `hard-mode` → `master` (or wherever it needs to land).
3. If Online Multiplayer isn't ready in time, that's fine — `start-menu`
   already ships it as an honest "Coming next" placeholder badge, no code
   changes needed to hide it.
4. Fix Vercel auth (`vercel login`) and redeploy from the final chosen
   branch so the live link matches what gets presented.
5. UI pass with Figma (separate, in-progress ask as of this handoff — check
   the live conversation/session for current direction before redoing this
   from scratch).
