# Промо-ролик «Хамелеон»

`chameleon-promo.mp4` — 28,2 c, 1920×1080, 30 fps, со звуком (−14 LUFS).

- Видео: `index.html` (анимации) + `render.mjs` (покадровый рендер в Chromium → ffmpeg).
- Звук: `soundtrack.py` — музыка (120 BPM, до мажор) и звуки переходов синтезируются с нуля, без сэмплов и чужих треков; тайминги совпадают с таймлайном `index.html`.

```bash
PLAYWRIGHT_CORE=<path>/node_modules/playwright-core/index.mjs node promo/render.mjs --frames-dir /tmp/frames --workers 4
python3 promo/soundtrack.py   # -> promo/soundtrack.wav
ffmpeg -i promo/chameleon-promo.mp4 -i promo/soundtrack.wav -map 0:v -map 1:a -c:v copy \
  -af "volume=-2.6dB" -c:a aac -b:a 192k -movflags +faststart -shortest promo/out.mp4
```
