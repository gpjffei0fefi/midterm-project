# Daily Report — 2026-09-25

## What was built today
- **Missing asset wired in:** `model-deployment-glitchy.png` was added to `src/assets/modules/`. Module art is looked up by filename, so it needed no code change — a Model Deployment that flips to glitchy now shows the greyed glitch-art rocket on its board tile, its owned-modules chip, and its spot on the Model Reveal robot. Confirmed in the browser: the same states previously drew 2 grey placeholder shapes and now draw 0.
- **Typography reverted to the Lora / Proxima Nova pairing, and audited across every screen** (main board, quiz card overlay, leaderboard, Model Reveal + submit form) by reading each element's computed font. Result: Lora only on the game title, "Winner" badge, player names, score numbers, and the title-like lines (Model Reveal heading and winner announcement, leaderboard title, card-back deck names); the sans stack on all stat labels, buttons, quiz text, inputs, and UI chrome.
- **Committed and pushed** (`10bbe0d`). Note this commit also carries the visual restyle from earlier today (dark `#16121f` + pastel palette, illustrated module art, chassis-based Model Reveal), which had never been committed; the commit body says so.
- Docs refreshed (`DOCUMENTATION.md` asset and typography sections, corrected image-weight figure) and the Model Reveal and module-states screenshots retaken.

## Bugs encountered
- **"AI" badge rendered in serif on the Model Reveal** — it has no font of its own, so inside the serif player name it inherited Lora, while on every other screen it was sans. Found by the computed-font audit; fixed by pinning the badge to sans.
- **Italic Lora on the "Winner" badge and winner announcement** — my own flourish, not part of the pairing. Made regular Lora, and the Google Fonts request no longer includes the unused italic and 400-weight faces.
- **Proxima Nova is not available from Google Fonts** (commercial typeface), so the "pull both from Google Fonts" requirement cannot be met literally. **Status: unresolved / needs a decision.** The stack is `'Proxima Nova', 'Figtree'`: anyone with Proxima Nova installed gets it; everyone else gets Figtree from Google Fonts.
- **Mistake on my side:** I accidentally wrote a stray 6-byte file to `C:\HENRYG~1\placeholder.txt`, outside the project. The environment blocked me from deleting it, so I left it. It's harmless and git never sees it, but it can be deleted by hand.
- Browser checks timed out a few times while the ~1 MB PNGs decoded — a reminder that the art is much larger than the sizes it's shown at.

## Decisions made
- Kept the Proxima Nova → Figtree stack rather than silently swapping fonts; options are listed under next steps.
- Left the trust-panel and control-panel player names in sans (they are functional labels); serif is reserved for titles and "moments".
- Left the 4 unrelated older lint warnings in `GameBoard.jsx` and `FlyingModuleChip.jsx` alone; nothing new was introduced.

## Next session
- **Decide the body font:** keep Figtree, pick another Google Fonts option (e.g. Montserrat or Nunito Sans), or license and self-host real Proxima Nova files.
- Write the real question content for the Math and Ethics decks (all 36 cards are still blank placeholders).
- Export smaller versions of the module and chassis art (about 256–512 px, same filenames) — the current set is about 11 MB for icons shown at 26–70 px.
- Create the Supabase project and keys so the leaderboard can be tested against a real backend (so far it has only been tested against a local mock).
- Consider a "Play again" flow after the Model Reveal, and deployment.

## Completion status
- **Done:** board layout; dice and token movement; quiz card data model and flip UI; full turn resolution; git repo and GitHub remote; live 3-axis Trust Score; AI opponents; Model Reveal end screen; optional leaderboard (code complete); visual restyle with the full illustration set (all 6 modules in clean and glitchy, plus the chassis).
- **In progress:** typography (Lora done; sans is a Figtree stand-in pending the font decision); documentation upkeep.
- **Not started:** real quiz content, art optimization, real-backend leaderboard test, play-again flow, state persistence, deployment.
- **Git status:** `10bbe0d` is pushed to `origin/master`; this report and the docs/screenshot refresh are a separate follow-up commit.

## Screenshots
![Model Reveal — fixed asset and reverted typography](../screenshots/model-reveal.png)

![Module states — glitchy Model Deployment now uses its illustration](../screenshots/module-states.png)
