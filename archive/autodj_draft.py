#!/usr/bin/env python3
"""autodj: give it a folder of songs, get back one beat-matched DJ mix.

Pipeline:
  1. analyze  - BPM, beat grid, musical key (Camelot), energy per track
  2. order    - greedy: pick the next track that is closest in tempo/key/energy
  3. match    - time-stretch the incoming track toward the outgoing track's tempo
  4. mix      - beat-aligned equal-power crossfade with a bass swap

Usage:
  python autodj.py ./songs -o mix.wav --xfade-beats 16
"""
import argparse
import sys
from dataclasses import dataclass, field
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
EXTS = {".mp3", ".wav", ".flac", ".m4a", ".ogg", ".aiff", ".aif"}
MAX_STRETCH = 0.08  # never speed up / slow down a track by more than 8%

# Krumhansl-Schmuckler key profiles
MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
# Camelot number for each pitch class (C=0 ...) as major / minor
CAMELOT_MAJOR = [8, 3, 10, 5, 12, 7, 2, 9, 4, 11, 6, 1]
CAMELOT_MINOR = [5, 12, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10]


@dataclass
class Track:
    path: Path
    y: np.ndarray = field(repr=False)          # stereo (2, n)
    bpm: float = 0.0
    beats: np.ndarray = field(default=None, repr=False)  # beat times in seconds
    camelot: tuple = (1, "B")
    energy: float = 0.0
    eff_bpm: float = 0.0                       # tempo it will actually play at


def fold_bpm(bpm, ref=None):
    """Resolve half/double-time ambiguity. With ref, pick the multiple closest to ref."""
    if ref is None:
        while bpm < 80: bpm *= 2
        while bpm > 160: bpm /= 2
        return bpm
    return min((bpm * 0.5, bpm, bpm * 2), key=lambda b: abs(b - ref))


def analyze(path: Path) -> Track:
    y, _ = librosa.load(path, sr=SR, mono=False)
    if y.ndim == 1:
        y = np.stack([y, y])
    mono = librosa.to_mono(y)
    m22 = librosa.resample(mono, orig_sr=SR, target_sr=22050)

    tempo, beat_frames = librosa.beat.beat_track(y=m22, sr=22050, units="frames")
    beats = librosa.frames_to_time(beat_frames, sr=22050)
    bpm = float(np.atleast_1d(tempo)[0])
    # Refine BPM from the median beat interval (more stable than the raw estimate)
    if len(beats) > 8:
        bpm = 60.0 / float(np.median(np.diff(beats)))

    chroma = librosa.feature.chroma_cqt(y=m22, sr=22050).mean(axis=1)
    best, camelot = -2, (1, "B")
    for pc in range(12):
        for prof, letter, table in ((MAJOR, "B", CAMELOT_MAJOR), (MINOR, "A", CAMELOT_MINOR)):
            r = np.corrcoef(chroma, np.roll(prof, pc))[0, 1]
            if r > best:
                best, camelot = r, (table[pc], letter)

    energy = float(np.mean(librosa.feature.rms(y=m22)))
    return Track(path, y, bpm, beats, camelot, energy, fold_bpm(bpm))


def key_distance(a, b):
    """0 = same key, 1 = harmonically compatible, 2+ = clashing."""
    (na, la), (nb, lb) = a, b
    ring = min((na - nb) % 12, (nb - na) % 12)
    if la == lb:
        return ring              # 0 same, 1 neighbour on the wheel
    return 1 if ring == 0 else ring + 1  # relative major/minor is compatible


def transition_cost(cur: Track, nxt: Track, energies):
    bpm_n = fold_bpm(nxt.bpm, cur.eff_bpm)
    pct = abs(bpm_n - cur.eff_bpm) / cur.eff_bpm
    cost = pct * 100                                   # 1 point per 1% tempo change
    if pct > MAX_STRETCH:
        cost += 50                                     # would need an audible stretch
    cost += key_distance(cur.camelot, nxt.camelot) * 1.5
    cost += abs(cur.energy - nxt.energy) / (energies.max() + 1e-9) * 4
    return cost


def order_tracks(tracks):
    energies = np.array([t.energy for t in tracks])
    # Start with the calmest track so the set can build
    cur = min(tracks, key=lambda t: t.energy)
    cur.eff_bpm = fold_bpm(cur.bpm)
    remaining = [t for t in tracks if t is not cur]
    out = [cur]
    while remaining:
        nxt = min(remaining, key=lambda t: transition_cost(cur, t, energies))
        remaining.remove(nxt)
        out.append(nxt)
        # tempo the next one will play at, after stretching toward the current tempo
        natural = fold_bpm(nxt.bpm, cur.eff_bpm)
        target = np.clip(cur.eff_bpm, natural * (1 - MAX_STRETCH), natural * (1 + MAX_STRETCH))
        nxt.eff_bpm = float(target)
        cur = nxt
    return out


def stretch_to(track: Track):
    """Time-stretch the track so it plays at track.eff_bpm. Returns (audio, beats)."""
    natural = fold_bpm(track.bpm, track.eff_bpm)
    rate = track.eff_bpm / natural                     # >1 = faster
    if abs(rate - 1) < 0.002:
        return track.y, track.beats
    y = librosa.effects.time_stretch(track.y, rate=rate)
    return y, track.beats / rate


def split_bands(y, cutoff=200):
    sos = butter(4, cutoff, btype="low", fs=SR, output="sos")
    low = sosfilt(sos, y, axis=-1)
    return low, y - low


def crossfade(a, b, n):
    """a's last n samples blend into b's first n. Bass swap: low end hands over at the midpoint."""
    t = np.linspace(0, 1, n)
    eq_in, eq_out = np.sin(t * np.pi / 2), np.cos(t * np.pi / 2)        # equal power
    swap = (t > 0.5).astype(float)
    swap = np.convolve(swap, np.ones(256) / 256, mode="same")           # click-free
    a_low, a_hi = split_bands(a[:, -n:])
    b_low, b_hi = split_bands(b[:, :n])
    mixed = a_hi * eq_out + b_hi * eq_in + a_low * (1 - swap) + b_low * swap
    return mixed


def render(ordered, xfade_beats):
    prepared = [stretch_to(t) for t in ordered]
    mix, mix_beats_offset = None, 0.0
    for i, (y, beats) in enumerate(prepared):
        if mix is None:
            mix = y.copy()
            out_beats = beats.copy()                    # beat times in mix timeline
            continue
        spb = float(np.median(np.diff(out_beats[-16:])))
        n_beats_avail = min(xfade_beats, len(beats) - 1)
        # Where in the mix does the incoming track's first beat land? A beat near the end.
        k = max(0, len(out_beats) - xfade_beats - 1)
        start_time = out_beats[k]
        # incoming begins at its first beat -> shift so that beat sits on start_time
        in_start = beats[0]
        y_in = y[:, int(in_start * SR):]
        start = int(start_time * SR)
        n = min(int(xfade_beats * spb * SR), mix.shape[1] - start, y_in.shape[1])
        n = max(n, 1)
        pre = mix[:, :start]
        blend = crossfade(mix[:, start:start + n], y_in[:, :n], n)
        mix = np.concatenate([pre, blend, y_in[:, n:]], axis=1)
        new_beats = start_time + (beats[beats >= in_start] - in_start)
        out_beats = np.concatenate([out_beats[out_beats < start_time], new_beats])
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix = mix * (0.98 / peak)
    return mix


def main():
    ap = argparse.ArgumentParser(description="Auto-DJ a folder of songs into one mix")
    ap.add_argument("folder")
    ap.add_argument("-o", "--output", default="mix.wav")
    ap.add_argument("--xfade-beats", type=int, default=16, help="crossfade length in beats")
    args = ap.parse_args()

    files = sorted(p for p in Path(args.folder).iterdir() if p.suffix.lower() in EXTS)
    if len(files) < 2:
        sys.exit("Need at least 2 audio files in the folder.")

    tracks = []
    for p in files:
        print(f"Analyzing {p.name} ...", flush=True)
        t = analyze(p)
        print(f"   BPM {t.bpm:6.1f}  key {t.camelot[0]}{t.camelot[1]}  energy {t.energy:.3f}")
        tracks.append(t)

    ordered = order_tracks(tracks)
    print("\nSet order:")
    for i, t in enumerate(ordered, 1):
        print(f" {i:2d}. {t.path.name:40s} {t.bpm:6.1f} -> plays at {t.eff_bpm:6.1f} BPM  "
              f"{t.camelot[0]}{t.camelot[1]}")

    print("\nRendering mix ...", flush=True)
    mix = render(ordered, args.xfade_beats)
    sf.write(args.output, mix.T, SR)
    print(f"Wrote {args.output} ({mix.shape[1] / SR / 60:.1f} min)")


if __name__ == "__main__":
    main()
