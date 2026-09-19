# Build-A-Brain Co.

A browser-based board game built for the MATH 10 Final Project on the theme **"Mathematics and AI: Shaping a Responsible and Inclusive Future"** (2027 International Day of Mathematics theme).

## Concept

Players assemble an AI system by acquiring modules — Data Pipeline, Compute Cluster, Bias Audit, Explainability Layer, Privacy Filter, Model Deployment — while looping a small custom game board. Each module is paid for not with cash, but by correctly answering a math or AI-ethics quiz card. Owning irresponsible modules costs opponents "trust points" when they land on them, while ethical modules cost little — so the game mechanically rewards responsible AI development over raw accumulation.

The project aims to test mathematical and AI ethics proficiency while promoting responsible AI development, turning abstract math concepts (probability, rates, weighted scoring) into interactive play, and showing that "better" AI isn't the same as "more accurate" AI.

## How to play

1. Roll and move around the board.
2. Landing on an unowned module: answer a quiz card from the matching deck (Math or Ethics) to acquire it.
3. Landing on an opponent's module: pay a "landing fee" — larger if the module is ethically weak, small if it's responsible.
4. Landing on a neutral space: draw a card for a flat trust bonus or penalty.
5. After a set number of laps, the game ends and shows the **Model Reveal** screen — each player's modules are composited into one illustrated creature, alongside their final Trust Score and an Accuracy / Fairness / Transparency breakdown.
6. Highest Trust Score wins — not most modules owned.

## Features

- Custom 12–16 space game board with AI-module spaces and neutral spaces
- Monopoly-style dice roll and token movement animation
- Math and Ethics quiz decks (15–20 cards each, custom-written by the team)
- Live Trust Score with a three-part breakdown (Accuracy, Fairness, Transparency)
- Simulated AI opponent(s) with tier-based answer accuracy
- End-game "Model Reveal" screen compositing each player's modules into an illustrated creature
- Save/resume for an in-progress game (per device, via localStorage)
- *(Optional)* Cross-device leaderboard for comparing scores across players

## Tech stack

- Plain React (frontend only, no custom backend for core gameplay)
- *(Optional)* Firebase or Supabase for the shared leaderboard
- Built with Claude Code

## Setup

```bash
# clone the repository
git clone https://github.com/gpjffei0fefi/midterm-project.git
cd midterm-project

# install dependencies
npm install

# run locally
npm run dev
```

Open the local address shown in your terminal to play.

## Project structure

See `DOCUMENTATION.md` for a full breakdown of the codebase, core systems, and setup details kept current with the actual build.

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
