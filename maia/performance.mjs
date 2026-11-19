import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const result = { checks: [] }
const evidence = process.env.EVIDENCE_DIR || 'maia-evidence'
try {
  const page = await browser.newPage()
  const images = [], errors = []
  page.on('request', r => { if (r.resourceType() === 'image') images.push(r.url()) })
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(process.env.WIDGET_URL || 'http://127.0.0.1:4320/maia-widget-build/widget.html')
  const bird = page.getByRole('button', { name: 'Boop the Māia', exact: true })
  await bird.waitFor()
  console.log('Initial image requests:', images)
  assert.equal(images.length, 2)
  assert.ok(images.every(src => /(?:directions|reactions)-/.test(src)))
  result.initialImages = images.slice()
  result.checks.push('Only two small sheets requested initially; no studio assets')
  const client = await page.context().newCDPSession(page)
  await client.send('Performance.enable')
  const metric = async () => Object.fromEntries((await client.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]))
  const before = await metric()
  await page.waitForTimeout(2000)
  const after = await metric()
  result.idleObservation = { seconds: 2, taskDurationMs: (after.TaskDuration - before.TaskDuration) * 1000, scriptDurationMs: (after.ScriptDuration - before.ScriptDuration) * 1000, note: 'Single local headless Edge observation with auto-idle disabled; not an end-user benchmark or baseline comparison.' }
  await page.getByRole('button', { name: 'Curious', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-sheet=expressions]'))
  assert.equal(images.length, 3)
  result.checks.push('Curious loads expressions only on demand')
  await page.getByRole('button', { name: 'Reading', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-sheet=behaviours]'))
  assert.equal(images.length, 4)
  result.checks.push('Reading loads behaviours only on demand')
  await page.getByRole('button', { name: 'Scratch', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-sheet=actions]'))
  assert.equal(images.length, 5)
  // Freeze a live sequence while its reserved area is off-screen.
  await page.evaluate(() => scrollTo(0, 1000))
  await page.waitForTimeout(100)
  const frozen = await bird.getAttribute('data-frame')
  await page.waitForTimeout(500)
  assert.equal(await bird.getAttribute('data-frame'), frozen)
  await page.evaluate(() => scrollTo(0, 0))
  await page.waitForFunction(() => document.querySelector('[data-sheet=directions]'))
  result.checks.push('Offscreen playback pauses and resumes')
  await page.getByRole('button', { name: 'Curious', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-sheet=expressions]'))
  assert.equal(images.length, 5)
  result.checks.push('Previously loaded sheets are reused')
  await page.getByRole('button', { name: 'Reading', exact: true }).click()
  await page.getByRole('button', { name: 'Scratch', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('[data-sheet=actions]'))
  result.checks.push('Last requested action wins when interrupting')
  assert.deepEqual(errors, [])
  const sizes = JSON.parse(await readFile('maia/assets/delivery-sizes.json', 'utf8'))
  const small = sizes.filter(item => item.file.includes('-small'))
  result.artwork = { initialBytes: small.slice(0, 2).reduce((n, x) => n + x.bytes, 0), allBytes: small.reduce((n, x) => n + x.bytes, 0), initialDecodedRGBABytes: 2 * 576 * 576 * 4, allDecodedRGBABytes: 5 * 576 * 576 * 4 }
  const jsFiles = (await readdir('maia-widget-build/assets')).filter(name => name.endsWith('.js'))
  result.javascript = await Promise.all(jsFiles.map(async name => { const data = await readFile(`maia-widget-build/assets/${name}`); return { file: name, bytes: data.length, gzipBytes: gzipSync(data).length, includes: 'React, React DOM, companion, fixture controls' } }))
  result.errors = errors
} finally { await browser.close() }
await mkdir(evidence, { recursive: true })
await writeFile(`${evidence}/performance.json`, JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
