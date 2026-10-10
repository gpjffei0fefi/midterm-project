# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are college students playing together in a class setting, for a
MATH 10 final project ("Mathematics and AI: Shaping a Responsible and
Inclusive Future," the 2027 International Day of Mathematics theme). A second,
equally material audience is the teacher grading the submission: they read the
board, the quiz cards, and the Model Reveal screen to evaluate both the math
content and the craft of the build, not just play it start to finish.

## Product Purpose

Build-A-Brain Co. is a browser-based board game that turns math and AI-ethics
concepts (probability, rates, weighted scoring) into interactive play.
Players assemble an AI system by acquiring modules — Data Pipeline, Compute
Cluster, Bias Audit, Explainability Layer, Privacy Filter, Model Deployment —
paid for by correctly answering a Math or Ethics quiz card, not cash. Success
means a player (and a grader) comes away having exercised real quiz content
and seeing, mechanically, that a "better" AI isn't the same as a "more
accurate" one.

## Positioning

The mechanism a generic trivia board game could not copy: owning an
ethically-weak module costs *opponents* a landing fee when they land on it,
while an ethical module costs little — so the board itself, not just the quiz
content, rewards responsible AI development over raw module accumulation.
Winning is decided by a three-axis Trust Score (Accuracy, Fairness,
Transparency), not by who owns the most modules.

## Operating Context

Played in a browser, no install, no login. A full game is one human player
against two simulated AI opponents (tier-based answer accuracy), looping a
fixed board until a lap count or full module ownership ends it. The session
can be saved and resumed on the same device (localStorage); an optional
cross-device leaderboard exists when a Supabase backend is configured.
Evaluation happens both live (someone plays it) and by inspection (the
teacher reads the board, cards, and end screen as submitted coursework).

## Capabilities and Constraints

- React + Vite, frontend-only; no backend required for core gameplay.
- Custom 12–16-space board; Math and Ethics quiz decks (15–20 cards each,
  custom-written), each dealt without repeats until the deck is exhausted.
- Landing on a module: acquire via quiz (unowned), a follow-up quiz that can
  flag it "glitchy" (owned by the mover), or a trust-fee transfer (owned by
  someone else).
- Trust Score = Accuracy + Fairness + Transparency, each floored at 0.
- Game end: a tie across two or more players is a real, displayed outcome
  (not resolved arbitrarily to a single winner).
- Optional Supabase leaderboard; absent its two env vars, no leaderboard UI
  renders at all.
- Deployed as a static build (currently Vercel).

## Brand Commitments

Name: "Build-A-Brain Co." Must not copy Hasbro's Monopoly trade dress:
no pale-green felt + red banner lockup, no "Chance"/"Community Chest"
wording, no top-hat mascot. A Monopoly-like board *palette* is the stated
reference point, but the resulting look must be original.

## Evidence on Hand

Existing illustrated module/chassis art (clean and glitchy states per
module), existing Math/Ethics CSV quiz content, existing README.md and
DOCUMENTATION.md describing the built mechanics in detail. No team-member
names, no screenshots beyond what's in `/screenshots`, no user-testing data —
future work should not invent any of these.

## Product Principles

1. The board's economics, not just its trivia, must visibly reward ethical
   play — a module's ethics weight has real mechanical teeth.
2. The game must read clearly to two different audiences at once: a student
   mid-session, and a teacher grading the finished artifact.
3. Trust Score is the single source of truth for winning; module count is
   flavor, never the tiebreaker.
4. Keep the build dependency-light and backend-optional — the game must
   fully work with nothing configured beyond `npm install`.
5. Visual identity may draw on the Monopoly-like board-game genre but must
   stay legally and visually its own thing, not a reskin.

## Accessibility & Inclusion

No standard (e.g. WCAG level) has been required by the assignment, but this
session's restyle work targets WCAG AA body-text contrast as a chosen bar for
the new palette, per explicit instruction.
