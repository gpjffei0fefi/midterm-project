---
target: board screen and Model Reveal screen (restyle)
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Henry Gabriel\\Desktop\\M10 Midterm Project\\board screen and Model Reveal screen (restyle)"
timestamp: 2026-10-10T06-34-43Z
slug: board-screen-and-model-reveal-screen-restyle
---
Method: dual-agent (A: a3a861ebf73965644 · B: a45da207de4356efb)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dice/turn states are clear; a correct/wrong outcome can resolve and auto-advance fast enough to be missed |
| 2 | Match System / Real World | 4 | Vocabulary (Trust Score, Clean/Glitchy, module names) maps directly to the course's AI-ethics terms |
| 3 | User Control and Freedom | 2 | No escape from an opened quiz card before answering (by design — see note below) |
| 4 | Consistency and Standards | 4 | Button/card/shadow/border language applied identically everywhere |
| 5 | Error Prevention | 2 → improved | Stakes weren't signaled before a one-shot scored click; now fixed with on-card copy |
| 6 | Recognition Rather Than Recall | 2 → improved | Tile color meaning wasn't repeated during play; now fixed with a persistent legend |
| 7 | Flexibility and Efficiency | n/a | Single-session casual board game; no power-user path expected |
| 8 | Aesthetic and Minimalist Design | 4 | No gradients/glassmorphism; one consistent flat shadow language |
| 9 | Error Recovery | 2 | No retry/explanation after a wrong answer — an intentional product trade-off, not a bug |
| 10 | Help and Documentation | n/a | The one-time "How to play" screen is the whole (sufficient) help system for this scope |
| **Total** | | **23/32** | **Good** (72%) |

## Design Specificity Verdict

**LLM assessment (Assessment A)**: Reads as authored for this product, not a generic app shell. The Monopoly-derived palette carries real mechanical meaning (blue/green/yellow map to performance/responsible/neutral tile types and to the same Accuracy/Fairness/Transparency trust axes), and the Model Reveal's "creature assembly" — chassis + snapped-in module parts, glitchy parts rendered desaturated/hatched — is a bespoke mechanic tying the AI-ethics theme directly to the visual payoff.

**Deterministic scan (Assessment B + this session's own runs)**: `impeccable detect --json src/App.css src/index.css src/components` — 1 warning (`border-accent-on-rounded`, `.mechanics__card`, line ~1760) + 4 advisories (`bounce-easing`, 4 keyframes). Two additional `side-tab` warnings found in the first scan (title-plate, leaderboard row) were fixed during this session before the second scan; confirmed resolved in both agents' independent re-runs.

**False positive identified**: `.mechanics__card`'s `border-accent-on-rounded` flag persists even after setting `border-radius: 0` (fully square corners, verified in the committed source) — there is no rounded corner left to clash with the border-top accent. This is a detector heuristic limitation (likely keys off co-occurrence of the two properties regardless of the radius's actual value), not a real defect. Not pursued further.

## Overall Impression

A genuinely coherent, original restyle — flat fills, uniform ink outlines, one hard shadow, no gradients/glassmorphism, confirmed by grep (zero leftover old-palette hex values) and by the detector (no slop patterns beyond the one false positive above). The biggest opportunity was accessibility margin on exactly the text/fill pairings the brief called out (yellow and CTA-magenta): three real WCAG AA failures were found and are now fixed.

## What's Working

1. The Model Reveal's creature-assembly sequence (parts snap onto a chassis, glitchy parts render hatched/desaturated) — the single best piece of original art direction, impossible to mistake for a generic trivia app.
2. The flat-fill + single hard offset shadow (`--shadow-hard`) is applied with real discipline across buttons, cards, panels and the board frame — rarer than it sounds, and gives the UI a coherent "object" feel.
3. The "How to play" 2×2 card grid teaches the whole ruleset in one screen using the game's own semantic colors, with no wall of text.

## Priority Issues

**[P1] Three WCAG AA contrast failures in ink-on-accent-fill/text pairings — FIXED.**
Why it matters: the brief explicitly set WCAG AA as the bar and called out exactly this class of pairing (yellow/light-blue fills needing dark ink text). Measured failures: `.roll-button`/`.intro__button`/`.submit-score__button`/`.leaderboard__you-tag` (ink text on solid `--accent-primary` magenta, 4.38:1) and `.model-reveal__eyebrow`/`.title-plate__eyebrow` (magenta text directly on paper, 3.82:1).
Fix applied: added `--accent-primary-cta` (a lightened tint of the given magenta, used only for solid button fills carrying small ink text — now 5.12:1) and converted both "eyebrow" labels to ink-text-on-yellow-fill chips, consistent with the brief's own rule (now 15.71:1). `--ink-muted` was also strengthened from 62%→70% ink after finding it dropped to 4.34:1 (a real failure) against the magenta-tinted active-player row — now 5.52:1 worst case. Command used: `/impeccable harden` (self-applied).

**[P1] Tile color-coding (blue/green/yellow = performance/responsible/neutral) was taught once pre-game and never reinforced during play — FIXED.**
Why it matters: this color language is the visual carrier of the game's core thesis ("ethical modules matter mechanically"); forgetting it mid-session makes the board's color scheme decorative rather than informative.
Fix applied: added a small persistent `BoardLegend` (4 ink-outlined color dots + labels) between the board and the modules panel, always visible during play. Command: `/impeccable clarify` (self-applied).

**[P1] Quiz-card stakes weren't signaled before a one-shot, scored click — partially fixed.**
Why it matters: answering is irreversible by design (wrong answers cost Trust); nothing told the player that before they committed.
Fix applied (in scope for a visual/copy restyle): added a one-line stakes caption on the card face ("Answering locks in your choice — there's no changing it after.").
**Not applied** — flagged instead of silently changed: adding an actual Skip/cancel escape from an opened quiz card would change core game rules (currently, landing on a tile always requires resolving its draw), which is outside a visual restyle's authority. Left for the user to decide separately. Command if wanted: `/impeccable harden`.

**[P2] Quiz resolution can resolve and auto-advance before the outcome is readable.** Not fixed (behavior/timing change, not styling). Command: `/impeccable polish`.

**[P2] Lora heading word-spacing reads uneven at large sizes despite the existing `-0.06em` rule.** Not fixed (typography tuning, not part of the color/shape restyle). Command: `/impeccable typeset`.

**[P3] `.mechanics__card` detector false positive (see above).** No action taken; noted for awareness only.

**[P3] Bounce/elastic easing (4 keyframes: tile-landing-pop, card-pop-in, badge-pop, part-snap) reads as a dated "AI slop" tell per the detector.** Pre-existing from before this restyle; not fixed (would be a motion-design pass, not color/shape). Command: `/impeccable animate` or `/impeccable polish`.

**[P3] Roll button measures 62×39px — under the 44×44 touch-target guideline on narrow viewports.** Minor; not fixed.

## Persona Red Flags

**Jordan (first-timer)**: will forget tile-color meaning once in-game (now mitigated by the board legend); may be surprised starting Trust Scores aren't zero (pre-existing, not a restyle concern).

**Sam (accessibility-dependent)**: the quiz overlay's lack of a pre-answer focus-reachable dismiss is a keyboard-trap risk for a keyboard-only user (same root issue as the P1 above, deliberately not changed — a rules question, not styling); the borderline-AA micro-labels this session found and fixed (`trust-axis__label`, `dice__label`, `tile__code`, intro/model-reveal eyebrows) were exactly the class of text this persona would have struggled with first.

**Riley (stress-tester)**: the resolve-then-auto-advance timing (P2 above) is the most exploitable-feeling seam under rapid play.

## Minor Observations

- Deck tray: the Ethics deck's card-back is orange (`--card-orange`), not green (`--accent-ethics`) — a deliberate, documented choice (deck identity vs. outcome-state color), flagged by Assessment B for awareness; not a bug.
- "No modules yet" empty-state copy is a nice, correctly-muted touch — no changes needed.
- Glitchy module parts sit visually next to clean ones on the same winning creature at the Model Reveal "peak" moment — mechanically honest, but reads a little visually muddy for an otherwise triumphant beat; a cosmetic call, not fixed here.

## Questions to Consider

- Should quiz cards eventually preview their stakes in concrete terms ("Correct: +X Fairness. Wrong: −Y Accuracy.") rather than just a general warning line?
- Is a rules change (an actual Skip/cancel path on quiz cards) something you want considered separately from this visual restyle?
- Should the resolve→auto-advance dwell time be lengthened so a wrong-answer outcome can't be missed on a fast turn?
