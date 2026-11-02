# fretRoad: project context (for new chats and Claude Code projects)

Paste or point a new session at this file to give it the full picture.

## What it is
**fretRoad** is a free, non-commercial, story-driven fretboard-learning web game for intermediate guitarists. Plain HTML, CSS and JavaScript, **no build step, no framework**. Scripts are classic `<script>` tags in `index.html`, so **load order matters**. License AGPL-3.0. Owner: T (software engineer, intermediate acoustic guitarist, GitHub `tanmayhc7`).

- Repo: https://github.com/tanmayhc7/FretRoad
- Live: https://tanmayhc7.github.io/FretRoad/ (GitHub Pages, auto-deploys on push to `main`)
- Standing wish: keep building autonomously, keep code compartmentalised, and at the end list which chapters/areas to playtest.

## Working rules
- `main` is protected by a ruleset: **work on a branch and open a PR**. T merges himself. Open the PR with `gh api repos/tanmayhc7/FretRoad/pulls -f title=... -f head=<branch> -f base=main -f body=...`.
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and a `Claude-Session:` URL line; PR bodies end with the Claude Code line.
- Local CSS/JS links carry a `?v=YYYYMMDDx` cache-buster in `index.html`; **bump it on each release**. `tools/build_standalone.py [--tester]` builds `dist/` and strips it.
- UI rules applied: no boxed pills for simple cues, no eyebrow text above headings, UI/UX Pro Max and Impeccable guidance.

## Structure
- `index.html`, `css/` (songs.css, redesign.css, ...), `js/` (core, views, chapters, levels-ch1..4, drills*, quiz-*, mic, audio, metronome, rhythm, warmup, finger-ex, finder, prefs, tour, backup, tester, profiles, cast, main), `js/songs/` (chords, chart, backing, jam-ui, listen, recording, analysis, tunings, diagram, ocr, songs-ui), `js/ai/` (bring-your-own-model riff helper), `js/stories/` (road, jungle, city), `js/world/` and `js/scenes/` (animated backdrops), `cast/` (TV receiver), `docs/`, `tools/`, `tests/`.
- Save data in `localStorage` (`fretroad-v1`, plus per-profile keys `fretroad-v1-<id>`; profile registry `fretroad-profiles`), recordings in IndexedDB.

## Features (all built)
- **Three stories, same lessons:** night road with Marlow, jungle trail, toddler city. Chapters of stops: lesson, puzzle, quiz, then drills (beginner to advanced). Redesign "a world that wakes as you learn"; scroll cue under each chapter hero.
- **Songs and jam:** chart/chord parsing, backing tracks (BKS: bpm, beats per chord, count-in), jam UI, chord diagrams, OCR import, mp3 recording and analysis (onset/chroma, names chords heard, flags chart chords that do not match: "I hear the written chord on N of M changes").
- **Tunings:** standard and **DADGAD** (chords, backing, riff helper). **Chord finder** in the Sandbox: pick notes on the fretboard, get the chord name.
- **Rhythm:** Strum in Time with a 3-2-1 countdown, an unscored practice bar, then scored bars. Strum Check stays separate.
- **Daily finger exercises:** 10 exercises rotating one per day, 5 minutes, level picker (beginner easy; intermediate adds hammer-ons and pull-offs; advanced harder material), plan and tab shown.
- **Profiles:** Settings > Players. Several players per device, each with own save.
- **Chromecast (Route A):** custom Cast receiver in `cast/` shows lobby, group jam chart and daily exercise; sender is `js/cast.js`. Needs a Cast console Application ID (Settings > TV). Full guide: `docs/CHROMECAST.md`.
- Tour, backup/restore, tester build, prefs (lefty, sound).

## Tests
Playwright (Python) suites in `tests/`, run **sequentially**: ui_core, ui_songs, ui_prefs, ui_tour, ui_chapters, ui_tuning, ui_finder, ui_fingers, ui_recording, ui_ai, ui_rhythm, ui_strum, ui_tester, ui_analysis, ui_profiles, ui_cast, plus `globals.py` (no duplicate globals) and `backup.py`. `window.__FRETROAD_TEST={}` suppresses the auto tour. Known flaky: ui_rhythm's 230 ms-late check for random patterns; ui_songs and ui_tour occasionally fail once and pass on rerun.

## Gotchas learned
- `scroll-behavior:smooth` breaks scroll-dependent tests and the tour; use instant scrolls.
- Wait about 600 ms for localStorage flush before reloading in tests.
- Browser cache hid new deploys until `?v=` was added.
- Fixed-position elements should be at body level.
- Chord text is escaped in `chordDiagram` (was an HTML injection risk on the TV).
- Casting from a web page: Chrome on Android/desktop only, not iOS.

## State of PRs (as of 2026-11-01)
Merged: #7 redesign, #8/#9 scroll cue, #10 cache-busting, #11 Strum in Time countdown, #12 chord naming in mp3 analysis, #13 DADGAD + chord finder + daily exercises. **Open: #14 profiles + Chromecast receiver + these docs.**

## Next up
1. T registers the Cast app (US$5) and tests Route A on a real Chromecast; fix what real hardware reveals.
2. **Route B, Android TV APK:** TV layout and D-pad navigation in the web app; `android/` WebView wrapper with TV banner; GitHub Actions workflow that builds the APK; TV profile picker; phone as optional microphone. Then sideload steps (in `docs/CHROMECAST.md`) and optionally the Play Store ($25).
3. Final playtest list for T after each batch.
