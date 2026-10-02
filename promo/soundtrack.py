"""Саундтрек для промо-ролика «Хамелеон»: музыка и звуки синтезируются с нуля (без сэмплов и чужих треков).

Запуск:  python3 promo/soundtrack.py  ->  promo/soundtrack.wav (28.2 c, 44.1 кГц, стерео)
Затем:   ffmpeg -i promo/chameleon-promo.mp4 -i promo/soundtrack.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k out.mp4

Тайминги событий совпадают с таймлайном в promo/index.html (B2…B7, S5…S7).
"""
import os

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
DUR = 28.2
N = int(DUR * SR)
rng = np.random.default_rng(7)

# таймлайн ролика (см. index.html)
B2, B3, B4, B5, B6, B7 = 4.0, 8.35, 12.55, 17.0, 20.3, 24.35
S5, S6, S7 = B5 + 0.82, B6 + 1.05, B7 + 0.45
T2 = B2 + 0.45
T_UFA = T2 + 0.85

BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4


def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_ad(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype='band', fs=SR, output='sos')
    return sosfilt(sos, x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


class Bus:
    def __init__(self):
        self.l = np.zeros(N + SR * 3)
        self.r = np.zeros(N + SR * 3)

    def add(self, sig, at, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i < 0:
            sig, i = sig[-i:], 0
        n = min(len(sig), len(self.l) - i)
        if n <= 0:
            return
        gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
        self.l[i:i + n] += sig[:n] * gl
        self.r[i:i + n] += sig[:n] * gr

    def stereo(self):
        return np.stack([self.l[:N], self.r[:N]])


# ───────────────────────────── инструменты ─────────────────────────────

def kick(vel=1.0):
    t = t_arr(0.45)
    f = 48 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t / 0.004) * 0.25
    return (body + click) * vel


def clap(vel=1.0):
    t = t_arr(0.35)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) / (0.008 if k < 2 else 0.12))
    return bp(n, 900, 5000) * e * 0.6 * vel


def hat(vel=1.0, open_=False):
    t = t_arr(0.25 if open_ else 0.06)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t / (0.08 if open_ else 0.018)) * 0.35 * vel


def shaker(vel=1.0):
    t = t_arr(0.08)
    e = np.minimum(t / 0.02, 1) * np.exp(-t / 0.03)
    return bp(rng.standard_normal(len(t)), 5000, 12000) * e * 0.25 * vel


def snare(vel=1.0):
    t = t_arr(0.25)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.5
    noise = bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t / 0.09)
    return (tone + noise) * 0.5 * vel


def crash(vel=1.0):
    t = t_arr(2.2)
    n = hp(rng.standard_normal(len(t)), 4500) * np.exp(-t / 0.7)
    return n * 0.35 * vel


def bass_note(m, dur, vel=1.0):
    t = t_arr(dur + 0.05)
    f = midi_hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.minimum(t / 0.006, 1) * np.exp(-t / 0.35)
    e[int(dur * SR):] *= np.linspace(1, 0, len(e) - int(dur * SR))
    return np.tanh(x * 1.4) * e * 0.42 * vel


def marimba(m, vel=1.0):
    t = t_arr(0.9)
    f = midi_hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.28) + 0.25 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t / 0.05) + 0.06 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t / 0.015)
    x *= np.minimum(t / 0.002, 1)
    return x * 0.32 * vel


def glock(m, vel=1.0, decay=1.1):
    t = t_arr(decay * 2.2)
    f = midi_hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / decay) + 0.35 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / (decay * 0.35)) + 0.15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t / (decay * 0.12))
    x *= np.minimum(t / 0.001, 1)
    return x * 0.22 * vel


def pluck(m, dur=0.6, vel=1.0, bright=0.5):
    """Карплус–Стронг: звук щипковой струны (укулеле/гитара)."""
    f = midi_hz(m)
    p = int(SR / f)
    n = int(dur * SR)
    buf = rng.uniform(-1, 1, p)
    buf = lp(buf, 2000 + 6000 * bright, 1) if p > 12 else buf
    out = np.zeros(n)
    idx = 0
    damp = 0.996
    for i in range(n):
        v = buf[idx]
        nxt = buf[(idx + 1) % p]
        buf[idx] = damp * 0.5 * (v + nxt)
        out[i] = v
        idx = (idx + 1) % p
    e = np.ones(n)
    tail = int(0.04 * SR)
    e[-tail:] = np.linspace(1, 0, tail)
    return out * e * 0.6 * vel


def pad(notes, dur, vel=1.0):
    t = t_arr(dur + 0.6)
    x = np.zeros(len(t))
    for m in notes:
        f = midi_hz(m)
        for det in (-0.12, 0.0, 0.11):
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * 2 ** (det / 12)
            # мягкий «пилообразный» тембр из первых гармоник
            for h in range(1, 7):
                x += np.sin(2 * np.pi * ff * h * t + ph * h) / h
    x = lp(x, 1800, 2)
    e = np.minimum(t / 0.35, 1)
    e[int(dur * SR):] *= np.linspace(1, 0, len(e) - int(dur * SR))
    return x * e * 0.018 * vel


# ───────────────────────────── звуки (SFX) ─────────────────────────────

def whoosh(dur=0.8, f0=300, f1=4000, vel=1.0, rev=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # фильтр с плавающей частотой (state-variable filter)
    fc = f0 * (f1 / f0) ** (t / dur)
    if rev:
        fc = fc[::-1]
    low = band = 0.0
    q = 0.55
    out = np.zeros(n)
    for i in range(n):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        low += f * band
        high = noise[i] - low - q * band
        band += f * high
        out[i] = band
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    if rev:
        shape = (t / dur) ** 2
    return out * shape * 0.5 * vel


def pop(f0=420, f1=1100, vel=1.0, dur=0.12):
    t = t_arr(dur)
    f = f0 + (f1 - f0) * (1 - np.exp(-t / 0.018))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035)
    return x * 0.5 * vel


def boing(vel=1.0):
    t = t_arr(0.6)
    f = 180 + 260 * (1 - np.exp(-t / 0.08)) + 40 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.25)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * np.minimum(t / 0.004, 1)
    return x * 0.45 * vel


def tick(vel=1.0, f=2600):
    t = t_arr(0.03)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.006) * 0.3 * vel


def impact(vel=1.0):
    t = t_arr(1.4)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t / 0.06)) / SR) * np.exp(-t / 0.35)
    crunch = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.05) * 0.6
    return np.tanh((boom + crunch) * 1.6) * 0.7 * vel


def thud(vel=1.0):
    t = t_arr(0.3)
    x = np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.09)
    return x * 0.5 * vel


def riser(dur, vel=1.0):
    t = t_arr(dur)
    noise = hp(rng.standard_normal(len(t)), 1500)
    sweep = np.sin(2 * np.pi * np.cumsum(300 * 2 ** (3 * t / dur)) / SR) * 0.25
    return (noise * 0.4 + sweep) * (t / dur) ** 2.2 * 0.45 * vel


def sparkle(base=84, n=6, step=0.045, vel=1.0):
    scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]
    out = np.zeros(int((n * step + 1.5) * SR))
    for k in range(n):
        g = glock(base + scale[k % len(scale)], vel=0.7, decay=0.5)
        i = int(k * step * SR)
        out[i:i + len(g)] += g[: len(out) - i]
    return out * vel


# ───────────────────────────── музыка ─────────────────────────────
music = Bus()
drums = Bus()

C, G, Am, F = (60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)
ROOT = {C: 36, G: 43, Am: 45, F: 41}

# по тактам (2 с): интро C G, основная часть C G Am F ×2, спад Am F→G, финал C G | F G → C
bars = [C, G, C, G, Am, F, C, G, Am, F, Am, F, C, F]
half = {11: (F, G), 12: (C, G), 13: (F, G)}

kicks = []

for b, chord in enumerate(bars):
    t0 = b * BAR
    if t0 >= 27.0:
        break
    parts = half.get(b, (chord, chord))
    # пэд
    for k, ch in enumerate(parts):
        st = t0 + k * BAR / 2
        if st < 27.0:
            music.add(pad([m + 12 for m in ch], BAR / 2 if parts[0] != parts[1] else BAR, vel=1.0 if b >= 2 else 0.8), st, 1.0, 0)
        if parts[0] == parts[1]:
            break
    if b < 2:
        # интро: колокольчики-арпеджио
        for s in range(8):
            ch = parts[0]
            m = [ch[0] + 24, ch[1] + 24, ch[2] + 24, ch[1] + 24][s % 4]
            music.add(glock(m, vel=0.55 + 0.1 * (s % 2 == 0)), t0 + s * BEAT / 2, 1.0, 0.35 if s % 2 else -0.35)
        continue
    in_break = b in (10,)
    for s in range(8):  # восьмые
        st = t0 + s * BEAT / 2
        if st >= 27.0:
            break
        ch = parts[0] if s < 4 else parts[1]
        # маримба: бегущее арпеджио
        arp = [ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[0] + 12, ch[2]]
        music.add(marimba(arp[s] + 12, vel=0.8 if s % 2 == 0 else 0.6), st, 0.9, -0.3)
        # бас: прыгающие октавы
        if not in_break or s % 4 == 0:
            r = ROOT[ch]
            music.add(bass_note(r + (12 if s % 4 == 3 else 0), BEAT / 2 * 0.9, vel=1.0 if s % 2 == 0 else 0.8), st, 1.0, 0)
        # барабаны
        if s % 2 == 0:
            beat = s // 2
            if not in_break:
                drums.add(kick(1.0 if beat % 2 == 0 else 0.85), st, 1.0, 0)
                kicks.append(st)
            if beat in (1, 3):
                drums.add(clap(), st, 0.9, 0.05)
        else:
            drums.add(hat(0.9, open_=(s == 7 and b % 2 == 1)), st, 0.8, 0.25)
        drums.add(shaker(0.6), st + BEAT / 4, 0.7, -0.4)

# интро: шейкер со второго такта и барабанная дробь перед дропом
for k in range(8):
    drums.add(shaker(0.5 + 0.05 * k), 2.0 + k * BEAT / 2 + BEAT / 4, 0.7, -0.4)
roll_n = 16
for k in range(roll_n):
    drums.add(snare(0.25 + 0.75 * k / roll_n), 3.0 + k * (1.0 / roll_n), 0.8, 0.1)
# дробь перед финалом
for k in range(8):
    drums.add(snare(0.3 + 0.6 * k / 8), 23.0 + k * 0.125, 0.75, 0.1)
drums.add(crash(1.0), B2, 0.8, -0.2)
drums.add(crash(0.8), 24.0, 0.8, 0.2)

# мелодия (щипковая струна), сетка — восьмые; None — пауза
phrase_a = [
    [76, None, 79, None, 81, 79, 76, None],  # C
    [74, None, 79, None, 83, 81, 79, None],  # G
    [72, 76, 81, None, 79, 76, 72, None],  # Am
    [81, 79, 77, None, 76, 74, None, None],  # F
]
phrase_b = [
    [76, None, 79, None, 84, 83, 81, None],
    [79, None, 74, None, 79, 81, 83, None],
    [84, 83, 81, None, 79, 76, 81, None],
    [77, None, 76, None, 74, 72, 74, None],
]
for p_i, phrase in enumerate((phrase_a, phrase_b)):
    for bi, notes in enumerate(phrase):
        t0 = (2 + p_i * 4 + bi) * BAR
        for s, m in enumerate(notes):
            if m is None:
                continue
            music.add(pluck(m, dur=0.55, vel=0.95, bright=0.6), t0 + s * BEAT / 2, 1.0, 0.15)
# спад (20–24 с): редкие колокольчики
for k, m in enumerate([81, 84, 88, 86, 84, 81, 77, 79]):
    music.add(glock(m, vel=0.6, decay=0.9), 20.0 + k * BEAT, 0.9, 0.3 if k % 2 else -0.3)
# финал (24–27 с)
outro = [(24.0, 76), (24.25, 79), (24.5, 84), (25.0, 83), (25.25, 79), (25.5, 74), (26.0, 81), (26.25, 77), (26.5, 79), (26.75, 83)]
for st, m in outro:
    music.add(pluck(m, dur=0.5, vel=1.0, bright=0.7), st, 1.0, 0.15)
# финальный аккорд
END = 27.0
drums.add(kick(1.1), END, 1.0, 0)
drums.add(crash(1.1), END, 0.9, 0)
for m in (48, 60, 64, 67, 72, 76, 79, 84):
    music.add(pluck(m, dur=1.2, vel=0.8, bright=0.5), END + (m - 48) * 0.004, 0.8, 0.1)
music.add(pad([60, 64, 67, 72], 0.8), END, 1.3, 0)
music.add(bass_note(36, 1.0, 1.0), END, 1.0, 0)
music.add(glock(96, vel=0.7, decay=1.2), END, 0.8, 0.2)
kicks.append(END)

# ───────────────────────────── звуки по таймлайну ─────────────────────────────
sfx = Bus()
# сцена 1: маскот, «Привет!», логотип
sfx.add(boing(1.0), 0.15, 0.9, 0)
sfx.add(whoosh(0.5, 400, 2500, 0.6), 0.05, 0.7, 0)
for k, at in enumerate([0.35, 0.45, 0.5, 0.55, 0.62, 0.75, 0.9]):
    sfx.add(pop(380 + 60 * k, 900 + 80 * k, 0.35), at + 0.15, 0.6, [-0.6, 0.6, 0.7, -0.7, 0.3, -0.2, 0.1][k])
sfx.add(pop(500, 1400, 0.9), 0.88, 0.8, 0.3)
for k in range(7):
    sfx.add(tick(0.35, 2200 + 120 * k), 0.98 + k * 0.035, 0.6, 0.3)
sfx.add(whoosh(0.7, 250, 3000, 0.8), 2.0, 0.8, -0.4)
sfx.add(whoosh(0.45, 800, 6000, 0.6), 2.3, 0.6, 0.2)
sfx.add(sparkle(84, 7, 0.04, 0.9), 2.82, 0.6, 0.2)
sfx.add(pop(450, 1200, 0.7), 3.25, 0.7, 0)
sfx.add(riser(1.0, 0.8), 3.0, 0.8, 0)
# переход 1: круг + текст
sfx.add(whoosh(0.95, 200, 5000, 1.2), B2 - 0.1, 0.9, 0)
for k in range(7):
    sfx.add(pop(600 + 40 * k, 1300, 0.25), T2 + 0.15 + k * 0.04, 0.5, -0.3)
for k in range(10):
    sfx.add(pop(650 + 35 * k, 1400, 0.22), T2 + 0.45 + k * 0.035, 0.5, 0.3)
sfx.add(whoosh(0.4, 3000, 400, 0.7), T_UFA, 0.7, 0)
sfx.add(impact(1.0), T_UFA + 0.4, 0.95, 0)
sfx.add(crash(0.7), T_UFA + 0.4, 0.5, 0)
sfx.add(whoosh(0.6, 600, 5000, 0.6), T_UFA + 0.4, 0.6, 0.4)
sfx.add(pop(500, 1300, 0.7), T_UFA + 0.9, 0.6, 0)
for k, at in enumerate([0.2, 0.35, 1.1, 1.3, 1.6, 1.8]):
    sfx.add(pop(420 + 50 * k, 1000, 0.3), T2 + at + 0.15, 0.5, [-0.6, 0.6, -0.7, 0.7, -0.5, 0.5][k])
# переход 2: диагональные шторки + полароиды
for k, d in enumerate([0, 0.09, 0.18]):
    sfx.add(whoosh(0.7, 300 + 200 * k, 4500, 0.7), B3 - 0.05 + d, 0.7, -0.5 + 0.5 * k)
for k in range(9):
    sfx.add(whoosh(0.28, 1200, 6000, 0.35), B3 + 0.38 + k * 0.085, 0.5, -0.6 + 0.15 * k)
    sfx.add(thud(0.35), B3 + 0.38 + k * 0.085 + 0.4, 0.5, -0.6 + 0.15 * k)
sfx.add(pop(380, 1000, 0.8), B3 + 0.6, 0.7, 0)
sfx.add(whoosh(1.0, 150, 7000, 1.1), B4 - 0.75, 0.9, 0)  # пролёт сквозь фото
# тарифы: карточки, иконки, счётчики, блик
for k, (col, row) in enumerate([(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (2, 1)]):
    st = B4 + 0.55 + (col + row) * 0.1 + row * 0.05
    pan = -0.6 + 0.6 * col
    sfx.add(whoosh(0.35, 900, 3500, 0.35), st, 0.5, pan)
    sfx.add(pop(520 + 70 * k, 1300 + 60 * k, 0.6), st + 0.32, 0.6, pan)
for k in range(22):  # «докручивание» цен
    at = B4 + 1.0 + 1.3 * (1 - np.exp(-k / 6.0))
    sfx.add(tick(0.45 * (1 - k / 26), 2400 + 30 * (k % 5)), at, 0.6, 0)
sfx.add(sparkle(88, 8, 0.07, 0.6), B4 + 2.6, 0.55, 0.4)
# переход 4: клей-капля и орбита допуслуг
sfx.add(whoosh(0.9, 120, 2200, 1.1), B5 - 0.1, 0.9, 0)
sfx.add(boing(0.6), B5 + 0.4, 0.5, 0)
penta = [72, 74, 76, 79, 81, 84]
for i in range(6):
    sfx.add(pop(midi_hz(penta[i]) * 0.6, midi_hz(penta[i]), 0.7), S5 + 0.2 + i * 0.09, 0.6, [-0.7, -0.4, 0, 0.4, 0.7, 0.2][i])
    sfx.add(glock(penta[i] + 12, 0.35, 0.5), S5 + 0.25 + i * 0.09, 0.5, 0)
sfx.add(whoosh(0.5, 4000, 300, 0.8, rev=True), B6 - 0.35, 0.7, 0)
# переход 5: занавес, карточки, звёзды
for i in range(6):
    st = B6 + abs(i - 2.5) * 0.06
    sfx.add(whoosh(0.5, 2500, 300, 0.35), st, 0.4, -0.7 + 0.28 * i)
    sfx.add(thud(0.6), st + 0.75, 0.6, -0.7 + 0.28 * i)
sfx.add(whoosh(0.6, 400, 4000, 0.6), S6, 0.6, -0.5)
sfx.add(whoosh(0.6, 400, 4000, 0.6), S6 + 0.12, 0.6, 0.5)
sfx.add(pop(450, 1200, 0.6), S6 + 0.35, 0.6, -0.4)
sfx.add(pop(500, 1300, 0.6), S6 + 0.5, 0.6, 0.4)
for i in range(5):
    sfx.add(glock(84 + [0, 4, 7, 12, 16][i], 0.7, 0.6), S6 + 0.6 + i * 0.085, 0.7, 0.4)
for i in range(3):
    sfx.add(pop(420, 900, 0.35), S6 + 0.65 + i * 0.16, 0.5, -0.5)
# переход 6: финал
sfx.add(whoosh(0.9, 200, 6000, 1.1), B7 - 0.1, 0.9, 0)
sfx.add(boing(0.9), S7 + 0.05, 0.8, -0.3)
sfx.add(sparkle(84, 8, 0.05, 0.8), S7 + 0.4, 0.6, 0.3)
for k in range(13):
    sfx.add(pop(600 + 25 * k, 1300, 0.2), S7 + 0.7 + k * 0.035, 0.45, 0.2)
sfx.add(pop(380, 1000, 1.0), S7 + 1.1, 0.8, 0.2)
sfx.add(whoosh(0.4, 1500, 5000, 0.4), S7 + 1.3, 0.5, -0.2)
sfx.add(whoosh(0.4, 1500, 5000, 0.4), S7 + 1.42, 0.5, -0.1)
for at in (S7 + 2.0, S7 + 2.55, S7 + 3.1):  # пульс кнопки
    if at < DUR - 0.9:
        sfx.add(glock(91, 0.35, 0.4), at, 0.45, 0.2)

# ───────────────────────────── сведение ─────────────────────────────
mus = music.stereo()
drm = drums.stereo()
fx = sfx.stereo()

# сайдчейн: бас/пэд/маримба приседают под бочку
duck = np.ones(N)
dt = t_arr(0.18)
dcurve = 1 - 0.35 * np.exp(-dt / 0.06)
for k in kicks:
    i = int(k * SR)
    n = min(len(dcurve), N - i)
    if n > 0:
        duck[i:i + n] = np.minimum(duck[i:i + n], dcurve[:n])
mus *= duck

# реверберация (общая шина)
ir_t = t_arr(1.6)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45) for _ in range(2)])
ir[:, : int(0.012 * SR)] = 0
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
send = mus * 0.22 + fx * 0.18 + drm * 0.05
wet = np.stack([fftconvolve(lp(send[c], 6000), ir[c])[:N] for c in range(2)]) * 0.5

def _db(x):
    return 20 * np.log10(np.sqrt(np.mean(x[:, int(4 * SR):int(20 * SR)] ** 2)) + 1e-9)


print(f'RMS 4–20 c: музыка {_db(mus):.1f} dB, барабаны {_db(drm):.1f} dB, звуки {_db(fx):.1f} dB')
mix = mus * 0.95 + drm * 0.6 + fx * 1.0 + wet
mix = hp(mix, 30)
# фейд в конце
fade = int(0.9 * SR)
mix[:, -fade:] *= np.linspace(1, 0, fade) ** 1.5
# мягкий лимитер
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25) * 0.93

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'soundtrack.wav')
pcm = (mix.T * 32767).astype(np.int16)
import wave

with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('saved', out, f'{DUR}s')
