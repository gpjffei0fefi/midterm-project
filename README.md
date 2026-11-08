# Build-A-Brain Co.

A browser-based board game built for the MATH 10 Final Project on the theme **"Mathematics and AI: Shaping a Responsible and Inclusive Future"** (2027 International Day of Mathematics theme).

**Play it live:** https://build-a-brain-co-ten.vercel.app

## Concept

Players assemble an AI system by acquiring modules — Data Pipeline, Compute Cluster, Bias Audit, Explainability Layer, Privacy Filter, Model Deployment — while looping a 16-space board. A module isn't bought with cash: you earn it by correctly answering a quiz card. The winner is whoever built the most *trustworthy* AI, not the biggest one, so the game mechanically rewards responsible AI development over raw accumulation.

The project aims to test mathematical and AI-ethics proficiency, turn abstract math (probability, rates, weighted scoring) into interactive play, and show that "better" AI isn't the same as "more accurate" AI.

## The quiz decks

- **Math Deck** — 18 cards on the math behind machine learning (dot products, derivatives, gradients, matrices, softmax, PCA), four options each.
- **Ethics Deck** — 20 two-option dilemmas about AI in a Philippine setting (BPO automation, deepfakes, data privacy, disaster relief, indigenous data rights).

Each deck deals from a shuffled pile with no repeats until every card has been drawn once. The questions live in one CSV file, `src/data/quiz-questions.csv`.

## Trust Score

**Trust Score = Accuracy + Fairness + Transparency.** Every player starts at 25 on each axis. Math answers and technical modules move Accuracy; ethics answers and responsible modules (Bias Audit, Explainability Layer, Privacy Filter) also move Fairness or Transparency. Each axis is shown live as a bar, and the highest total at the end wins — module count doesn't matter.

## How to play

1. Roll and move around the board.
2. **Unowned module:** answer a quiz card to acquire it. A wrong answer costs trust.
3. **Your own module:** answer a follow-up card. Miss it and the module turns *glitchy* and costs you trust.
4. **Someone else's module:** pay them a landing fee in trust. A technical module's fee moves Accuracy; a responsible module's fee moves its own ethics axis.
5. **Neutral Ethics / Math spaces:** draw a card for a small trust bonus or penalty.
6. After 3 laps (or once every module is owned), the **Model Reveal** builds each player's modules into an illustrated robot and shows the final Trust Scores.

## Game modes

| Mode | What it is |
|---|---|
| **Local Multiplayer** | 2-4 players on one device, pass-and-play, no AI. Each player picks a name and token color. |
| **AI Mode** | 2-4 total players: you plus 1-3 simulated AIs at fixed skill levels (70%, 50% and 30% chance of answering correctly). |
| **Hard Mode — "Hard (preview)"** | You against one AI at the toughest of those levels, labeled "Hard (preview)". See below. |
| **Online Multiplayer — "Coming next"** | **Not built.** The menu shows it with a "Coming next" badge, and its room screen has every control disabled. |

### About Hard (preview)

Hard Mode currently uses the same tier-based AI as AI Mode, at its toughest setting, and is labeled as a preview. It makes no network calls and does not search the web.

A web-searching AI opponent for Hard Mode **is built and unit-tested, but disabled** (`HARD_MODE_AGENT_ENABLED = false` in `src/data/gameRules.js`). The live test on 2026-11-08 found that:

1. `gemini-2.5-flash`, the model it was written for, is deprecated and returns a 404 to new users, and
2. per Google's pricing page as we read it on 2026-11-08, Google Search grounding on the suggested replacement, `gemini-3.8-flash`, is not available on the free tier. (The pricing page contradicts itself on this; see `DOCUMENTATION.md`.)

The agent has never answered a question live. Turning it on needs a working model, billing for search grounding, and a fresh live test.

## Features

- 16-space board with illustrated module spaces and neutral spaces, animated dice and token movement
- Math and Ethics quiz decks with no-repeat draws
- Live Trust Score with an Accuracy / Fairness / Transparency breakdown
- Start menu with Local, AI and Hard (preview) modes for 2-4 players
- End-of-game Model Reveal that builds each player's modules into a robot, with tie handling
- Save and resume for an in-progress game (per browser, via `localStorage`), and Play Again
- Shared online leaderboard of final Trust Scores (Supabase)

## Tech stack

- **React + Vite** for the game itself. All gameplay runs in the browser.
- **Supabase** (Postgres, called through its REST API with plain `fetch`) for the optional shared leaderboard.
- **One Vercel serverless route**, `api/opponent.js`, for the Hard Mode agent (Gemini via `@google/genai`). It is deployed, but the shipped game never calls it while the agent is disabled.
- **Vitest** for tests, **oxlint** for linting.
- Hosted on **Vercel**. Built with Claude Code.

## Setup

Requirements: Node.js (a recent LTS) and npm.

```bash
git clone https://github.com/gpjffei0fefi/midterm-project.git
cd midterm-project
npm install
npm run dev      # local dev server
npm test         # run the test suite
npm run build    # production build to dist/
```

The game runs with no configuration. To turn on the leaderboard locally, copy `.env.example` to `.env.local` and fill in these variables (names only shown here — never commit real values):

| Variable | Needed? |
|---|---|
| `VITE_SUPABASE_URL` | Yes, for the leaderboard |
| `VITE_SUPABASE_ANON_KEY` | Yes, for the leaderboard (the public "anon" key only, never `service_role`) |
| `GEMINI_API_KEY` | Only if the Hard Mode agent is re-enabled. Server-side only; never prefix it with `VITE_` |

The one-time database setup is in `supabase/leaderboard.sql`.

## Deploying

The live site is https://build-a-brain-co-ten.vercel.app, a Vercel project in the owner's personal scope. **GitHub is not connected to the Vercel project, so pushing does not deploy.** Redeploy by hand from the repo root:

```bash
vercel deploy --prod
```

`VITE_` variables are baked in at build time, so set them in Vercel (Production) **before** deploying, and redeploy after changing one. The old URL, `build-a-brain-co.vercel.app`, still shows an older version of the game and is not maintained.

## Project structure

See `DOCUMENTATION.md` for the full breakdown of the codebase, every core system, the Hard Mode agent and its live-test result, and deployment details.

## Project team

| Name | Role |
|------|------|
| _[fill in]_ | Game design / mechanics |
| _[fill in]_ | Development |
| _[fill in]_ | Digital art / illustration |
| _[fill in]_ | Quiz content (Math deck) |
| _[fill in]_ | Quiz content (Ethics deck) |
| _[fill in]_ | Testing |
| _[fill in]_ | Documentation / presentation |

## Theme alignment

This project connects to MATH 10's course goals by demonstrating mathematics as a tool for understanding and evaluating AI systems — specifically how weighted scoring, probability, and rate calculations can be used to measure not just an AI's accuracy, but its fairness and transparency. It fuses game design, illustration, and quantitative reasoning to make discussions of responsible AI development accessible to a general audience.

## License

Original work created for MATH 10, 1st Semester A.Y. 2026-2027. Not affiliated with or based on any copyrighted board game.
