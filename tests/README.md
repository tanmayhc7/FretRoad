# Tests

They drive the real page in a headless Chromium with Playwright (`pip install playwright && playwright install chromium`, plus `numpy` for the audio fixtures).

```bash
cd tests
python3 mkwav.py            # one-off: generates fake guitar recordings in tests/out/
python3 ui_core.py          # chapter 1, quizzes, drills, metronome, mobile layout
python3 ui_mic.py           # mic: tuner, chords string by string, scale runner
python3 ui_arpeggio.py      # arpeggio runner fed a C arpeggio
python3 ui_chapters.py      # every stop of chapters 2 to 4: puzzle, quiz, story switch, unlocking
python3 stress_quizzes.py   # thousands of generated questions per quiz type, plus answer checks
```

Set `FR_PAGE=/path/to/other.html` to test the bundled single-file build instead of `index.html`.
