#!/usr/bin/env node
// Deterministic frame-by-frame renderer for promo/index.html.
//
// Usage:
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core/index.mjs \
//   node promo/render.mjs [--frames-dir DIR] [--out promo/chameleon-promo.mp4] [--workers 3]
//   node promo/render.mjs --shots 0.5,1,2.5 --frames-dir DIR      (single frames only)
//
// Every animation on the page lives on one global timeline: window.PROMO.seek(t)
// sets all Web Animations to t, runs per-frame tickers and seeks the <video> tags.
// We step t = i / fps, take a JPEG screenshot per frame and encode with ffmpeg.

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true])
    return acc
  }, []),
)

const FPS = Number(args.fps || 30)
const FRAMES = path.resolve(args['frames-dir'] || path.join(os.tmpdir(), 'chameleon-promo-frames'))
const OUT = path.resolve(args.out || path.join(here, 'chameleon-promo.mp4'))
const WORKERS = Number(args.workers || 3)
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium'

const pwPath = process.env.PLAYWRIGHT_CORE
const { chromium } = await import(pwPath ? pathToFileURL(pwPath).href : 'playwright-core')

// --- tiny static server -----------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.webm': 'video/webm', '.mp4': 'video/mp4',
}
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const file = path.join(here, url === '/' ? 'index.html' : url)
  if (!file.startsWith(here) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end(); return
  }
  const stat = fs.statSync(file)
  const type = MIME[path.extname(file)] || 'application/octet-stream'
  const range = req.headers.range
  if (range) { // videos need byte ranges to seek
    const [s, e] = range.replace('bytes=', '').split('-')
    const start = Number(s), end = e ? Number(e) : stat.size - 1
    res.writeHead(206, {
      'Content-Type': type, 'Accept-Ranges': 'bytes',
      'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1,
    })
    fs.createReadStream(file, { start, end }).pipe(res)
  } else {
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Accept-Ranges': 'bytes' })
    fs.createReadStream(file).pipe(res)
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}/index.html?render=1`

fs.mkdirSync(FRAMES, { recursive: true })
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars', '--force-color-profile=srgb'],
})

async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()) })
  page.on('pageerror', (e) => console.error('[pageerror]', e.message))
  await page.goto(base, { waitUntil: 'load' })
  await page.waitForFunction(() => window.PROMO && window.PROMO.ready === true, null, { timeout: 60000 })
  return page
}

async function shoot(page, t, file) {
  await page.evaluate((tt) => window.PROMO.seek(tt), t)
  await page.screenshot({ path: file, type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1920, height: 1080 } })
}

const probe = await openPage()
const DURATION = await probe.evaluate(() => window.PROMO.duration)

if (args.shots) {
  const times = String(args.shots).split(',').map(Number)
  for (const t of times) {
    const f = path.join(FRAMES, `shot_${t.toFixed(2)}.jpg`)
    await shoot(probe, t, f)
    console.log(f)
  }
  await browser.close(); server.close(); process.exit(0)
}

const total = Math.round(DURATION * FPS)
console.log(`Rendering ${total} frames (${DURATION}s @ ${FPS}fps) with ${WORKERS} workers -> ${FRAMES}`)
const pages = [probe]
for (let i = 1; i < WORKERS; i++) pages.push(await openPage())

let next = 0, done = 0
const t0 = Date.now()
await Promise.all(pages.map(async (page) => {
  while (true) {
    const i = next++
    if (i >= total) break
    await shoot(page, i / FPS, path.join(FRAMES, `f_${String(i).padStart(5, '0')}.jpg`))
    if (++done % 60 === 0) console.log(`${done}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`)
  }
}))
await browser.close(); server.close()

if (args['no-encode']) process.exit(0)
const ff = spawnSync('/usr/bin/ffmpeg', [
  '-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(FRAMES, 'f_%05d.jpg'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-movflags', '+faststart', '-r', String(FPS), OUT,
], { stdio: 'inherit' })
if (ff.status !== 0) process.exit(ff.status)
console.log('Wrote', OUT)
