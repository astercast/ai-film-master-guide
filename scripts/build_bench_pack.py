#!/usr/bin/env python3
"""Build the bench pack (rotation 22, closing T-FILM-3): downloadable
editor assets as actual files, generated deterministically with the
standard library only (fixed seed, no clocks), so any rebuild
reproduces every file byte for byte.

Contents, one per class the gap names:
  LUTs (.cube, 17^3)      real per-point color transforms
  transitions (.png)      luma-wipe mattes, the gradient images an
                          editor loads as a transition matte
  letterbox (.png)        RGBA mattes: black bars, clear middle
  SFX (.wav)              synthesized: a noise-sweep whoosh and a
                          tape-stop pitch drop

Output: assets/packs/bench-pack/ (copied to site/assets by the site
build like every other asset). Nothing here is scraped, sampled, or
third-party: every byte is computed below.
"""
import math
import random
import struct
import wave
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets" / "packs" / "bench-pack"

# ---------------------------------------------------------------- LUTs

def cube_lut(name, title, fn, size=17):
    lines = [f'TITLE "{title}"', f"LUT_3D_SIZE {size}",
             "DOMAIN_MIN 0.0 0.0 0.0", "DOMAIN_MAX 1.0 1.0 1.0"]
    for b in range(size):
        for g in range(size):
            for r in range(size):
                rr, gg, bb = fn(r / (size - 1), g / (size - 1), b / (size - 1))
                lines.append(f"{rr:.6f} {gg:.6f} {bb:.6f}")
    (OUT / name).write_text("\n".join(lines) + "\n")

def _clamp(x):
    return min(1.0, max(0.0, x))

def _scurve(x, amt):
    # Blend toward the smoothstep S-curve by amt.
    return _clamp(x * (1 - amt) + (3 * x * x - 2 * x * x * x) * amt)

def lut_tungsten(r, g, b):
    # Warm grade: shadows lean amber, highlights stay creamy, gentle S.
    r, g, b = _scurve(r, 0.25), _scurve(g, 0.25), _scurve(b, 0.25)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sh = 1.0 - lum
    r = _clamp(r + 0.055 * sh - 0.010 * lum)
    g = _clamp(g + 0.018 * sh)
    b = _clamp(b - 0.045 * sh + 0.012 * lum)
    return r, g, b

def lut_daylight(r, g, b):
    # Clean daylight answer print: cool shadows, neutral whites, mild contrast.
    r, g, b = _scurve(r, 0.18), _scurve(g, 0.18), _scurve(b, 0.18)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sh = 1.0 - lum
    r = _clamp(r - 0.030 * sh)
    g = _clamp(g - 0.006 * sh)
    b = _clamp(b + 0.038 * sh)
    return r, g, b

def lut_ember_night(r, g, b):
    # Low-key night: crushed blacks, teal shadows against amber highlights.
    r, g, b = _scurve(r, 0.45), _scurve(g, 0.45), _scurve(b, 0.45)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sh = max(0.0, 1.0 - lum * 1.6)
    hi = max(0.0, lum - 0.55)
    r = _clamp(r * 0.94 + 0.075 * hi)
    g = _clamp(g * 0.97 + 0.028 * sh)
    b = _clamp(b * 1.02 + 0.055 * sh)
    return r, g, b

# ---------------------------------------------------------------- PNGs

def _png_chunk(kind, data):
    c = struct.pack(">I", len(data)) + kind + data
    return c + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

def write_png(name, w, h, pixel):
    """pixel(x, y) -> (r, g, b, a) bytes tuple. Filter-none rows."""
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            raw += bytes(pixel(x, y))
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    data = (b"\x89PNG\r\n\x1a\n" + _png_chunk(b"IHDR", ihdr)
            + _png_chunk(b"IDAT", zlib.compress(bytes(raw), 9))
            + _png_chunk(b"IEND", b""))
    (OUT / name).write_bytes(data)

def _smooth(t):
    return t * t * (3 - 2 * t)

def wipe_linear(x, y, w=480, h=270):
    v = int(255 * (x / (w - 1)))
    return (v, v, v, 255)

def wipe_soft(x, y, w=480, h=270):
    t = (x * 0.8 + y * 0.6) / (w * 0.8 + h * 0.6)
    v = int(255 * _smooth(min(1.0, max(0.0, t))))
    return (v, v, v, 255)

def letterbox(ratio_w, ratio_h):
    W, H = 1920, 1080
    inner_h = int(W * ratio_h / ratio_w)
    top = (H - inner_h) // 2
    def px(x, y):
        return (0, 0, 0, 255) if (y < top or y >= top + inner_h) else (0, 0, 0, 0)
    return W, H, px

def pillarbox(ratio_w, ratio_h):
    W, H = 1920, 1080
    inner_w = int(H * ratio_w / ratio_h)
    left = (W - inner_w) // 2
    def px(x, y):
        return (0, 0, 0, 255) if (x < left or x >= left + inner_w) else (0, 0, 0, 0)
    return W, H, px

# ---------------------------------------------------------------- WAVs

SR = 44100

def write_wav(name, samples):
    frames = b"".join(struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767))
                       for s in samples)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames)

def sfx_whoosh(dur=0.7):
    rng = random.Random(2207)
    n = int(SR * dur)
    out, lp = [], 0.0
    for i in range(n):
        t = i / n
        env = math.sin(math.pi * t) ** 1.5
        # one-pole lowpass whose cutoff sweeps up then down with the pass
        alpha = 0.02 + 0.55 * math.sin(math.pi * t)
        lp += alpha * (rng.uniform(-1, 1) - lp)
        out.append(lp * env * 1.9)
    return out

def sfx_tape_stop(dur=0.8):
    n = int(SR * dur)
    out, phase = [], 0.0
    for i in range(n):
        t = i / n
        freq = 240.0 * (1.0 - t) ** 2 + 38.0
        phase += 2 * math.pi * freq / SR
        env = (1.0 - t) ** 1.4
        out.append(math.sin(phase) * env * 0.55
                   + math.sin(phase * 2.01) * env * 0.18)
    return out

# ---------------------------------------------------------------- main

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cube_lut("cutting-room-tungsten.cube", "Cutting Room Tungsten", lut_tungsten)
    cube_lut("daylight-answer.cube", "Daylight Answer", lut_daylight)
    cube_lut("ember-night.cube", "Ember Night", lut_ember_night)
    write_png("wipe-linear.png", 480, 270, wipe_linear)
    write_png("wipe-soft.png", 480, 270, wipe_soft)
    w, h, px = letterbox(239, 100)
    write_png("letterbox-239.png", w, h, px)
    w, h, px = letterbox(185, 100)
    write_png("letterbox-185.png", w, h, px)
    w, h, px = pillarbox(4, 3)
    write_png("letterbox-43.png", w, h, px)
    write_wav("sfx-whoosh.wav", sfx_whoosh())
    write_wav("sfx-tape-stop.wav", sfx_tape_stop())
    for f in sorted(OUT.iterdir()):
        print(f"{f.name}\t{f.stat().st_size}")

if __name__ == "__main__":
    main()
