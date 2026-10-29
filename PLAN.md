# Plan

## Goal
Help intermediate guitarists turn fretboard knowledge into playing, through a short guided path
(lesson, puzzle, quiz, play-it test) wrapped in a light story. Free, local, open source.

## Why this gap
- Drill apps for notes and intervals already exist and are good. More flashcards are not the gap.
- Intermediate players report: no clear "what next", vague advice, fundamentals hiding under advanced material,
  being stuck in pentatonic boxes, and practice turning into a chore.
- Learning apps are criticised for mishearing the player (note detection), so any mic feature must be forgiving.

## Stop structure (every stop)
1. Lesson (2-3 short steps, taught on the fretboard, with sound)
2. Puzzle (click the fretboard; instant visual feedback)
3. Quiz (written + ear)                      <- planned
4. Play it (audio input on a real guitar)    <- planned

## Done in the prototype
- Night-road map, story intro, Marlow
- Chapter 1: Lowtide (find A), Saltmarsh Junction (the fifth), Harbor Light (three-string major chord)
- Lessons before each puzzle; sandbox for keys and scales
- Plucked-string synth for all sound; progress saved in the browser

## Planned: quizzes (no microphone)
- Types: note on a string, interval by ear, major vs minor by ear, name the chord from a diagram, which shape is a fifth
- About 5 questions per stop; pass mark opens the next stop
- Wrong answer links back to the lesson step that explains it; missed questions return later
- Questions generated from the theory code plus JSON files, so contributors can add content without touching the engine

## Planned: practical quizzes (audio input)
Player is on an **acoustic guitar** (built-in laptop mic or phone mic, no audio interface assumed).

Ladder:
1. Play one named note (any octave accepted at first)
2. Play a root then its fifth
3. Play an arpeggio, one note at a time
4. Strum a chord (experimental; polyphonic detection is much less reliable)
5. Play along with a backing loop and hit chord tones on the changes

Design rules:
- Calibration step; live tuner-style display of what the app hears; "close" feedback instead of pass/fail; free retries
- Request the mic with echo cancellation, noise suppression and auto gain turned off
- Suggest headphones so the backing loop does not leak into the mic
- Pitch detection runs in the browser (YIN or autocorrelation); audio never leaves the device
- Acoustic specifics: strong overtones and string ring-out, so favour clean single notes first, add a noise-gate and a "let it ring" allowance
- Latency differs per device, so play-along timing gets its own calibration

Constraint: the Claude-hosted preview page cannot use a microphone. Practical quizzes need the standalone build
(static site on GitHub Pages or localhost).

## Roadmap
1. Set up the Fretroad repo (name chosen; check GitHub and domain availability first)
2. Split prototype into modules: theory core, audio (synth, pitch), level data (JSON), UI
3. Written and ear quizzes
4. Single-note detection with calibration, tested on generated tones and real acoustic recordings
5. Arpeggios, then chords
6. Chapter 2: the pentatonic box as intervals, then modes
7. Jam Gym: guitar-free backing loops and chord-tone challenges
8. Optional later: Song Lab (load your own song, detect key/tempo, slow down, loop)

## Risks
- Cheap mics, rooms and string ring will cause misreads; mitigate with calibration and forgiving tolerance
- Chord detection will stay less accurate than single notes
- Content needs checking by a teacher or a few players before release

## Open decisions
- License (MIT is the working assumption)
- Story tone: currently calm and slightly wry

## Status (2026-10-29)
Built in the prototype (`prototype/index.html`, open it in a browser, no install):
- Chapter 1: five stops, each with lesson, puzzle and a five-question quiz (four first-try correct to pass)
- 27 practice drills in Beginner / Intermediate / Advanced tiers, see PRACTICE_IDEAS.md
- Chords and scales: open shapes, barre shapes, chord qualities, families, 19 scales and the seven modes
- Mic listening (tuner, play-the-note, chords built one string at a time, scale runner), pitch via YIN, calibrated noise gate
- Metronome from every screen: time signatures, subdivisions, tap tempo
Tested with scripted browser runs including a fake guitar signal fed through the mic. Not yet tested with a real acoustic guitar.
