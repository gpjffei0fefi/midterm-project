# Demo Checklist (5 minutes)

**Live URL:** https://build-a-brain-co-ten.vercel.app

Share and present only this URL. Each deployment's own unique `*.vercel.app` URL sits behind a Vercel login, and the old `build-a-brain-co.vercel.app` still shows an older version of the game.

All fallbacks below point to screenshots that exist in this repo. The top-level `screenshots/*.png` files show the older dark color scheme; the game mechanics in them are the same.

## Before you present

- [ ] Open the live URL in a **private / incognito window** (no old saved game, no cached build).
- [ ] Play one quick game: Play → Continue → Local Multiplayer → 2 players → Start game, roll a few times, answer a card.
- [ ] Click **View leaderboard** and confirm it loads with scores (not an error).
- [ ] **Delete any test rows** in the Supabase dashboard (Table Editor → `leaderboard`), including `deploy-check` (score 41).
- [ ] **Set up the Model Reveal in advance** (a full 3-lap game takes too long to play live): in a separate normal window on the live URL, start a **Hard (preview)** game and play until "Lap 3 of 3", then leave it. The game autosaves after every turn; reloading that window shows "Resume your game?" → **Resume**.
- [ ] Keep `screenshots/` open in a file browser in case you need a fallback.

## The click-path

**1. Start menu (≈30 s)**
Open the live URL → **Play** → read the one-screen "How to play" → **Continue**. Show the four modes: Local Multiplayer, Online Multiplayer ("Coming next" — not built yet), Hard Mode ("Hard (preview)"), AI Mode.
*Fallback:* `screenshots/start-menu/start-menu.jpg` (and `screenshots/start-menu/online-coming-next.jpg` if asked about Online).

**2. One local game (≈45 s)**
**Local Multiplayer** → **2** → **Continue** → names and token colors → **Start game**. Point out the 16-space board, the lap counter, and the Trust readouts (Accuracy / Fairness / Transparency). Click **Roll**.
*Fallback:* `screenshots/restyle/board.jpg`.

**3. A quiz card (≈45 s)**
Land on an unowned module or a "Draw Math Card" / "Draw Ethics Card" space; the card flips face-up. Read it, pick an answer, and show the trust bars move (correct = gain, wrong = penalty). Answers lock in once picked.
*Fallback:* `screenshots/restyle/quiz-card.jpg` (or `screenshots/card-draw.png`).

**4. A landing fee (≈45 s)**
Keep rolling for both players. Once one player owns a module and the other lands on it, the visitor pays the owner a trust fee: a technical module (e.g. Data Pipeline) moves **Accuracy**, a responsible one (e.g. Bias Audit) moves its ethics axis (**Fairness**). This depends on the dice — if it hasn't happened after two or three rolls, use the fallback.
*Fallback:* `screenshots/landing-fee-responsible.png` and `screenshots/landing-fee-irresponsible.png`.

**5. Hard (preview) (≈30 s)**
Back to the start menu (reload → **Start New** → Play → Continue) → **Hard Mode** → show the setup text → **Start game**. Explain: you vs. the toughest built-in AI, labeled as a preview. **Do not describe it as searching the web** — the search agent is built but turned off, and this mode does not use it.
*Fallback:* `screenshots/start-menu/start-menu.jpg` (shows the "Hard (preview)" badge).

**6. The Model Reveal (≈45 s)**
Switch to the window prepared beforehand (Hard (preview) game at lap 3) → **Resume** if prompted → roll until the game ends. Each player's modules snap onto their robot, then the highest Trust Score is announced as the winner — more modules does not mean a win.
*Fallback:* `screenshots/restyle/model-reveal.jpg` or `screenshots/start-menu/end-screen-4-players.jpg`.

**7. The leaderboard (≈30 s)**
Under the reveal: type a name → **Submit score** → the leaderboard opens with your row highlighted. (Or click **View leaderboard** at any time.) Remember to delete this row afterwards if it was only for the demo.
*Fallback:* `screenshots/live/leaderboard-after-submit.jpg` (taken on the live URL; it still shows the `deploy-check` test row) or `screenshots/leaderboard.png`.

## If something goes wrong

- **Leaderboard shows an error:** the game keeps working without it; say the shared scores live in Supabase and show the fallback screenshot.
- **The page won't load at all:** run the game locally (`npm install`, then `npm run dev`) and use the screenshots above.
- **A "Resume your game?" prompt appears unexpectedly:** choose **Start New** for a fresh game.
