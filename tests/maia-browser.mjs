import { createServer } from 'node:http'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { MAIA_EXPRESSIONS } from '../dist/maia/index.js'

const root = process.cwd()
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.webp': 'image/webp', '.css': 'text/css' }
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/fixture.html') {
      res.setHeader('Content-Type', 'text/html')
      res.end('<!doctype html><html><body><div style="height:1800px"></div><maia-mascot idle="false" id="bird"></maia-mascot><script type="module" src="/web/maia.js"></script></body></html>')
      return
    }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname))
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return }
    const data = await readFile(file)
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.end(data)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' })
const checks = [], errors = []
const check = name => { checks.push(name); console.log(`PASS ${name}`) }
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('pageerror', error => errors.push(error.message))
  const images = []
  page.on('request', req => { if (req.url().endsWith('.webp')) images.push(req.url()) })
  await page.goto(`${base}/web/index.html`)
  const bird = page.getByRole('button', { name: 'Boop the Māia', exact: true })
  const state = page.locator('maia-mascot [data-maia-state]')
  await bird.waitFor()
  assert.equal(new Set(images).size, 2)
  assert.ok(images.every(url => /\/(directions|reactions)-/.test(url)))
  check('Standalone HTML loads only direction/reaction sheets initially')
  await page.locator('maia-mascot').evaluate(element => { element.setAttribute('idle', 'false'); element.setAttribute('reduced-motion', ''); element.setAttribute('paused', '') })
  for (const name of MAIA_EXPRESSIONS) {
    await page.getByLabel('Explore all expressions').selectOption(name)
    await page.waitForFunction(name => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]')?.dataset.maiaState === name, name)
    assert.ok(await bird.getAttribute('data-sheet'))
  }
  assert.equal(new Set(images).size, 5)
  check('All 28 expressions play through the plain HTML element')
  await page.locator('maia-mascot').evaluate(element => { element.removeAttribute('reduced-motion'); element.removeAttribute('paused') })
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.getByRole('button', { name: 'Celebrate', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Celebrating')
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Idle')
  await page.getByRole('button', { name: 'Play again', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Celebrating')
  check('Animations complete and the same expression can replay')
  await page.getByRole('button', { name: 'Hide Māia', exact: true }).click()
  await page.waitForTimeout(100)
  const hiddenBird = page.locator('maia-mascot button[data-sheet]')
  const frozen = await hiddenBird.getAttribute('data-frame')
  await page.waitForTimeout(350)
  assert.equal(await hiddenBird.getAttribute('data-frame'), frozen)
  await page.getByRole('button', { name: 'Show Māia', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Idle')
  check('Hiding pauses playback; showing resumes')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await bird.focus(); await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Heart')
  await page.waitForTimeout(650)
  await page.keyboard.press('Space')
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Sparkle')
  check('Keyboard activation retains native boop reactions')
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  for (let i = 0; i < 4; i++) await bird.click()
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Dizzy')
  check('Four rapid clicks retain dizzy behavior')
  const count = new Set(images).size
  await page.getByRole('button', { name: 'Say hello', exact: true }).click()
  await page.waitForTimeout(100)
  assert.equal(new Set(images).size, count)
  check('Previously decoded artwork is reused')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Celebrate', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Celebrating')
  const still = await bird.getAttribute('data-frame')
  await page.waitForTimeout(600)
  assert.equal(await bird.getAttribute('data-frame'), still)
  check('System reduced motion presents a still pose')
  await page.locator('maia-mascot').evaluate(element => element.setAttribute('paused', ''))
  await page.getByRole('button', { name: 'Say hello', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('maia-mascot').shadowRoot.querySelector('[data-maia-state]').dataset.maiaState === 'Welcoming')
  await mkdir('maia-evidence', { recursive: true })
  await page.screenshot({ path: 'maia-evidence/web-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
  await page.screenshot({ path: 'maia-evidence/web-mobile.png', fullPage: true })
  check('390px example has no horizontal overflow')
  const deferred = await browser.newPage()
  const deferredImages = []
  deferred.on('request', req => { if (req.url().endsWith('.webp')) deferredImages.push(req.url()) })
  await deferred.goto(`${base}/fixture.html`)
  await deferred.waitForFunction(() => customElements.get('maia-mascot'))
  await deferred.waitForTimeout(100)
  assert.equal(deferredImages.length, 0)
  await deferred.locator('maia-mascot').scrollIntoViewIfNeeded()
  await deferred.getByRole('button', { name: 'Boop the Māia', exact: true }).waitFor()
  assert.equal(new Set(deferredImages).size, 2)
  check('An offscreen companion defers all artwork until visible')
  await deferred.locator('maia-mascot').evaluate(element => { element.remove(); document.body.append(element) })
  await deferred.getByRole('button', { name: 'Boop the Māia', exact: true }).waitFor()
  check('Removing and reconnecting the custom element cleans up and restores it')
  const failed = await browser.newPage()
  await failed.route('**/directions-*.webp', route => route.abort())
  await failed.goto(`${base}/web/index.html`)
  await failed.getByRole('button', { name: 'Retry Māia artwork', exact: true }).waitFor()
  await failed.unroute('**/directions-*.webp')
  await failed.getByRole('button', { name: 'Retry Māia artwork', exact: true }).click()
  await failed.getByRole('button', { name: 'Boop the Māia', exact: true }).waitFor()
  check('Initial network failure has a working retry')
  assert.equal(await state.count(), 1)
  assert.deepEqual(errors, [])
  check('No browser runtime errors')
} finally {
  await browser.close()
  await new Promise(resolve => server.close(resolve))
  await mkdir('maia-evidence', { recursive: true })
  await writeFile('maia-evidence/package-browser-results.json', JSON.stringify({ checks, errors }, null, 2))
}
