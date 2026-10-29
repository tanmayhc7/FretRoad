# Fretroad practice ideas, beginner to advanced

Status: ✅ built, 🎤 uses the mic, 🔜 planned.

## Beginner
- ✅ Note Hunt, Name That Fret, Open Strings (names and numbers)
- ✅ Tuner and Mic Check 🎤 (live tuner, needle, nearest string)
- ✅ Play the Note 🎤 (app names a note, you play it)
- ✅ Fifth Finder, Ear Gym (intervals), Octave Jumps, Major or Minor
- ✅ Time Signatures (beats per bar, odd meters, by ear)
- ✅ Tempo and Note Values (bpm to milliseconds, dotted notes, triplets)
- ✅ Strumming Patterns (read a down/up pattern against the count)
- ✅ Open Chord Shapes (name the fingering), Triad Spelling
- ✅ Build the Chord 🎤 (one string at a time, each note verified)
- 🔜 Chord change trainer: switch between two open chords against the metronome, count clean changes per minute
- 🔜 Strumming patterns, playing version: strum the pattern on muted strings against the click
- 🔜 Fretboard memory: timed note finding with a streak
- 🔜 Finger exercises: spider and chromatic walks with a rising tempo

## Intermediate
- ✅ Scale Spelling, Scale Degrees, Scale Ear
- ✅ Scale Runner 🎤 (any key, any of 19 scales, up, down or both, with metronome)
- ✅ Chord Qualities (sus, 7, maj7, m7, dim, aug), Chord Ear, Chord Families, Barre Chord Shapes
- 🔜 Pentatonic box trainer: the five positions, linked by shared notes
- ✅ Triad Inversions (root position, first, second, slash chords)
- ✅ Arpeggio Runner 🎤 (chord tones up and back down, any octave)
- ✅ Circle of Fifths (key signatures, relative minors)
- ✅ Capo and Shapes (which chord sounds with a capo)
- 🔜 Triads on string sets: find each inversion on the neck
- 🔜 Rhythm reading: clap back a rhythm, scored against the click
- 🔜 Timing score for Scale Runner: how close each note lands to the beat
- 🔜 Melody by ear: hear four notes, find them on the neck

## Advanced
- ✅ The Modes, Every Other Scale, Extended Chords, Minor Key Families (incl. seventh-chord families)
- ✅ Colour Chords 🎤 (7th, sus, maj7 shapes string by string)
- 🔜 CAGED system: see one chord shape, find its four siblings up the neck
- 🔜 Modal vamps: backing loop in one chord, play the mode over it
- ✅ Chord-Scale Matching (modes over maj7, m7, 7, m7♭5 and a ii–V–I)
- 🔜 Transcribe by ear: short phrases, find them on the neck
- 🔜 Polyrhythms and odd-meter comping with the metronome
- 🔜 Strum-level chord check 🎤 (whole-chord detection; a working detector already exists in the prototype tests)

## Mic and metronome notes
- Pitch is found with the YIN algorithm on the live mic signal. Nothing is recorded or uploaded.
- Chords are checked one string at a time, as asked, so a buzzing finger shows up as a wrong or missing note.
- Metronome: 30–240 bpm, 2/4, 3/4, 4/4, 5/4, 5/8, 6/8, 7/8 (2+2+3), 9/8, 12/8, subdivisions, tap tempo, accent on beat one. Available from every screen.
- The shared preview page cannot reach the mic, so it falls back to "I played it". Open the standalone `index.html` for full listening.
